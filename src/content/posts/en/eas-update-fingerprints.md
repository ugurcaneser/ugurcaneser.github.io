---
title: Budgetory only ships JavaScript updates to builds that can run them
description: How a React Native app uses native fingerprints, a file of recorded store builds and a guarded publish script so that an over-the-air update never reaches a build it wasn't made for.
date: 2026-10-22
project: budgetory
tags: [Expo, React Native, EAS Update, Release, Tooling]
---

Budgetory is a personal finance app for iOS and Android, built with Expo and React Native. Since version 1.4.0, release builds ask EAS Update for newer JavaScript every time they start, so a fix in JavaScript no longer has to wait for a store release and its review.

An over-the-air update is just a new JavaScript bundle, though, and a bundle only works on top of the native code it was written for. An update that expects a native module the installed build doesn't have fails on the phone, not when it's published. This post covers how Budgetory prevents that: what the runtime version is made of, how the builds that actually shipped get recorded, and the script that refuses to publish when either side doesn't match.

## The runtime version is a fingerprint

EAS Update only delivers an update to builds with the same runtime version. You can set that version by hand, but then it's up to you to remember to bump it with every native change. Budgetory lets expo-updates work it out instead:

```json title="app.json"
"runtimeVersion": {
  "policy": "fingerprint"
},
```

The fingerprint is a hash of everything that ends up in the native side of the app. For the current code, `runtimeversion:resolve` lists 50 sources for iOS and 56 for Android: the whole `ios/` or `android/` folder, the app's own native modules (the document scanner, the home screen widget, quick add), `patches/`, the Expo config, the config plugins and every autolinked native package. An update gets the fingerprint of the code it was published from, and expo-updates writes the same hash into every release build. When the two match, the update fits the build.

```bash
node node_modules/expo-updates/bin/cli runtimeversion:resolve --platform ios --workflow generic
```

## Making the fingerprint reproducible

The fingerprint is calculated twice, on different occasions: once while a build is made and again when an update is published. Anything that differs between those two moments makes the hashes differ, and then a correct update goes to no one. In Budgetory there were a few such files: the Kotlin compiler's session files, which exist only while Gradle runs (expo-updates' own Gradle plugin had them too, so a release APK got the wrong fingerprint), `local.properties` with the Android SDK path of the machine, and editor settings. `fingerprint.config.js` leaves them out:

```js title="fingerprint.config.js"
// A config that fails to load is ignored without a word, which changes the fingerprint: check
// `npx expo-updates fingerprint:generate --platform ios` after editing.
module.exports = {
  sourceSkips: ['PackageJsonScriptsAll', 'GitIgnore'],
  ignorePaths: [
    // Kotlin's compiler keeps a file for each session in the folder of each Gradle build while it
    // runs, such as android/ and expo-updates' Gradle plugin.
    '**/.kotlin/**/*',
    // Where the Android SDK is on this machine.
    '**/android/local.properties',
    // ...
  ],
};
```

Gradle had a second problem. The expo-updates task that writes the fingerprint into the build lists no source files among its inputs, so Gradle considered it up to date and skipped it. A second build then kept the fingerprint of the first one, even if the code had changed in between. The fix is to make it run in every build:

```groovy title="android/app/build.gradle"
// expo-updates' task that writes the fingerprint (the runtime version) and the embedded update's
// manifest into the build lists no source files among its inputs, so Gradle skips it as up to date
// and a build keeps what an earlier build of other code got. Run it in every build.
tasks.configureEach { task ->
    if (task.name ==~ /create\w*UpdatesResources/) {
        task.outputs.upToDateWhen { false }
    }
}
```

## Recording what actually shipped

Matching fingerprints only matter if you know which fingerprints are on phones. A fingerprint alone doesn't say which builds went through review and into the stores, so the repo keeps that list in `scripts/store-runtimes.json`, one entry per store release and platform:

```json title="scripts/store-runtimes.json"
"1.6.0": {
  "ios": {
    "runtimeVersion": "74b875dab5ccb99ed204bca069123626c0993329",
    "commit": "19debca94b003ea49e0774af159226dd2b900d2e"
  },
  "android": {
    "runtimeVersion": "ef3b46596c798c803001d40c6b6a04bf12723d9e",
    "commit": "19debca94b003ea49e0774af159226dd2b900d2e"
  }
}
```

The values aren't copied from a terminal. `scripts/updates.mjs record` reads them out of the build that was uploaded: from the `.xcarchive` on iOS, and from the `.aab` on Android, without even unpacking it:

```js title="scripts/updates.mjs"
// The fingerprint expo-updates wrote into a release build.
const builtFingerprint = (platform, path) => {
  // ...
    if (platform === 'ios') {
      const app = path.endsWith('.xcarchive') ? join(path, 'Products/Applications/Budgetory.app') : path;
      fingerprint = readFileSync(join(app, 'EXUpdates.bundle/fingerprint'), 'utf8');
    } else {
      fingerprint = run('unzip', ['-p', path, path.endsWith('.aab') ? 'base/assets/fingerprint' : 'assets/fingerprint'], {
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    }
  // ...
  if (!/^[0-9a-f]{40}$/.test(fingerprint.trim())) fail(`No fingerprint in ${path}: is it a release build made with expo-updates?`);
  return fingerprint.trim();
};
```

It then compares the build's fingerprint with the one worked out from the code and warns if updates published from here wouldn't reach that build. This is easy to check by hand. At the current commit, the archive and the bundle that went to the stores carry exactly the hashes that `runtimeversion:resolve` gives:

```txt
runtimeversion:resolve ios      74b875dab5ccb99ed204bca069123626c0993329
Budgetory-1.6.0-8.xcarchive     74b875dab5ccb99ed204bca069123626c0993329
runtimeversion:resolve android  ef3b46596c798c803001d40c6b6a04bf12723d9e
Budgetory-1.6.0-22.aab          ef3b46596c798c803001d40c6b6a04bf12723d9e
```

A build made without expo-updates, or a debug build, has no such file, and `record` stops there:

```txt
No fingerprint in .../Fake.app: is it a release build made with expo-updates?
```

## Publishing only when it fits

`node scripts/updates.mjs publish --message "..."` is how updates get published, and it checks several things before anything goes out.

First, the environment. `EXPO_PUBLIC_` values are compiled into the bundle, and for development I point the app at a local Firebase Auth emulator and a local backend in `.env.local`, which wins over `.env`. An update built with that file in place would point every phone at `127.0.0.1`. So the script won't start while it exists. This is what it says on my machine right now:

```txt
.env.local would be built into the update: move it out of the way first.
```

Then git: the tree must be clean and the commit pushed, so that what the phones run is always a commit in the history.

Then the runtime version, per platform. A platform gets the update only if a recorded store build has the code's fingerprint. If none does, the script prints a `git diff --stat` of the native paths since the last recorded build, so that it's clear what changed the native side:

```js title="scripts/updates.mjs"
for (const platform of PLATFORMS) {
  const version = runtimeVersion(platform);
  const releases = Object.keys(runtimes).filter(release => runtimes[release][platform]?.runtimeVersion === version);
  // ...
  if (releases.length) {
    platforms.push(platform);
    continue;
  }
  // What the native side may have been changed by since the last recorded build.
  // ...
}
// ...
if (!platforms.length) {
  fail('No store build has the runtime version of this code: its native side has changed since. Ship it in a store release.');
}
```

Finally the bundle itself. The script exports it fresh with `--clear`, because Metro's cache can hold code built with the local `EXPO_PUBLIC_` values, then scans the output: it must contain no local address and it must contain the production API host and Firebase project.

```js title="scripts/updates.mjs"
const local = LOCAL_STACK.filter(address => bundle.includes(address));
if (local.length) fail(`The ${platform} bundle has ${local.join(', ')} in it.`);
if (!bundle.includes(apiHost) || !bundle.includes(firebaseProject)) fail(`The ${platform} bundle lacks the production API or Firebase project.`);
```

Only then does it call `eas update` with `--skip-bundler`, on the bundle it has just checked. `--dry-run` runs all of this and stops before publishing.

If an update turns out to be bad anyway, `eas update:republish` sends an earlier one again, and `eas update:roll-back-to-embedded` returns phones to the JavaScript their build came with. To see what a phone is running, Settings adds the first eight characters of the update ID to the version line when the app didn't start from the embedded code.

## What it buys, and what it doesn't

The bugs this guards against don't show up when you publish. They show up on users' phones: an update for native code they don't have, or an app that suddenly talks to `127.0.0.1`. With the fingerprint as the runtime version and the shipped fingerprints in git, both are caught by the script before anything is sent.

The trade-off is that the fingerprint is strict. It covers the entire native folder, the app icon and the splash image as well, so plenty of changes that feel small need a store release. The commit history shows this: 1.5.0 needed one for the receipt scanner's native modules and permission strings, and 1.6.0 for following the system's light or dark appearance, because the interface style and the dark splash screens are native. The script can't get around that. What it can do is say so before publishing, instead of an update quietly reaching no one.

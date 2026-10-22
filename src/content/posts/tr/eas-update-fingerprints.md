---
title: Budgetory, JavaScript güncellemelerini yalnızca onları çalıştırabilecek build'lere gönderiyor
description: Bir React Native uygulamasının native fingerprint'ler, mağazaya giden build'lerin kaydı ve korumalı bir yayın script'iyle OTA güncellemelerin yanlış build'e ulaşmasını nasıl engellediği.
date: 2026-10-22
project: budgetory
tags: [Expo, React Native, EAS Update, Sürüm, Araçlar]
---

Budgetory, Expo ve React Native ile yazdığım iOS ve Android için bir kişisel finans uygulaması. 1.4.0 sürümünden beri release build'ler her açılışta EAS Update'e yeni JavaScript olup olmadığını soruyor; yani JavaScript'teki bir düzeltme artık mağaza sürümünü ve incelemesini beklemek zorunda değil.

Ama OTA (over-the-air) güncelleme sonuçta yeni bir JavaScript bundle'ı ve bir bundle ancak yazıldığı native kodun üzerinde çalışır. Kurulu build'de olmayan bir native modülü bekleyen bir güncelleme, yayınlarken değil, telefonda hata verir. Bu yazı Budgetory'nin bunu nasıl önlediğini anlatıyor: runtime version neyden oluşuyor, mağazaya gerçekten giden build'ler nasıl kaydediliyor ve iki taraf uyuşmadığında yayını reddeden script.

## Runtime version bir fingerprint

EAS Update bir güncellemeyi yalnızca aynı runtime version'a sahip build'lere gönderiyor. Bu sürümü elle de verebilirsiniz ama o zaman her native değişiklikte artırmayı hatırlamak size kalıyor. Budgetory bunu expo-updates'e hesaplatıyor:

```json title="app.json"
"runtimeVersion": {
  "policy": "fingerprint"
},
```

Fingerprint, uygulamanın native tarafına giren her şeyin hash'i. Şu anki kod için `runtimeversion:resolve` iOS'ta 50, Android'de 56 kaynak sayıyor: `ios/` ya da `android/` klasörünün tamamı, uygulamanın kendi native modülleri (belge tarayıcı, ana ekran widget'ı, hızlı ekleme), `patches/`, Expo config'i, config plugin'leri ve autolink edilen her native paket. Güncelleme, yayınlandığı kodun fingerprint'ini alıyor; expo-updates de aynı hash'i her release build'in içine yazıyor. İkisi tutuyorsa güncelleme o build'e uyuyor.

```bash
node node_modules/expo-updates/bin/cli runtimeversion:resolve --platform ios --workflow generic
```

## Fingerprint'i tekrarlanabilir yapmak

Fingerprint iki ayrı anda hesaplanıyor: build alınırken ve güncelleme yayınlanırken. Bu iki an arasında farklı olan herhangi bir dosya hash'leri de farklılaştırıyor ve o zaman doğru bir güncelleme hiç kimseye ulaşmıyor. Budgetory'de birkaç böyle dosya vardı: Kotlin derleyicisinin yalnızca Gradle çalışırken var olan oturum dosyaları (expo-updates'in kendi Gradle plugin'inde de vardı, bu yüzden bir release APK yanlış fingerprint almıştı), makinedeki Android SDK yolunu tutan `local.properties` ve editör ayarları. `fingerprint.config.js` bunları dışarıda bırakıyor:

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

Gradle'da ikinci bir sorun vardı. expo-updates'in fingerprint'i build'e yazan task'ı girdileri arasında hiç kaynak dosya listelemiyor, Gradle da onu güncel sayıp atlıyordu. Böylece ikinci build, arada kod değişmiş olsa bile ilkinin fingerprint'iyle kalıyordu. Çözüm, task'ı her build'de çalıştırmak:

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

## Mağazaya ne gittiğini kaydetmek

Fingerprint'lerin tutması, telefonlarda hangi fingerprint'lerin olduğunu biliyorsanız işe yarar. Fingerprint tek başına hangi build'in incelemeden geçip mağazaya çıktığını söylemiyor; bu yüzden repo bu listeyi `scripts/store-runtimes.json` dosyasında, her mağaza sürümü ve platform için bir kayıt olarak tutuyor:

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

Bu değerler terminalden kopyalanmıyor. `scripts/updates.mjs record` onları yüklenen build'in içinden okuyor: iOS'ta `.xcarchive`'den, Android'de `.aab`'den, dosyayı açmadan bile:

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

Ardından build'in fingerprint'ini koddan hesaplananla karşılaştırıyor ve buradan yayınlanan güncellemeler o build'e ulaşmayacaksa uyarıyor. Bunu elle kontrol etmek de kolay. Şu anki commit'te, mağazaya giden arşiv ve bundle tam olarak `runtimeversion:resolve`'un verdiği hash'leri taşıyor:

```txt
runtimeversion:resolve ios      74b875dab5ccb99ed204bca069123626c0993329
Budgetory-1.6.0-8.xcarchive     74b875dab5ccb99ed204bca069123626c0993329
runtimeversion:resolve android  ef3b46596c798c803001d40c6b6a04bf12723d9e
Budgetory-1.6.0-22.aab          ef3b46596c798c803001d40c6b6a04bf12723d9e
```

expo-updates olmadan alınmış bir build'de ya da debug build'de bu dosya yok ve `record` orada duruyor:

```txt
No fingerprint in .../Fake.app: is it a release build made with expo-updates?
```

## Yalnızca uyduğunda yayınlamak

Güncellemeler `node scripts/updates.mjs publish --message "..."` ile yayınlanıyor ve script, bir şey gönderilmeden önce birkaç şeyi kontrol ediyor.

Önce ortam. `EXPO_PUBLIC_` değerleri bundle'ın içine derleniyor; geliştirirken uygulamayı `.env.local` ile yerel bir Firebase Auth emulator'üne ve yerel backend'e yönlendiriyorum ve bu dosya `.env`'in önüne geçiyor. Bu dosya yerindeyken alınmış bir güncelleme her telefonu `127.0.0.1`'e yönlendirirdi. O yüzden script, dosya varken başlamıyor bile. Şu an kendi makinemde verdiği cevap bu:

```txt
.env.local would be built into the update: move it out of the way first.
```

Sonra git: çalışma alanı temiz, commit push edilmiş olmalı; böylece telefonların çalıştırdığı kod her zaman geçmişteki bir commit oluyor.

Sonra her platform için runtime version. Bir platform güncellemeyi ancak kayıtlı bir mağaza build'i kodun fingerprint'ine sahipse alıyor. Hiçbiri sahip değilse script, son kayıtlı build'den bu yana native yollardaki `git diff --stat`'ı basıyor; native tarafı neyin değiştirdiği görülsün diye:

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

En son da bundle'ın kendisi. Script onu `--clear` ile sıfırdan export ediyor, çünkü Metro'nun cache'inde yerel `EXPO_PUBLIC_` değerleriyle derlenmiş kod kalmış olabilir. Sonra çıktıyı tarıyor: içinde hiçbir yerel adres olmamalı, production API host'u ve Firebase projesi ise olmalı.

```js title="scripts/updates.mjs"
const local = LOCAL_STACK.filter(address => bundle.includes(address));
if (local.length) fail(`The ${platform} bundle has ${local.join(', ')} in it.`);
if (!bundle.includes(apiHost) || !bundle.includes(firebaseProject)) fail(`The ${platform} bundle lacks the production API or Firebase project.`);
```

`eas update` ancak bundan sonra, az önce kontrol edilen bundle üzerinde `--skip-bundler` ile çağrılıyor. `--dry-run` bunların hepsini çalıştırıp yayından hemen önce duruyor.

Bir güncelleme yine de kötü çıkarsa `eas update:republish` öncekini yeniden gönderiyor, `eas update:roll-back-to-embedded` da telefonları build'le birlikte gelen JavaScript'e döndürüyor. Bir telefonun ne çalıştırdığını görmek için Ayarlar, uygulama gömülü koddan açılmadıysa sürüm satırına güncelleme ID'sinin ilk sekiz karakterini ekliyor.

## Ne kazandırıyor, neyi kazandırmıyor

Bunun önlediği hatalar yayın anında ortaya çıkmıyor; kullanıcıların telefonunda çıkıyor: telefonda olmayan native koda yazılmış bir güncelleme ya da birden `127.0.0.1` ile konuşmaya başlayan bir uygulama. Runtime version olarak fingerprint ve git'te tutulan mağaza fingerprint'leriyle ikisi de daha hiçbir şey gönderilmeden script'te yakalanıyor.

Bedeli, fingerprint'in katı olması. Native klasörün tamamını, uygulama ikonunu ve splash görselini de kapsıyor; bu yüzden küçük gibi görünen birçok değişiklik mağaza sürümü istiyor. Commit geçmişi bunu gösteriyor: 1.5.0, fiş tarayıcının native modülleri ve izin metinleri için; 1.6.0 da sistemin açık/koyu görünümünü takip etmek için gerekti, çünkü arayüz stili ve koyu splash ekranları native. Script bunu aşamaz. Yapabildiği şey bunu yayından önce söylemek; bir güncellemenin sessizce hiç kimseye ulaşmaması yerine.

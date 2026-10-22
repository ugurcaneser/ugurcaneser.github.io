# ugurcaneser.github.io

Bilingual (English / Türkçe) technical blog about the apps and games I build, published at https://ugurcaneser.github.io.

Built with [Astro](https://astro.build), Markdown/MDX content collections and [Expressive Code](https://expressive-code.com) for code blocks.

## Development

Requires Node 22.23.4 or newer (`nvm use` picks it up from `.nvmrc`).

```bash
npm install
npm run dev       # http://localhost:4321, drafts included
npm run build     # type check + static build into dist/
npm run preview   # serve dist/
```

## Writing a post

Create `src/content/posts/en/<slug>.md` (or `.mdx`) and, optionally, the Turkish version at `src/content/posts/tr/<slug>.md`. Same slug = translations of each other.

```yaml
---
title: How Budgetory syncs with iCloud
description: One-sentence summary for lists, RSS and search results.
date: 2026-10-22
updated: 2026-11-01   # optional
project: budgetory    # optional, a file name in src/content/projects/
tags: [SwiftUI, CloudKit]
draft: true           # drafts only show up in `npm run dev`
---
```

`src/content/posts/*/writing-guide.mdx` is a draft reference post showing every supported feature (code block titles, line highlighting, diffs, tables).

## Adding a project

Add `src/content/projects/<id>.yaml` (and an optional icon next to it):

```yaml
name: Budgetory
icon: ./budgetory.png
description:
  en: An iOS app for tracking your budget easily.
  tr: Bütçeni kolayca takip etmen için bir iOS uygulaması.
links:
  - label: { en: App Store, tr: App Store }
    url: https://apps.apple.com/...
```

## Deployment

Every push to `main` is built and deployed to GitHub Pages by `.github/workflows/deploy.yml`.

App legal pages are **not** part of this repo. They are separate GitHub Pages project sites and keep working independently of this blog:

- https://ugurcaneser.github.io/budgetory-legal/ ([budgetory-legal](https://github.com/ugurcaneser/budgetory-legal))
- https://ugurcaneser.github.io/pizza-assassin-site/ ([pizza-assassin-site](https://github.com/ugurcaneser/pizza-assassin-site))

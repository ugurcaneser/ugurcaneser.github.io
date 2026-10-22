# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node ≥ 22.23.4 is required by Astro 7 (pinned in `.nvmrc` and in `deploy.yml`, keep them in sync; run `nvm use` first).

```bash
npm run dev       # dev server at http://localhost:4321 (drafts are visible here only)
npm run build     # astro check (types + .astro diagnostics) && astro build → dist/
npm run check     # type check only
npm run preview   # serve the built dist/
```

There is no test suite; `npm run build` is the verification step and must pass before pushing. Draft posts are excluded from the build, so to verify a draft's page renders, temporarily set `draft: false` (or check it in `npm run dev`).

## Architecture

Bilingual (en/tr) static technical blog: Astro 7, content collections, MDX, Expressive Code, plain CSS (no Tailwind). Deployed to GitHub Pages at the user-site root (`https://ugurcaneser.github.io`, no `base`) by `.github/workflows/deploy.yml` on push to `main`.

### i18n routing

- English is unprefixed (`/posts/x/`), Turkish is under `/tr/`. There is no Astro `i18n` config; routing is manual.
- Every page lives under `src/pages/[...lang]/` and is generated once per language. The rest param is `undefined` for English and `"tr"` for Turkish — use `langParam()` / `langFromParam()` / `langPaths()` from `src/i18n.ts` rather than building params by hand.
- All internal links go through `localizePath(lang, path)`. `trailingSlash: 'always'` is set, so paths end in `/` (except files like `rss.xml`).
- UI strings are in the `ui` object in `src/i18n.ts`; keys must exist in both languages (`useTranslations` is typed off the `en` keys).
- `Base.astro` takes a `translations` map (lang → URL of this page in that language). It drives both the hreflang `<link>`s and the header language switch; when a language is missing, the switch falls back to that language's home page. Pages must only pass URLs that actually exist (e.g. tag pages check the other language uses the tag).
- `src/pages/404.astro` is outside `[...lang]` because GitHub Pages serves a single `404.html`; it shows both languages.

### Content

Schemas are in `src/content.config.ts`; helpers in `src/lib/content.ts`.

- **Posts**: `src/content/posts/<lang>/<slug>.{md,mdx}`. Entry id is `"<lang>/<slug>"`; language and slug are derived from it (`postLang`, `postSlug`). Same slug in both folders = translations (linked automatically). Always fetch posts via `getPosts(lang?)`, which sorts newest-first and filters drafts outside dev.
- **Projects**: `src/content/projects/<id>.yaml` with bilingual `description` and link `label`s; posts reference them with `project: <id>` (`reference('projects')`). Icons sit next to the YAML and go through `astro:assets` `<Image>`.
- **Tags** are free-form strings per post and per language; URLs use `tagSlug()` which folds Turkish characters (ı, ş, ğ…).
- **Post images** shared by both language versions go in `src/assets/posts/<project>/` and are referenced relatively (`../../../assets/posts/<project>/x.png`) so `astro:assets` optimizes them.
- Posts about the user's other projects are written with the user-level `tech-blog` skill (`~/.claude/skills/tech-blog/SKILL.md`), which covers research, verification and the hand-over.

### Design and layout

- **Dark only**, no theme toggle. The look is a cutting mat: green `--mat` background with a 16px grid (heavier every 5 cells), a ruler under the sticky header, and yellow `--marker` as the single accent. Tokens live in `:root` in `src/styles/global.css`; the code block colors in `astro.config.mjs` repeat a few of them, so change both together.
- Fonts via Astro's fonts API (Fontsource): Big Shoulders Display for display headings (`.display`, prose `h2`/`h3`), Atkinson Hyperlegible Next for body text, JetBrains Mono for code and the small uppercase `.label` text (dates, nav, rail headings).
- **Mobile first**: base CSS targets phones; `48rem` and `64rem` are the breakpoints. Every page puts its content in three areas of `main.page`: `.page-head` (title), `.page-rail` (secondary info) and `.page-body`. Phones stack head, rail, body (add `.rail-after` to the rail to put it after the body); from `64rem` the rail is a sticky left column. On post pages the rail holds the meta, tags and a table of contents built from the `h2`s, with the current section highlighted.
- In `.prose`, text keeps a ~42rem measure while code blocks and standalone images use the full column width, so long code lines (e.g. ASCII maps) fit on wide screens.
- Expressive Code (`astro-expressive-code`, configured in `astro.config.mjs`, must stay before `mdx()`) handles all fenced code with the `everforest-dark` theme: titles (`title="..."`), line markers (`{3-5}`, `ins=`, `del=`), copy button, terminal frames.

### Must not break

App privacy/support pages that were given to Apple live in **separate repos** served as GitHub Pages project sites: `/budgetory-legal/` and `/pizza-assassin-site/` (incl. `/privacy/`, `/support/`). Never create top-level routes with those names, and don't add a custom domain (`CNAME`) to this site — that would change those URLs.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # dev server (Turbopack) at http://localhost:3000
npm run build     # production build — also the de facto type check
npm run lint      # ESLint (next lint, config in eslint.config.mjs)
```

There is no test suite. Verify changes with `npm run build` and `npm run lint` before pushing.

## Architecture

Personal portfolio site: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3 (+ `@tailwindcss/typography`), Framer Motion, `react-icons`. Everything lives under `src/app/`; there is no `src/components/` directory despite what the README and `tailwind.config.ts` suggest.

### Deployment / static export

The site is deployed to GitHub Pages by `.github/workflows/nextjs.yml` on pushes to `main`. `next.config.ts` is intentionally empty: the `actions/configure-pages` step (`static_site_generator: next`) injects `output: "export"`, `basePath` and `images.unoptimized` at build time, and the workflow uploads `./out`. Consequences:

- A plain local `npm run build` does not reproduce the static-export constraints. Avoid features that need a server at runtime (API routes, server actions, dynamic routes without `generateStaticParams`, middleware, uncached `cookies()`/`headers()`).
- Dynamic routes must enumerate all params via `generateStaticParams` (see `src/app/blog/[id]/page.tsx`).

### Pages

- `page.tsx` (home), `projects/page.tsx`, `gallery/page.tsx` are client components (`"use client"`) with content hard-coded as arrays at the top of each file — the homepage `links` array, the `projects` array, and the `photos` array (with explicit pixel `width`/`height` per image). Adding a project or photo means editing that array and dropping the asset into `public/images/...`.
- Homepage nav links use relative hrefs (`./projects`); the blog link is currently commented out, so `/blog` exists but is unlinked.

### Blog pipeline

- Posts are Markdown files with gray-matter front matter (`title`, `date`) in `src/app/posts/`; the filename (minus `.md`) is the post id/slug.
- `src/app/lib/posts.ts` `getSortedPostsData()` reads them with `fs` at build time (server-only). It sorts with `date.localeCompare`, i.e. as strings — dates are written like `"December 22, 2024"`, so ordering is not chronological across months/years.
- `blog/page.tsx` (server component) lists posts; `blog/[id]/page.tsx` (server) generates static params/metadata and passes the post to `ClientBlogPost.tsx` (client), which renders with `react-markdown` + `remark-gfm` and per-element Tailwind overrides. `remark`/`remark-html` are installed but unused.

### Styling

Poppins is loaded via `next/font/google` in `layout.tsx` and exposed as the `font-poppins` Tailwind family. `<html>` is fixed to `data-theme="light"`; the visual style is white background, black text, red (`text-red-600`/`hover:text-red-800`) accents.

// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://ugurcaneser.github.io',
	trailingSlash: 'always',
	integrations: [
		// Must come before mdx() so code blocks in .mdx files are handled too.
		expressiveCode({
			themes: ['github-dark-dimmed'],
			styleOverrides: {
				codeFontFamily: 'var(--font-mono)',
				uiFontFamily: 'var(--font-sans)',
				codeFontSize: '0.8125rem',
				// Matches --bg-raised and --border in src/styles/global.css.
				codeBackground: '#18181b',
				borderColor: '#27272a',
				borderRadius: '0.375rem',
				frames: {
					frameBoxShadowCssValue: 'none',
					editorTabBarBackground: '#111113',
					editorActiveTabBackground: '#18181b',
					editorActiveTabIndicatorTopColor: 'transparent',
					terminalTitlebarBackground: '#111113',
					terminalBackground: '#18181b',
				},
			},
		}),
		mdx(),
		sitemap({
			i18n: {
				defaultLocale: 'en',
				locales: { en: 'en-US', tr: 'tr-TR' },
			},
		}),
	],
});

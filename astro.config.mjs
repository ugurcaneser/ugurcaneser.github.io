// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
	site: 'https://ugurcaneser.github.io',
	trailingSlash: 'always',
	integrations: [
		// Must come before mdx() so code blocks in .mdx files are handled too.
		expressiveCode({
			themes: ['github-dark', 'github-light'],
			// Follow the site's own theme toggle instead of the OS setting.
			useDarkModeMediaQuery: false,
			themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
			styleOverrides: {
				codeFontFamily: 'var(--font-mono)',
				uiFontFamily: 'var(--font-sans)',
				borderRadius: '0.5rem',
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
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Inter',
			cssVariable: '--font-inter',
			weights: [400, 500, 600, 700],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'JetBrains Mono',
			cssVariable: '--font-jetbrains-mono',
			weights: [400, 600],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['ui-monospace', 'monospace'],
		},
	],
});

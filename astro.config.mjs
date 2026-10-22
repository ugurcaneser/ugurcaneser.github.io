// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { defineConfig, fontProviders } from 'astro/config';

// Colors shared with src/styles/global.css (the site is dark only).
const mat = '#0f1f1b';
const matRaised = '#142722';
const line = '#23403a';
const marker = '#f2c94c';

export default defineConfig({
	site: 'https://ugurcaneser.github.io',
	trailingSlash: 'always',
	integrations: [
		// Must come before mdx() so code blocks in .mdx files are handled too.
		expressiveCode({
			themes: ['everforest-dark'],
			styleOverrides: {
				codeFontFamily: 'var(--font-mono)',
				uiFontFamily: 'var(--font-mono)',
				codeFontSize: '0.8125rem',
				uiFontSize: '0.75rem',
				codeBackground: matRaised,
				borderColor: line,
				borderRadius: '0.375rem',
				focusBorder: marker,
				frames: {
					frameBoxShadowCssValue: 'none',
					editorTabBarBackground: mat,
					editorTabBarBorderBottomColor: line,
					editorActiveTabBackground: matRaised,
					editorActiveTabIndicatorTopColor: marker,
					editorActiveTabIndicatorHeight: '2px',
					terminalTitlebarBackground: mat,
					terminalTitlebarBorderBottomColor: line,
					terminalBackground: matRaised,
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
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Big Shoulders Display',
			cssVariable: '--font-big-shoulders',
			weights: [700, 800],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['Arial Narrow', 'sans-serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'Atkinson Hyperlegible Next',
			cssVariable: '--font-atkinson',
			weights: [400, 700],
			styles: ['normal', 'italic'],
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

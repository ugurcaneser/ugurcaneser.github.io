import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { languages, langFromParam, langPaths, localizePath, useTranslations } from '../../i18n';
import { getPosts, postUrl } from '../../lib/content';

export const getStaticPaths = langPaths;

export const GET: APIRoute = async (context) => {
	const lang = langFromParam(context.params.lang);
	const t = useTranslations(lang);
	const posts = await getPosts(lang);

	return rss({
		title: t('site.title'),
		description: t('site.description'),
		site: new URL(localizePath(lang, '/'), context.site),
		customData: `<language>${languages[lang].locale}</language>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			categories: post.data.tags,
			link: postUrl(post),
		})),
	});
};

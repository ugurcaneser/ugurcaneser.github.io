import { type CollectionEntry, getCollection } from 'astro:content';
import { type Lang, langs, localizePath } from '../i18n';

export type Post = CollectionEntry<'posts'>;
export type Project = CollectionEntry<'projects'>;

export function postLang(post: Post): Lang {
	return post.id.split('/')[0] as Lang;
}

export function postSlug(post: Post) {
	return post.id.split('/').slice(1).join('/');
}

export function postUrl(post: Post) {
	return localizePath(postLang(post), `/posts/${postSlug(post)}/`);
}

/** All published posts, newest first. Drafts are visible in `astro dev` only. */
export async function getPosts(lang?: Lang) {
	const posts = await getCollection('posts', (post) => {
		if (!langs.includes(postLang(post))) {
			throw new Error(`Post "${post.id}" must live under src/content/posts/<${langs.join('|')}>/`);
		}
		return (import.meta.env.DEV || !post.data.draft) && (!lang || postLang(post) === lang);
	});
	return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** The same post in the other language(s), matched by slug. */
export async function getTranslations(post: Post) {
	const all = await getPosts();
	return all.filter((p) => postSlug(p) === postSlug(post) && p.id !== post.id);
}

export async function getProjects() {
	const projects = await getCollection('projects');
	return projects.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

/** URL-safe tag slug that also folds Turkish characters (ı, ş, ğ, ...). */
export function tagSlug(tag: string) {
	return tag
		.toLocaleLowerCase('tr-TR')
		.replace(/ı/g, 'i')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

export function tagUrl(lang: Lang, tag: string) {
	return localizePath(lang, `/tags/${tagSlug(tag)}/`);
}

/** Tags used by the given posts, with their post counts, most used first. */
export function collectTags(posts: Post[]) {
	const tags = new Map<string, { name: string; count: number }>();
	for (const post of posts) {
		for (const name of post.data.tags) {
			const slug = tagSlug(name);
			const entry = tags.get(slug) ?? { name, count: 0 };
			entry.count++;
			tags.set(slug, entry);
		}
	}
	return [...tags.entries()]
		.map(([slug, { name, count }]) => ({ slug, name, count }))
		.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function readingTime(post: Post) {
	const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}

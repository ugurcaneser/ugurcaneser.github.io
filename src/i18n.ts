export const languages = {
	en: { label: 'English', short: 'EN', locale: 'en-US' },
	tr: { label: 'Türkçe', short: 'TR', locale: 'tr-TR' },
} as const;

export type Lang = keyof typeof languages;

// English is served without a prefix (/posts/x/), Turkish under /tr/.
export const defaultLang: Lang = 'en';
export const langs = Object.keys(languages) as Lang[];

const ui = {
	en: {
		'site.title': 'Uğurcan Eser',
		'site.description': 'Technical write-ups on the apps and games I build.',
		'nav.posts': 'Posts',
		'nav.projects': 'Projects',
		'nav.tags': 'Tags',
		'home.intro':
			'Notes on how my apps and games are built: architecture decisions, problems I ran into, and what I learned fixing them.',
		'home.empty': 'No posts yet.',
		'post.minRead': '{n} min read',
		'post.updated': 'Updated',
		'post.readIn': 'Türkçe oku',
		'projects.title': 'Projects',
		'projects.description': 'Apps and games I build, and the write-ups about each.',
		'projects.postCount': '{n} posts',
		'projects.postCountOne': '1 post',
		'projects.posts': 'Posts',
		'tags.title': 'Tags',
		'tags.description': 'All topics covered on this blog.',
		'tags.tagged': 'Posts tagged “{tag}”',
		'nav.label': 'Main',
		'lang.switch': 'Türkçe',
		'footer.rss': 'RSS',
		'footer.email': 'E-mail',
		'home.projects': 'Projects',
		'post.back': 'All posts',
		'post.published': 'Published',
		'post.reading': 'Reading time',
		'post.project': 'Project',
		'post.contents': 'On this page',
		'tags.all': 'All tags',
		'projects.links': 'Links',
		'404.title': 'Page not found',
		'404.body': 'This page does not exist.',
		'404.home': 'Back to posts',
	},
	tr: {
		'site.title': 'Uğurcan Eser',
		'site.description': 'Geliştirdiğim uygulama ve oyunlar hakkında teknik yazılar.',
		'nav.posts': 'Yazılar',
		'nav.projects': 'Projeler',
		'nav.tags': 'Etiketler',
		'home.intro':
			'Uygulamalarımın ve oyunlarımın nasıl geliştirildiğine dair notlar: mimari kararlar, karşılaştığım sorunlar ve onları çözerken öğrendiklerim.',
		'home.empty': 'Henüz yazı yok.',
		'post.minRead': '{n} dk okuma',
		'post.updated': 'Güncellendi',
		'post.readIn': 'Read in English',
		'projects.title': 'Projeler',
		'projects.description': 'Geliştirdiğim uygulama ve oyunlar ve her biri hakkındaki yazılar.',
		'projects.postCount': '{n} yazı',
		'projects.postCountOne': '1 yazı',
		'projects.posts': 'Yazılar',
		'tags.title': 'Etiketler',
		'tags.description': 'Bu blogda yazılan tüm konular.',
		'tags.tagged': '“{tag}” etiketli yazılar',
		'nav.label': 'Ana menü',
		'lang.switch': 'English',
		'footer.rss': 'RSS',
		'footer.email': 'E-posta',
		'home.projects': 'Projeler',
		'post.back': 'Tüm yazılar',
		'post.published': 'Yayın',
		'post.reading': 'Okuma süresi',
		'post.project': 'Proje',
		'post.contents': 'Bu yazıda',
		'tags.all': 'Tüm etiketler',
		'projects.links': 'Bağlantılar',
		'404.title': 'Sayfa bulunamadı',
		'404.body': 'Aradığın sayfa mevcut değil.',
		'404.home': 'Yazılara dön',
	},
} as const;

export type UIKey = keyof (typeof ui)['en'];

export function useTranslations(lang: Lang) {
	return (key: UIKey, vars: Record<string, string | number> = {}) =>
		Object.entries(vars).reduce<string>(
			(text, [name, value]) => text.replace(`{${name}}`, String(value)),
			ui[lang][key],
		);
}

/** Prefixes a site-relative path with the language segment, e.g. ('tr', '/tags/') -> '/tr/tags/'. */
export function localizePath(lang: Lang, path: string) {
	const clean = path.startsWith('/') ? path : `/${path}`;
	return lang === defaultLang ? clean : `/${lang}${clean}`;
}

/** Value for the `[...lang]` route param: undefined for the unprefixed default language. */
export function langParam(lang: Lang) {
	return lang === defaultLang ? undefined : lang;
}

export function langFromParam(param: string | undefined): Lang {
	return param && param in languages ? (param as Lang) : defaultLang;
}

/** getStaticPaths result for pages that exist once per language. */
export function langPaths() {
	return langs.map((lang) => ({ params: { lang: langParam(lang) } }));
}

export function formatDate(date: Date, lang: Lang) {
	return new Intl.DateTimeFormat(languages[lang].locale, {
		dateStyle: 'long',
		timeZone: 'UTC',
	}).format(date);
}

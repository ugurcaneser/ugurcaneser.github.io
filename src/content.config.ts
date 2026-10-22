import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts live in src/content/posts/<lang>/<slug>.{md,mdx}. The entry id is
// "<lang>/<slug>"; files with the same slug in both languages are translations
// of each other.
const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		project: reference('projects').optional(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

// One YAML file per project; the file name is the project id used in post
// frontmatter (`project: budgetory`) and in /projects/<id>/ URLs.
const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '*.yaml' }),
	schema: ({ image }) =>
		z.object({
			name: z.string(),
			icon: image().optional(),
			description: z.object({ en: z.string(), tr: z.string() }),
			links: z
				.array(z.object({ label: z.object({ en: z.string(), tr: z.string() }), url: z.url() }))
				.default([]),
			order: z.number().default(0),
		}),
});

export const collections = { posts, projects };

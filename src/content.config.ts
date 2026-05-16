import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

// Blog 文章的 schema
const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
    deprecated: z.boolean().optional().default(false), // 标记过时的技术文章
    deprecatedReason: z.string().optional(), // 可选：说明为什么过时
    image: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};

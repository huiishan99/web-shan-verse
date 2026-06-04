import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { locales } from './i18n/config';

// Blog 文章的 schema
const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    kind: z.enum(['article', 'note']).optional().default('article'), // article: 结构化长文；note: 札记/散文/心情短文
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    lang: z.enum(locales).optional(), // 可选：指定文章语言；未指定时在所有语言页面显示
    postSlug: z.string().optional(), // 可选：给多语言版本共享同一个公开 URL slug
    translationKey: z.string().optional(), // 可选：标记同一篇文章的多语言版本
    draft: z.boolean().optional().default(false),
    deprecated: z.boolean().optional().default(false), // 标记过时的技术文章
    deprecatedReason: z.string().optional(), // 可选：说明为什么过时
    image: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};

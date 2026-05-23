import type { CollectionEntry } from 'astro:content';
import { defaultLocale, localeNames, type Locale } from '../i18n/config';

type BlogPost = CollectionEntry<'blog'>;

export function isPostVisibleInLocale(post: BlogPost, locale: Locale): boolean {
  return !post.data.lang || post.data.lang === locale;
}

export function getPostSlug(post: BlogPost): string {
  return post.data.postSlug || post.id;
}

export function getBlogPostPath(post: BlogPost, locale: Locale): string {
  const path = `/blog/${getPostSlug(post)}`;
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export function getTaxonomySlug(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '-');
}

export function getBlogCategoryPath(category: string, locale: Locale): string {
  const path = `/blog/category/${getTaxonomySlug(category)}`;
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export function getBlogTagPath(tag: string, locale: Locale): string {
  const path = `/blog/tag/${getTaxonomySlug(tag)}`;
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export function getPostLanguageLabel(post: BlogPost): string | undefined {
  return post.data.lang ? localeNames[post.data.lang] : undefined;
}

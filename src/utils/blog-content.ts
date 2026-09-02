import { locales, type Locale } from '../i18n/config.ts';

export type BlogContentPost = {
  id: string;
  data: {
    categories?: string[];
    comments?: boolean;
    draft?: boolean;
    lang?: Locale;
    postSlug?: string;
    tags?: string[];
    translationKey?: string;
  };
};

export function resolveBlogPostSlug(post: BlogContentPost): string {
  return post.data.postSlug?.trim() || post.id;
}

export function slugifyBlogTaxonomy(value: string): string {
  return value
    .trim()
    .normalize('NFKD')
    .toLocaleLowerCase('en-US')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function getBlogPostAlternateLocales(
  post: BlogContentPost,
  posts: BlogContentPost[]
): Locale[] {
  if (!post.data.lang) return [...locales];

  const translationKey = post.data.translationKey;
  if (!translationKey) return [post.data.lang];

  const available = new Set(
    posts
      .filter((candidate) => (
        candidate.data.draft !== true &&
        candidate.data.translationKey === translationKey &&
        candidate.data.lang
      ))
      .map((candidate) => candidate.data.lang as Locale)
  );

  return locales.filter((locale) => available.has(locale));
}

function collectTaxonomyCollisions(posts: BlogContentPost[], field: 'categories' | 'tags') {
  const valuesBySlug = new Map<string, Set<string>>();

  posts.forEach((post) => {
    (post.data[field] || []).forEach((value) => {
      const slug = slugifyBlogTaxonomy(value);
      const values = valuesBySlug.get(slug) || new Set<string>();
      values.add(value);
      valuesBySlug.set(slug, values);
    });
  });

  return [...valuesBySlug.entries()]
    .filter(([slug, values]) => !slug || values.size > 1)
    .map(([slug, values]) => (
      `${field} values ${[...values].map((value) => JSON.stringify(value)).join(', ')} ` +
      `resolve to the same slug ${JSON.stringify(slug)}`
    ));
}

export function validateBlogContent(
  posts: BlogContentPost[],
  { requireCompleteTranslations = false } = {}
): void {
  const errors: string[] = [];
  const routeOwners = new Map<string, string>();
  const translationGroups = new Map<string, BlogContentPost[]>();

  posts.forEach((post) => {
    const { lang, postSlug, translationKey } = post.data;
    const slug = resolveBlogPostSlug(post);

    if (!slug) errors.push(`${post.id}: public slug must not be empty`);
    if ((postSlug || translationKey) && !lang) {
      errors.push(`${post.id}: lang is required when postSlug or translationKey is set`);
    }
    if (translationKey && !postSlug) {
      errors.push(`${post.id}: postSlug is required when translationKey is set`);
    }

    const visibleLocales = lang ? [lang] : locales;
    visibleLocales.forEach((locale) => {
      const routeKey = `${locale}:${slug}`;
      const previousOwner = routeOwners.get(routeKey);
      if (previousOwner) {
        errors.push(`${post.id}: route /${locale}/blog/${slug} conflicts with ${previousOwner}`);
      } else {
        routeOwners.set(routeKey, post.id);
      }
    });

    if (translationKey) {
      const group = translationGroups.get(translationKey) || [];
      group.push(post);
      translationGroups.set(translationKey, group);
    }
  });

  translationGroups.forEach((group, translationKey) => {
    const slugs = new Set(group.map(resolveBlogPostSlug));
    const groupLocales = group.map((post) => post.data.lang).filter(Boolean) as Locale[];
    const uniqueLocales = new Set(groupLocales);
    const commentsValues = new Set(group.map((post) => post.data.comments === true));

    if (slugs.size > 1) {
      errors.push(`translationKey ${translationKey}: translations must share one postSlug`);
    }
    if (uniqueLocales.size !== groupLocales.length) {
      errors.push(`translationKey ${translationKey}: each locale may appear only once`);
    }
    if (commentsValues.size > 1) {
      errors.push(`translationKey ${translationKey}: translations must share the comments setting`);
    }
    if (requireCompleteTranslations) {
      const missingLocales = locales.filter((locale) => !uniqueLocales.has(locale));
      if (missingLocales.length > 0) {
        errors.push(`translationKey ${translationKey}: missing locales ${missingLocales.join(', ')}`);
      }
    }
  });

  errors.push(...collectTaxonomyCollisions(posts, 'categories'));
  errors.push(...collectTaxonomyCollisions(posts, 'tags'));

  if (errors.length > 0) {
    throw new Error(`Blog content validation failed:\n- ${errors.join('\n- ')}`);
  }
}

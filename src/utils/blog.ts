import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, localeNames, translatedLocales, type Locale } from '../i18n/config';

export type BlogPost = CollectionEntry<'blog'>;
type BlogTaxonomyKind = 'category' | 'tag';
export type BlogPostKind = 'article' | 'reflection';

const genericTaxonomyValues = new Set(['blog', 'blogs', 'article', 'articles', 'reflection', 'reflections']);

export function isPostVisibleInLocale(post: BlogPost, locale: Locale): boolean {
  return !post.data.lang || post.data.lang === locale;
}

export function getPostSlug(post: BlogPost): string {
  return post.data.postSlug || post.id;
}

export function getBlogPostKind(post: BlogPost): BlogPostKind {
  return post.data.kind || 'article';
}

export function isGenericBlogTaxonomy(value: string): boolean {
  return genericTaxonomyValues.has(value.trim().toLowerCase());
}

export function getInformativeBlogCategories(post: BlogPost): string[] {
  return (post.data.categories || []).filter((category) => !isGenericBlogTaxonomy(category));
}

export function getInformativeBlogTags(post: BlogPost): string[] {
  return (post.data.tags || []).filter((tag) => !isGenericBlogTaxonomy(tag));
}

export function getBlogPostPath(post: BlogPost, locale: Locale): string {
  const path = `/blog/${getPostSlug(post)}`;
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export function sortBlogPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
}

export function getBlogPostsForLocale(posts: BlogPost[], locale: Locale): BlogPost[] {
  return posts.filter((post) => isPostVisibleInLocale(post, locale));
}

export async function getBlogPostStaticPaths(locale: Locale) {
  const posts = getBlogPostsForLocale(await getBlogPosts(), locale);

  return posts.map((post) => ({
    params: { slug: getPostSlug(post) },
    props: { post },
  }));
}

export async function getLocalizedBlogPostStaticPaths() {
  const posts = await getBlogPosts();

  return translatedLocales.flatMap((lang) =>
    getBlogPostsForLocale(posts, lang).map((post) => ({
      params: { lang, slug: getPostSlug(post) },
      props: { post, lang },
    }))
  );
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

function getPostTaxonomyValues(post: BlogPost, kind: BlogTaxonomyKind): string[] {
  return kind === 'category' ? post.data.categories || [] : post.data.tags || [];
}

export function getBlogTaxonomyStaticPaths(
  posts: BlogPost[],
  locale: Locale,
  kind: BlogTaxonomyKind
) {
  const visiblePosts = getBlogPostsForLocale(posts, locale);
  const values = [...new Set(visiblePosts.flatMap((post) => getPostTaxonomyValues(post, kind)))];
  const paramName = kind === 'category' ? 'category' : 'tag';

  return values.map((value) => ({
    params: { [paramName]: getTaxonomySlug(value) },
    props: {
      [paramName]: value,
      posts: sortBlogPosts(
        visiblePosts.filter((post) => getPostTaxonomyValues(post, kind).includes(value))
      ),
    },
  }));
}

export async function getDefaultBlogTaxonomyStaticPaths(kind: BlogTaxonomyKind) {
  return getBlogTaxonomyStaticPaths(await getBlogPosts(), defaultLocale, kind);
}

export async function getLocalizedBlogTaxonomyStaticPaths(kind: BlogTaxonomyKind) {
  const posts = await getBlogPosts();

  return translatedLocales.flatMap((lang) =>
    getBlogTaxonomyStaticPaths(posts, lang, kind).map((path) => ({
      ...path,
      params: { lang, ...path.params },
      props: { ...path.props, lang },
    }))
  );
}

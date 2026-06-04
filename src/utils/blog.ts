import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, localeNames, translatedLocales, type Locale } from '../i18n/config';

export type BlogPost = CollectionEntry<'blog'>;
type BlogTaxonomyKind = 'category' | 'tag';
export type BlogPostKind = 'article' | 'reflection';

export const blogPostsPerPage = 6;

const genericTaxonomyValues = new Set(['blog', 'blogs', 'article', 'articles', 'reflection', 'reflections']);
const blogCardExcerptLengths: Record<Locale, number> = {
  en: 110,
  zh: 60,
  ja: 60,
};

export function isPostVisibleInLocale(post: BlogPost, locale: Locale): boolean {
  return !post.data.lang || post.data.lang === locale;
}

export function getPostSlug(post: BlogPost): string {
  return post.data.postSlug || post.id;
}

export function getBlogPostKind(post: BlogPost): BlogPostKind {
  return post.data.kind || 'article';
}

export function getPlainTextExcerpt(body: string, maxLength = 150): string {
  const cleanText = body
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/import\s+.+?;\s*/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[#*`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.length <= maxLength) return cleanText;

  return `${cleanText.slice(0, maxLength).trim()}...`;
}

export function getBlogPostExcerpt(post: BlogPost, maxLength = 150): string | undefined {
  if (getBlogPostKind(post) === 'reflection') {
    return getPlainTextExcerpt(post.body ?? '', maxLength) || post.data.description;
  }

  return post.data.description;
}

export function getBlogCardExcerpt(post: BlogPost, locale: Locale): string | undefined {
  return getBlogPostExcerpt(post, blogCardExcerptLengths[locale]);
}

export function getBlogPostMetaDescription(post: BlogPost, maxLength = 160): string | undefined {
  return getBlogPostExcerpt(post, maxLength) || post.data.description;
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

export function getBlogIndexPagePath(page: number, locale: Locale): string {
  const path = page <= 1 ? '/blog' : `/blog/page/${page}`;
  return locale === defaultLocale ? path : `/${locale}${path}`;
}

export function sortBlogPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function getBlogPageCount(posts: BlogPost[], postsPerPage = blogPostsPerPage): number {
  return Math.max(1, Math.ceil(posts.length / postsPerPage));
}

export function getBlogPagePosts(
  posts: BlogPost[],
  page: number,
  postsPerPage = blogPostsPerPage
): BlogPost[] {
  const start = (page - 1) * postsPerPage;
  return posts.slice(start, start + postsPerPage);
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

export async function getBlogPaginationStaticPaths(locale: Locale) {
  const posts = getBlogPostsForLocale(await getBlogPosts(), locale);
  const totalPages = getBlogPageCount(posts);

  return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => {
    const currentPage = index + 2;

    return {
      params: { page: String(currentPage) },
      props: { lang: locale, currentPage },
    };
  });
}

export async function getDefaultBlogPaginationStaticPaths() {
  return getBlogPaginationStaticPaths(defaultLocale);
}

export async function getLocalizedBlogPaginationStaticPaths() {
  const posts = await getBlogPosts();

  return translatedLocales.flatMap((lang) => {
    const totalPages = getBlogPageCount(getBlogPostsForLocale(posts, lang));

    return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => {
      const currentPage = index + 2;

      return {
        params: { lang, page: String(currentPage) },
        props: { lang, currentPage },
      };
    });
  });
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

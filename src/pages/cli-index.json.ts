import type { APIRoute } from 'astro';
import { projectCategories } from '../data/projects';
import { locales, localizeString, type Locale } from '../i18n/config';
import {
  getBlogPostDisplayTitle,
  getBlogPostKind,
  getBlogPosts,
  getBlogPostsForLocale,
  getBlogPostPath,
  getInformativeBlogCategories,
  getInformativeBlogTags,
  getPlainTextExcerpt,
  sortBlogPosts,
} from '../utils/blog';
import { getProjectPath, getProjectRecord, getProjectStatus } from '../utils/projects';

export const prerender = true;

type CliIndexEntryType = 'post' | 'project';

interface CliIndexEntry {
  id: string;
  type: CliIndexEntryType;
  title: string;
  description: string;
  url: string;
  date?: string;
  tags: string[];
  source: string;
}

type CliIndexPayload = {
  generatedAt: string;
  locales: Record<Locale, CliIndexEntry[]>;
};

function toDateKey(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  return typeof date === 'string' ? date : date.toISOString().slice(0, 10);
}

function compactStrings(values: Array<string | undefined>): string[] {
  return values.filter((value): value is string => Boolean(value));
}

function getProjectEntries(locale: Locale): CliIndexEntry[] {
  return projectCategories.flatMap((category) => {
    const categoryTitle = localizeString(category.title, locale);

    return category.items.map((project, index) => {
      const title = localizeString(project.title, locale);
      const record = getProjectRecord(category.id, index);
      const tags = compactStrings([
        categoryTitle,
        getProjectStatus(project, category),
        ...(project.tags || []).map((tag) => localizeString(tag, locale)),
      ]);

      return {
        id: `project:${category.id}:${index}`,
        type: 'project',
        title,
        description: localizeString(project.description, locale),
        url: getProjectPath(record, locale),
        tags,
        source: categoryTitle,
      };
    });
  });
}

async function getPostEntries(locale: Locale): Promise<CliIndexEntry[]> {
  const posts = sortBlogPosts(getBlogPostsForLocale(await getBlogPosts(), locale));

  return posts.map((post) => {
    const tags = compactStrings([
      getBlogPostKind(post),
      ...getInformativeBlogCategories(post),
      ...getInformativeBlogTags(post),
    ]);

    return {
      id: `post:${post.id}`,
      type: 'post',
      title: getBlogPostDisplayTitle(post, locale),
      description: post.data.description || getPlainTextExcerpt(post.body ?? '', 180),
      url: getBlogPostPath(post, locale),
      date: toDateKey(post.data.date),
      tags,
      source: 'blog',
    };
  });
}

function compareEntries(first: CliIndexEntry, second: CliIndexEntry): number {
  const firstTime = first.date ? Date.parse(`${first.date}T00:00:00Z`) : 0;
  const secondTime = second.date ? Date.parse(`${second.date}T00:00:00Z`) : 0;
  return secondTime - firstTime || first.title.localeCompare(second.title);
}

async function buildLocaleEntries(locale: Locale): Promise<CliIndexEntry[]> {
  const entries = [
    ...(await getPostEntries(locale)),
    ...getProjectEntries(locale),
  ];

  return entries.sort(compareEntries);
}

export const GET: APIRoute = async () => {
  const localeEntries = await Promise.all(
    locales.map(async (locale) => [locale, await buildLocaleEntries(locale)] as const)
  );
  const payload: CliIndexPayload = {
    generatedAt: new Date().toISOString(),
    locales: Object.fromEntries(localeEntries) as Record<Locale, CliIndexEntry[]>,
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};

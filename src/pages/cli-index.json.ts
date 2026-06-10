import type { APIRoute } from 'astro';
import { projectCategories, type ProjectCategory, type ProjectItem, type ProjectStatus } from '../data/projects';
import { timelineData, type TimelineEvent } from '../data/timeline';
import { locales, localizeMonth, localizePath, localizeString, type Locale } from '../i18n/config';
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

export const prerender = true;

type CliIndexEntryType = 'post' | 'project' | 'timeline';

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

function getProjectStatus(project: ProjectItem, category: ProjectCategory): ProjectStatus {
  if (project.status) return project.status;
  if (category.id === 'publications') return 'publication';
  if (!project.github && !project.paper && !project.caseStudy && !project.website) return 'private';
  if (category.id === 'school') return 'coursework';
  if (category.id === 'vr') return 'prototype';
  if (category.id === 'unity') return project.website ? 'live' : 'practice';
  if (category.id === 'other') return 'practice';
  if (project.website) return 'live';
  return 'archive';
}

function getProjectEntries(locale: Locale): CliIndexEntry[] {
  return projectCategories.flatMap((category) => {
    const categoryTitle = localizeString(category.title, locale);

    return category.items.map((project, index) => {
      const title = localizeString(project.title, locale);
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
        url: `${localizePath('/projects', locale)}#${category.id}`,
        tags,
        source: categoryTitle,
      };
    });
  });
}

function getTimelineEntries(locale: Locale): CliIndexEntry[] {
  return [...timelineData]
    .sort((firstYear, secondYear) => secondYear.year - firstYear.year)
    .flatMap((yearData) => yearData.events.map((event, index) => {
      const tags = compactStrings([
        String(yearData.year),
        event.category,
        event.weight || 'standard',
        localizeMonth(event.month, locale),
      ]);

      return {
        id: `timeline:${yearData.year}:${index}`,
        type: 'timeline',
        title: localizeString(event.title, locale),
        description: localizeString(event.description, locale),
        url: `${localizePath('/timeline', locale)}#year-${yearData.year}`,
        date: toDateKey(getTimelineSortDate(event, yearData.year)),
        tags,
        source: String(yearData.year),
      };
    }));
}

function getTimelineSortDate(event: TimelineEvent, year: number): string {
  if (event.date) return event.date;
  return `${year}-01-01`;
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
    ...getTimelineEntries(locale),
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

import { projectCategories, type ProjectCategory, type ProjectItem, type ProjectStatus } from '../data/projects.ts';
import { defaultLocale, localizePath, localizeString, locales, translatedLocales, type Locale } from '../i18n/config.ts';

export type ProjectRecord = {
  category: ProjectCategory;
  project: ProjectItem;
  categoryIndex: number;
  projectIndex: number;
  slug: string;
};

export function getProjectStatus(
  project: ProjectItem,
  category: ProjectCategory
): ProjectStatus {
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

function slugifyProjectTitle(title: string): string {
  const conciseTitle = title.includes(':') ? title.split(':', 1)[0] : title;

  return conciseTitle
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

const rawProjectRecords = projectCategories.flatMap((category, categoryIndex) =>
  category.items.map((project, projectIndex) => {
    const baseSlug = project.slug || slugifyProjectTitle(localizeString(project.title, defaultLocale));

    return {
      category,
      project,
      categoryIndex,
      projectIndex,
      baseSlug,
    };
  })
);

const slugCounts = rawProjectRecords.reduce<Map<string, number>>((counts, record) => {
  counts.set(record.baseSlug, (counts.get(record.baseSlug) ?? 0) + 1);
  return counts;
}, new Map());

export const projectRecords: ProjectRecord[] = rawProjectRecords.map((record) => ({
  category: record.category,
  project: record.project,
  categoryIndex: record.categoryIndex,
  projectIndex: record.projectIndex,
  slug: slugCounts.get(record.baseSlug) === 1
    ? record.baseSlug
    : `${record.baseSlug}-${record.category.id}`,
}));

const projectRecordByPosition = new Map(
  projectRecords.map((record) => [`${record.category.id}:${record.projectIndex}`, record])
);

const projectRecordBySlug = new Map(projectRecords.map((record) => [record.slug, record]));

export function getProjectRecord(categoryId: string, projectIndex: number): ProjectRecord {
  const record = projectRecordByPosition.get(`${categoryId}:${projectIndex}`);

  if (!record) {
    throw new Error(`Project record not found for ${categoryId}[${projectIndex}]`);
  }

  return record;
}

export function getProjectRecordBySlug(slug: string): ProjectRecord | undefined {
  return projectRecordBySlug.get(slug);
}

export function getProjectPath(record: Pick<ProjectRecord, 'slug'>, locale: Locale): string {
  return localizePath(`/projects/${record.slug}`, locale);
}

export function getProjectStaticPaths(locale: Locale = defaultLocale) {
  return projectRecords.map((record) => ({
    params: { slug: record.slug },
    props: {
      record,
      lang: locale,
      alternateLocales: [...locales],
    },
  }));
}

export function getLocalizedProjectStaticPaths() {
  return translatedLocales.flatMap((lang) =>
    projectRecords.map((record) => ({
      params: {
        lang,
        slug: record.slug,
      },
      props: {
        record,
        lang,
        alternateLocales: [...locales],
      },
    }))
  );
}

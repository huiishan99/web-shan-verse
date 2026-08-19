import type { ProjectCategory, ProjectItem, ProjectStatus } from '../data/projects';

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

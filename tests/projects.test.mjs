import assert from 'node:assert/strict';
import test from 'node:test';
import { projectCategories } from '../src/data/projects.ts';
import { getProjectStatus } from '../src/utils/projects.ts';

const project = (overrides = {}) => ({
  title: 'Project',
  description: 'Description',
  ...overrides,
});
const category = (id) => ({ id, title: id, icon: 'code', items: [] });

test('explicit project status wins over inferred metadata', () => {
  assert.equal(
    getProjectStatus(project({ status: 'on-hold', website: 'https://example.com' }), category('unity')),
    'on-hold'
  );
  assert.equal(
    getProjectStatus(project({ status: 'thesis' }), category('theses')),
    'thesis'
  );
  assert.equal(
    getProjectStatus(project({ status: 'bachelor-thesis' }), category('theses')),
    'bachelor-thesis'
  );
});

test('master and bachelor theses are kept in their own category after publications', () => {
  const publicationsIndex = projectCategories.findIndex(({ id }) => id === 'publications');
  const thesesIndex = projectCategories.findIndex(({ id }) => id === 'theses');
  const publications = projectCategories[publicationsIndex];
  const theses = projectCategories[thesesIndex];
  const masterThesisTitle = 'The Role of Embodied Avatars and Generative AI in Self Learning VR Classroom';
  const bachelorThesisTitle = 'Design and Implementation of a Digital Twin System for Quadrotor UAV Formation Flight';
  const schoolProjects = projectCategories.find(({ id }) => id === 'school');

  assert.equal(thesesIndex, publicationsIndex + 1);
  assert.equal(publications.items.some(({ title }) => title === masterThesisTitle), false);
  assert.equal(theses.items.some(({ title }) => title === masterThesisTitle), true);
  assert.equal(theses.items.some(({ title }) => title.en === bachelorThesisTitle), true);
  assert.equal(schoolProjects.items.some(({ title }) => title === 'NWPU Undergraduate Thesis'), false);
});

test('project status inference is shared by pages and the CLI index', () => {
  assert.equal(getProjectStatus(project(), category('publications')), 'publication');
  assert.equal(getProjectStatus(project(), category('vr')), 'private');
  assert.equal(getProjectStatus(project({ github: 'https://github.com/example' }), category('vr')), 'prototype');
  assert.equal(getProjectStatus(project({ website: 'https://example.com' }), category('unity')), 'live');
});

import assert from 'node:assert/strict';
import test from 'node:test';
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
    getProjectStatus(project({ status: 'thesis' }), category('publications')),
    'thesis'
  );
});

test('project status inference is shared by pages and the CLI index', () => {
  assert.equal(getProjectStatus(project(), category('publications')), 'publication');
  assert.equal(getProjectStatus(project(), category('vr')), 'private');
  assert.equal(getProjectStatus(project({ github: 'https://github.com/example' }), category('vr')), 'prototype');
  assert.equal(getProjectStatus(project({ website: 'https://example.com' }), category('unity')), 'live');
});

import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { projectCategories } from '../src/data/projects.ts';
import { getProjectPath, getProjectStatus, projectRecords } from '../src/utils/projects.ts';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

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

test('Spotify Furigana is published as a localized live project with real media', () => {
  const webProjects = projectCategories.find(({ id }) => id === 'web');
  const spotifyProject = webProjects.items.find(({ title }) => title === 'Furigana for Spotify');

  assert.ok(spotifyProject);
  assert.equal(spotifyProject.status, 'live');
  assert.equal(spotifyProject.github, 'https://github.com/huiishan99/extension-Furigana-for-Spotify');
  assert.equal(typeof spotifyProject.description.zh, 'string');
  assert.equal(typeof spotifyProject.description.ja, 'string');
  assert.equal(spotifyProject.detailImages.length, 2);
});

test('refreshed software entries preserve localized facts and genuine preview context', () => {
  const bySlug = (slug) => projectRecords.find((record) => record.slug === slug);
  const spotify = bySlug('furigana-for-spotify');
  const mathNote = bySlug('math-note');
  const tetris = bySlug('tetris-clone');

  for (const { project: item } of [spotify, mathNote, tetris]) {
    for (const lang of ['en', 'zh', 'ja']) {
      assert.ok(item.description[lang]);
      assert.ok(item.details[lang]);
      for (const image of item.detailImages) {
        assert.ok(image.alt[lang]);
        assert.ok(image.caption[lang]);
        assert.equal(image.fit, 'contain');
      }
    }
    // Cards use edge-to-edge cover previews; galleries retain the complete UI.
    assert.equal(item.image, item.detailImages[0].src);
  }

  assert.match(spotify.project.description.en, /Requires Spicetify/);
  assert.match(spotify.project.details.en, /PowerShell\/WPF/);
  assert.match(spotify.project.details.en, /Swift\/AppKit/);
  assert.equal(spotify.project.detailImages[0].src, '/images/projects/spotify-furigana-lyrics.webp');
  assert.match(spotify.project.detailImages[0].caption.en, /v0\.5\.1/);
  assert.match(spotify.project.detailImages[1].caption.en, /promotional composite/);

  assert.equal(getProjectStatus(mathNote.project, mathNote.category), 'prototype');
  assert.match(mathNote.project.description.en, /AI solving is currently disabled/);
  assert.match(mathNote.project.details.en, /pending Turnstile configuration/);
  assert.ok(mathNote.project.tags.includes('Python'));
  assert.ok(mathNote.project.tags.includes('FastAPI'));

  assert.equal(tetris.project.github, 'https://github.com/huiishan99/game-cpp-tetris');
  assert.deepEqual(tetris.project.tags, ['C++17', 'Win32 API', 'GDI', 'CMake']);
  assert.equal(tetris.project.detailImages.length, 2);
  assert.match(tetris.project.details.en, /game window is Windows-only/);
});

test('project detail slugs are explicit, unique, and localized into stable routes', () => {
  const slugs = projectRecords.map(({ project: item, slug }) => {
    assert.equal(item.slug, slug);
    return slug;
  });

  assert.equal(new Set(slugs).size, projectRecords.length);

  const mathBridge = projectRecords.find(({ slug }) => slug === 'vr-math-bridge');
  assert.ok(mathBridge);
  assert.equal(getProjectPath(mathBridge, 'en'), '/projects/vr-math-bridge');
  assert.equal(getProjectPath(mathBridge, 'zh'), '/zh/projects/vr-math-bridge');
  assert.equal(getProjectPath(mathBridge, 'ja'), '/ja/projects/vr-math-bridge');
});

test('every local project media reference resolves to a public asset', () => {
  const mediaPaths = projectCategories.flatMap((projectCategory) =>
    projectCategory.items.flatMap((item) => [
      item.image,
      item.detailImage,
      ...(item.detailImages?.map(({ src }) => src) ?? []),
      item.award?.image,
    ])
  ).filter(Boolean);

  for (const mediaPath of mediaPaths) {
    assert.ok(
      mediaPath.startsWith('/'),
      `Project media must use a root-relative public path: ${mediaPath}`
    );
    assert.ok(
      existsSync(join(repositoryRoot, 'public', mediaPath.slice(1))),
      `Missing project media asset: ${mediaPath}`
    );
  }
});

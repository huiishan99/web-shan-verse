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
  assert.equal(getProjectStatus(project(), category('unity')), 'private');
  assert.equal(getProjectStatus(project({ github: 'https://github.com/example' }), category('unity')), 'practice');
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

test('research archive corrects the website identity while preserving its stable routes', () => {
  const record = projectRecords.find(({ slug }) => slug === 'hexo-page');
  const { project: item, category: projectCategory } = record;
  assert.equal(projectCategory.id, 'web');
  assert.equal(item.title.en, 'Research Archive');
  assert.equal(item.title.zh, '研究成果档案');
  assert.equal(item.title.ja, '研究成果アーカイブ');
  assert.equal(item.website, 'https://web-publications.vercel.app/');
  assert.equal(item.github, undefined);
  assert.equal(getProjectStatus(item, projectCategory), 'live');
  assert.deepEqual(item.tags, ['Hexo', 'JavaScript', 'Markdown', 'EJS', 'CSS']);
  assert.equal(item.image, item.detailImages[0].src);
  assert.equal(item.detailImages[0].fit, 'contain');
  for (const locale of ['en', 'zh', 'ja']) {
    assert.ok(item.description[locale]);
    assert.ok(item.details[locale]);
    assert.ok(item.detailImages[0].alt[locale]);
    assert.ok(item.detailImages[0].caption[locale]);
    assert.equal(getProjectPath(record, locale), `${locale === 'en' ? '' : `/${locale}`}/projects/hexo-page`);
  }
});

test('Yumemi documents its actual frontend stack and unavailable data API', () => {
  const record = projectRecords.find(({ slug }) => slug === 'yumemi-test');
  const { project: item } = record;
  assert.equal(getProjectStatus(item, record.category), 'prototype');
  assert.equal(item.github, 'https://github.com/huiishan99/web-yumemi-test');
  assert.deepEqual(item.tags, ['TypeScript', 'React', 'Highcharts', 'Axios', 'CSS', 'Vite']);
  assert.match(item.description.en, /data API is unavailable/);
  assert.match(item.details.en, /Vitest and React Testing Library/);
  assert.equal(item.image, item.detailImages[0].src);
  assert.equal(item.detailImages[0].fit, 'contain');
  for (const locale of ['en', 'zh', 'ja']) {
    assert.ok(item.description[locale]);
    assert.ok(item.details[locale]);
    assert.ok(item.detailImages[0].alt[locale]);
    assert.ok(item.detailImages[0].caption[locale]);
  }
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

test('Unity contains all former VR entries without a separate VR category', () => {
  assert.equal(projectCategories.some(({ id }) => id === 'vr'), false);
  const unity = projectCategories.find(({ id }) => id === 'unity');
  assert.equal(unity.items.length, 8);
  for (const slug of ['vr-car-scene-prototype', 'ar-image-tracking', 'mamba-project', 'master-project']) {
    assert.ok(unity.items.some((item) => item.slug === slug));
  }
  for (const slug of ['ar-image-tracking', 'mamba-project', 'master-project']) {
    const item = unity.items.find((project) => project.slug === slug);
    assert.equal(getProjectStatus(item, unity), 'prototype');
  }
  const cabin = unity.items.find(({ slug }) => slug === 'vr-car-scene-prototype');
  assert.deepEqual(cabin.tags, ['Unity', 'HMI', 'Digital Cabin']);
  for (const locale of ['en', 'zh', 'ja']) {
    assert.match(cabin.description[locale], /Unity/);
    assert.doesNotMatch(cabin.details[locale], /CES 2025/);
    assert.ok(cabin.detailImages[0].caption[locale]);
    assert.doesNotMatch(cabin.description[locale] + cabin.details[locale], /VR|Quest/);
  }
  assert.match(cabin.details.en, /assigned automotive HMI topic/);
  assert.equal(cabin.image, cabin.detailImages[0].src);
  assert.equal(cabin.detailImages[0].fit, 'contain');
  assert.deepEqual(cabin.detailImages[0].source, { label: 'webCG', url: 'https://www.webcg.net/articles/-/43538' });
});

test('four additional course overviews have localized copy without private source links', () => {
  const school = projectCategories.find(({ id }) => id === 'school');
  assert.equal(school.items.length, 10);
  assert.equal(projectRecords.length, 53);
  for (const slug of ['wireless-and-mobile-networks', 'mathematics-and-post-quantum-cryptography', 'numerical-modeling-and-simulations', 'research-paper-writing-seminar']) {
    const item = school.items.find((project) => project.slug === slug);
    assert.ok(item);
    assert.equal(item.status, 'coursework');
    for (const field of ['github', 'website', 'paper', 'caseStudy']) assert.equal(item[field], undefined);
    for (const locale of ['en', 'zh', 'ja']) {
      assert.ok(item.title[locale]);
      assert.ok(item.description[locale]);
    }
  }
  assert.equal(projectRecords.filter(({ project: item }) => item.github?.includes('cfs03')).length, 1);
});

test('Solar System uses its authentic localized project media', () => {
  const solar = projectCategories.find(({ id }) => id === 'unity').items.find(({ slug }) => slug === 'solar-system');
  assert.equal(solar.image, '/images/projects/solar-system-preview.webp');
  assert.equal(solar.detailImageFit, 'contain');
  for (const locale of ['en', 'zh', 'ja']) assert.ok(solar.detailImageAlt[locale]);
  assert.equal(solar.github, 'https://github.com/huiishan99/unity-solar-system');
});

test('Snake documents the current Windows game and authentic localized screenshots', () => {
  const item = projectRecords.find(({ slug }) => slug === 'c-snake-game').project;
  assert.equal(item.github, 'https://github.com/huiishan99/game-csharp-snake');
  assert.deepEqual(item.tags, ['C#', '.NET Framework 4.7.2', 'Windows Forms', 'System.Drawing']);
  assert.match(item.description.en, /five play modes/);
  assert.match(item.details.en, /Classic, Arcade, Maze, Speed Run, and Zen/);
  assert.match(item.details.en, /per-mode local leaderboards/);
  assert.equal(item.image, item.detailImages[0].src);
  assert.equal(item.imagePosition, 'top');
  assert.equal(item.detailImages.length, 2);
  for (const locale of ['en', 'zh', 'ja']) {
    assert.ok(item.description[locale]);
    assert.ok(item.details[locale]);
    for (const image of item.detailImages) {
      assert.ok(image.alt[locale]);
      assert.ok(image.caption[locale]);
      assert.equal(image.fit, 'contain');
    }
  }
});

test('Notion Chinese Blog uses authentic localized media without changing its deployment copy', () => {
  const item = projectRecords.find(({ slug }) => slug === 'notion-next-chinese-blog').project;
  assert.equal(item.website, 'https://notion-next-huiishan99.vercel.app/');
  assert.equal(item.image, '/images/projects/notion-chinese-blog-homepage.webp');
  assert.equal(item.imagePosition, 'top');
  assert.equal(item.detailImages[0].src, item.image);
  assert.equal(item.detailImages[0].fit, 'contain');
  assert.deepEqual(item.tags, ['Next.js', 'Notion API', 'JavaScript']);
  for (const locale of ['en', 'zh', 'ja']) {
    assert.ok(item.detailImages[0].alt[locale]);
    assert.ok(item.detailImages[0].caption[locale]);
  }
});

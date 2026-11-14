import assert from 'node:assert/strict';
import test from 'node:test';
import { interests } from '../src/data/about.ts';
import { categories, nodes, edges, resolveLocalized } from '../src/data/beyond-code.ts';
import {
  connectedIds, createGraphLayout, fitCamera, screenToWorld, worldToScreen, zoomAt,
} from '../src/utils/beyond-code-graph.js';

const locales = ['en', 'zh', 'ja'];
const categoryById = new Map(categories.map((category) => [category.id, category]));
const nodeById = new Map(nodes.map((node) => [node.id, node]));
const titleOf = (item) => typeof item === 'object' && 'title' in item ? item.title : item;
const collectionKey = (category, title) => `${resolveLocalized(category)}\u0000${resolveLocalized(title)}`;

// Owner-approved scope: franchise names do not authorize any other installments.
const secondBatchSeries = {
  'games-resident-evil-series': [
    'games-resident-evil-4', 'games-resident-evil-2-1998',
    'games-resident-evil-village', 'games-resident-evil-requiem',
  ],
  'movies-indiana-jones-series': [
    'movies-raiders-of-the-lost-ark-1981',
    'movies-indiana-jones-and-the-temple-of-doom-1984',
    'movies-indiana-jones-and-the-last-crusade-1989',
    'movies-indiana-jones-and-the-kingdom-of-the-crystal-skull-2008',
    'movies-indiana-jones-and-the-dial-of-destiny-2023',
  ],
  'movies-the-mummy-series': [
    'movies-the-mummy-1999', 'movies-the-mummy-returns-2001',
    'movies-the-mummy-tomb-of-the-dragon-emperor-2008',
  ],
  'movies-terminator-series': [
    'movies-the-terminator-1984', 'movies-terminator-2-judgment-day-1991',
    'movies-terminator-3-rise-of-the-machines-2003',
    'movies-terminator-salvation-2009', 'movies-terminator-genisys-2015',
  ],
  'movies-harry-potter-series': [
    'movies-harry-potter-and-the-philosophers-stone-2001',
    'movies-harry-potter-and-the-chamber-of-secrets-2002',
    'movies-harry-potter-and-the-prisoner-of-azkaban-2004',
    'movies-harry-potter-and-the-goblet-of-fire-2005',
    'movies-harry-potter-and-the-order-of-the-phoenix-2007',
    'movies-harry-potter-and-the-half-blood-prince-2009',
    'movies-harry-potter-and-the-deathly-hallows-part-1-2010',
    'movies-harry-potter-and-the-deathly-hallows-part-2-2011',
  ],
};
const secondBatchStandaloneIds = [
  'games-nobunagas-ambition-sphere-of-influence', 'games-taiko-risshiden-v',
  'movies-3-idiots-2009', 'movies-the-pursuit-of-happyness-2006',
  'movies-how-to-train-your-dragon-2010', 'movies-project-hail-mary-2026',
  'movies-titanic-1997', 'movies-a-beautiful-mind-2001', 'movies-inception-2010',
  'movies-life-of-pi-2012', 'movies-gone-with-the-wind-1939',
  'movies-leon-the-professional-1994', 'movies-the-devil-wears-prada-2006',
];
const approvedSecondBatchIds = [
  ...Object.keys(secondBatchSeries),
  ...Object.values(secondBatchSeries).flat().filter((id) => id !== 'games-resident-evil-4'),
  ...secondBatchStandaloneIds,
];

test('the constellation preserves each existing interest once without adding inferred favorites', () => {
  const expected = new Map(interests.flatMap((category) => category.items.map((item) => [
    collectionKey(category.name, titleOf(item)), { category, item },
  ])));
  const collection = nodes.filter((node) => node.isContext === false);
  assert.equal(collection.length, interests.reduce((count, category) => count + category.items.length, 0));
  const seen = new Set();

  for (const node of collection) {
    const category = categoryById.get(node.category);
    assert.ok(category, `Missing category for ${node.id}`);
    const key = collectionKey(category.title, node.title);
    assert.ok(expected.has(key), `A new favorite was inferred: ${node.id}`);
    assert.equal(seen.has(key), false, `Duplicate collection entry: ${node.id}`);
    seen.add(key);
    const { item } = expected.get(key);
    for (const locale of locales) {
      assert.equal(resolveLocalized(node.title, locale), resolveLocalized(titleOf(item), locale));
    }
    if (typeof item === 'object' && 'title' in item) {
      assert.equal(node.wikiPage, item.wikiPage);
      assert.equal(node.previewProvider, item.previewProvider);
      assert.equal(node.itunesCountry, item.itunesCountry);
      assert.equal(node.audioSrc, item.audioSrc);
      assert.equal(node.type, item.kind ?? 'work');
      assert.equal(node.sizeBoost, item.sizeBoost ?? 0);
      assert.equal(node.externalUrl, item.externalUrl ?? (item.wikiPage
        ? `https://en.wikipedia.org/wiki/${encodeURIComponent(item.wikiPage.replaceAll(' ', '_'))}`
        : undefined));
      if (item.id) assert.equal(node.id, item.id);
    }
  }
  assert.deepEqual([...seen].sort(), [...expected.keys()].sort());
});

test('categories and nodes have unique identities, explicit roles and readable localized names', () => {
  assert.equal(categoryById.size, categories.length, 'Duplicate category ID');
  assert.equal(nodeById.size, nodes.length, 'Duplicate node ID');
  assert.equal(categories.length, interests.length);
  const roles = new Set(['work', 'person', 'group', 'studio', 'topic', 'series']);

  for (const category of categories) {
    assert.match(category.id, /^[a-z][a-z0-9-]*$/);
    assert.ok(category.icon);
    assert.ok(nodes.some((node) => node.category === category.id && !node.isContext));
    for (const locale of locales) assert.ok(resolveLocalized(category.title, locale).trim());
  }
  for (const node of nodes) {
    assert.match(node.id, /^[a-z][a-z0-9-]*$/);
    assert.ok(categoryById.has(node.category));
    assert.ok(roles.has(node.type), `Unrecognized node role: ${node.id}`);
    assert.equal(typeof node.isContext, 'boolean', `Unspecified collection/context role: ${node.id}`);
    for (const locale of locales) assert.ok(resolveLocalized(node.title, locale).trim());
    if (node.externalUrl) {
      const url = new URL(node.externalUrl);
      assert.equal(url.protocol, 'https:');
      assert.equal(url.username, '');
      assert.equal(url.password, '');
    }
  }
});

test('only existing favorites and the exact user-approved expansion enter the collection', () => {
  const existing = [
    'games-the-legend-of-zelda-breath-of-the-wild', 'games-baldurs-gate-3',
    'games-stardew-valley', 'games-persona-5', 'games-crusader-kings-iii',
    'games-cyberpunk-2077', 'games-disco-elysium-the-final-cut',
    'games-uncharted-waters-new-horizons', 'games-resident-evil-4',
    'games-the-legend-of-sword-and-fairy-4',
    'movies-coco', 'movies-ratatouille', 'movies-flipped', 'movies-howls-moving-castle',
    'movies-the-truman-show', 'movies-interstellar', 'movies-the-lord-of-the-rings',
    'movies-the-reluctant-fundamentalist', 'movies-maharaja',
    'drama-love-death-robots', 'drama-cyberpunk-edgerunners', 'drama-the-queens-gambit',
    'drama-gin-tama', 'drama-doraemon', 'books-les-miserables',
    'books-a-thousand-splendid-suns', 'books-to-live', 'books-tristan-and-iseult',
    'books-kinder-und-hausmarchen', 'music-bohemian-rhapsody',
    'music-we-are-the-champions', 'music-lemon', 'foods-ramen', 'foods-sushi',
    'foods-hot-pot', 'hobbies-traveling', 'hobbies-reading', 'hobbies-gaming',
    'hobbies-board-gaming', 'topics-analytical-psychology', 'topics-existentialism',
    'topics-cosmology', 'topics-socionics',
  ];
  const approved = [
    'music-fujii-kaze', 'music-matsuri', 'music-kirari', 'topics-carl-jung',
    'music-another-one-bites-the-dust', 'movies-disney', 'movies-spider-man-2002',
    'movies-ben-hur-1959', 'foods-jiro-ramen', 'foods-otoro', 'foods-yakiniku',
    'foods-wagyu', 'foods-beef-tongue', 'movies-the-fellowship-of-the-ring',
    'movies-the-two-towers', 'movies-the-return-of-the-king',
  ];
  assert.deepEqual(nodes.filter((node) => !node.isContext).map((node) => node.id).sort(),
    [...existing, ...approved, ...approvedSecondBatchIds].sort());
  assert.equal(approvedSecondBatchIds.length, 42);
  assert.deepEqual(nodes.filter((node) => node.isContext).map((node) => node.id).sort(),
    ['group-queen', 'person-kenshi-yonezu', 'studio-ghibli', 'studio-pixar']);
  assert.equal(nodeById.has('book-howls-moving-castle'), false);
  assert.equal(nodeById.has('person-diana-wynne-jones'), false);
  for (const [id, type] of [
    ['music-fujii-kaze', 'person'], ['topics-carl-jung', 'person'],
    ['movies-disney', 'studio'], ['movies-the-lord-of-the-rings', 'series'],
  ]) {
    assert.equal(nodeById.get(id).type, type);
    assert.equal(nodeById.get(id).isContext, false);
  }
  assert.equal(nodeById.get('movies-spider-man-2002').wikiPage, 'Spider-Man (2002 film)');
  assert.equal(nodeById.get('movies-ben-hur-1959').wikiPage, 'Ben-Hur (1959 film)');
});

test('the second batch preserves clarified editions, films and exact series scope', () => {
  for (const [id, wikiPage, title] of [
    ['games-resident-evil-2-1998', 'Resident Evil 2', 'Resident Evil 2 (1998)'],
    ['games-resident-evil-village', 'Resident Evil Village', 'Resident Evil Village (2021)'],
    ['games-resident-evil-requiem', 'Resident Evil Requiem', 'Resident Evil Requiem (2026)'],
    ['games-taiko-risshiden-v', 'Taikou Risshiden V', 'Taikō Risshiden V (2004)'],
    ['movies-how-to-train-your-dragon-2010', 'How to Train Your Dragon (2010 film)', 'How to Train Your Dragon (2010)'],
    ['movies-project-hail-mary-2026', 'Project Hail Mary (film)', 'Project Hail Mary (2026)'],
  ]) {
    const node = nodeById.get(id);
    assert.equal(node.type, 'work');
    assert.equal(node.isContext, false);
    assert.equal(node.wikiPage, wikiPage);
    assert.equal(resolveLocalized(node.title), title);
  }
  const nobunaga = nodeById.get('games-nobunagas-ambition-sphere-of-influence');
  assert.equal(resolveLocalized(nobunaga.title), "Nobunaga's Ambition: Sphere of Influence (XIV)");
  assert.equal(nobunaga.externalUrl, 'https://store.steampowered.com/app/392470/');
  assert.equal(nodeById.get('music-kirari').externalUrl, 'https://fujiikaze.com/music/kirari/');
  for (const [parent, children] of Object.entries(secondBatchSeries)) {
    assert.equal(nodeById.get(parent).type, 'series');
    assert.equal(nodeById.get(parent).isContext, false);
    assert.deepEqual(edges.filter((edge) => edge.relationship === 'part-of' && edge.target === parent)
      .map((edge) => edge.source).sort(), [...children].sort());
  }
  for (const excluded of [
    'games-resident-evil-2-2019', 'games-taiko-risshiden-v-dx',
    'movies-how-to-train-your-dragon-2025', 'books-project-hail-mary',
    'movies-the-mummy-2017', 'movies-terminator-dark-fate-2019',
    'movies-fantastic-beasts-and-where-to-find-them-2016',
  ]) assert.equal(nodeById.has(excluded), false, `Unapproved expansion: ${excluded}`);
});

test('no owner preference boost is inferred from series membership or popularity', () => {
  for (const item of interests.flatMap((category) => category.items)) {
    if (typeof item === 'object' && 'title' in item) assert.equal(item.sizeBoost, undefined);
  }
  for (const node of nodes) {
    assert.ok([0, 1, 2, 3].includes(node.sizeBoost ?? 0));
    assert.equal(node.sizeBoost ?? 0, 0, `Unconfirmed preference boost: ${node.id}`);
  }
});

test('graph edges have valid endpoints, semantic relations and traceable provenance', () => {
  const relations = new Set(['performed-by', 'written-by', 'adapted-from', 'produced-by',
    'shared-universe', 'associated-with', 'part-of', 'style-of', 'ingredient-of']);
  const edgeIds = new Set();
  const edgeFacts = new Set();

  for (const edge of edges) {
    assert.ok(nodeById.has(edge.source), `Missing source: ${edge.id}`);
    assert.ok(nodeById.has(edge.target), `Missing target: ${edge.id}`);
    assert.notEqual(edge.source, edge.target, `Self relation: ${edge.id}`);
    assert.equal(edgeIds.has(edge.id), false, `Duplicate edge ID: ${edge.id}`);
    edgeIds.add(edge.id);
    assert.ok(relations.has(edge.relationship), `Unspecified relation: ${edge.id}`);
    const endpoints = edge.relationship === 'shared-universe'
      ? [edge.source, edge.target].sort() : [edge.source, edge.target];
    const fact = [edge.relationship, ...endpoints].join('\u0000');
    assert.equal(edgeFacts.has(fact), false, `Duplicate relation: ${edge.id}`);
    edgeFacts.add(fact);
    for (const locale of locales) assert.ok(resolveLocalized(edge.label, locale).trim());
    assert.ok(['existing-metadata', 'official-source', 'user-confirmed'].includes(edge.provenance.kind));
    assert.ok(edge.provenance.source.trim());
    if (edge.provenance.kind === 'official-source') {
      const url = new URL(edge.provenance.source);
      assert.equal(url.protocol, 'https:');
      assert.equal(url.username, '');
      assert.equal(url.password, '');
    } else if (edge.provenance.kind === 'existing-metadata') {
      assert.match(edge.provenance.source, /^src\/data\/about\.ts#/);
      assert.equal(edge.relationship, 'performed-by');
    } else if (edge.provenance.source === 'docs/beyond-code-preview.md#approved-expansion-2026-11-14') {
      assert.equal(edge.provenance.source, 'docs/beyond-code-preview.md#approved-expansion-2026-11-14');
      assert.ok(['style-of', 'ingredient-of'].includes(edge.relationship));
      assert.equal(nodeById.get(edge.source).category, 'foods');
      assert.equal(nodeById.get(edge.target).category, 'foods');
    } else {
      assert.equal(edge.provenance.source, 'docs/beyond-code-preview.md#approved-expansion-2026-11-14-second-batch');
      assert.equal(edge.relationship, 'part-of');
      assert.ok(Object.hasOwn(secondBatchSeries, edge.target));
      assert.ok(secondBatchSeries[edge.target].includes(edge.source));
    }
  }
});

test('relationship direction preserves creators, studios, series and explicit food meanings', () => {
  for (const edge of edges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    switch (edge.relationship) {
      case 'performed-by':
        assert.equal(source.type, 'work');
        assert.equal(source.category, 'music');
        assert.ok(['person', 'group'].includes(target.type));
        break;
      case 'written-by':
        assert.equal(source.type, 'work');
        assert.equal(source.category, 'books');
        assert.equal(target.type, 'person');
        break;
      case 'adapted-from':
        assert.equal(source.type, 'work');
        assert.ok(['movies', 'drama'].includes(source.category));
        assert.equal(target.type, 'work');
        assert.equal(target.category, 'books');
        break;
      case 'produced-by':
        assert.equal(source.type, 'work');
        assert.ok(['movies', 'drama'].includes(source.category));
        assert.equal(target.type, 'studio');
        break;
      case 'shared-universe':
        assert.equal(source.type, 'work');
        assert.equal(target.type, 'work');
        break;
      case 'associated-with':
        assert.ok((source.category === 'movies' && source.type === 'work'
          && target.category === 'movies' && target.type === 'studio')
          || (source.category === 'topics' && source.type === 'topic'
            && target.category === 'topics' && target.type === 'person'));
        break;
      case 'part-of':
        assert.equal(source.type, 'work');
        assert.ok(['games', 'movies'].includes(source.category));
        assert.equal(target.type, 'series');
        assert.equal(target.category, source.category);
        break;
      case 'style-of':
      case 'ingredient-of':
        assert.equal(source.type, 'topic');
        assert.equal(target.type, 'topic');
        assert.equal(source.category, 'foods');
        assert.equal(target.category, 'foods');
        break;
    }
  }
  for (const context of nodes.filter((node) => node.isContext)) {
    assert.ok(edges.some((edge) => edge.source === context.id || edge.target === context.id),
      `Context node must explain a real relation: ${context.id}`);
  }
});

test('approved branches have exact endpoints without introducing unrelated works or authors', () => {
  const facts = (relationship) => edges.filter((edge) => edge.relationship === relationship)
    .map((edge) => `${edge.source}->${edge.target}`).sort();
  assert.deepEqual(facts('part-of'), [
    'movies-the-fellowship-of-the-ring->movies-the-lord-of-the-rings',
    'movies-the-return-of-the-king->movies-the-lord-of-the-rings',
    'movies-the-two-towers->movies-the-lord-of-the-rings',
    ...Object.entries(secondBatchSeries).flatMap(([parent, children]) =>
      children.map((child) => `${child}->${parent}`)),
  ].sort());
  assert.deepEqual(facts('style-of'), ['foods-jiro-ramen->foods-ramen']);
  assert.deepEqual(facts('ingredient-of'), [
    'foods-beef-tongue->foods-yakiniku', 'foods-otoro->foods-sushi',
    'foods-wagyu->foods-yakiniku',
  ]);
  assert.deepEqual(facts('associated-with'), [
    'movies-coco->movies-disney', 'movies-ratatouille->movies-disney',
    'topics-analytical-psychology->topics-carl-jung',
  ]);
  assert.equal(edges.some((edge) => edge.source.includes('diana-wynne-jones')
    || edge.target.includes('diana-wynne-jones') || edge.source === 'book-howls-moving-castle'
    || edge.target === 'book-howls-moving-castle'), false);
  assert.equal(edges.some((edge) => edge.relationship === 'produced-by'
    && edge.target === 'movies-disney'), false, 'Disney is not mislabeled as the Pixar production studio');
});

test('performer relations exactly reflect artist metadata without suggesting other favorites', () => {
  const artistItems = interests.flatMap((category) => category.items.filter((item) =>
    typeof item === 'object' && 'title' in item && item.artist,
  ));
  const performerEdges = edges.filter((edge) => edge.relationship === 'performed-by');
  assert.equal(performerEdges.length, artistItems.length);

  for (const item of artistItems) {
    const songs = nodes.filter((node) => !node.isContext && node.category === 'music'
      && resolveLocalized(node.title) === resolveLocalized(item.title));
    assert.equal(songs.length, 1);
    const matches = performerEdges.filter((edge) => edge.source === songs[0].id);
    assert.equal(matches.length, 1);
    assert.equal(resolveLocalized(nodeById.get(matches[0].target).title), resolveLocalized(item.artist));
  }
});

test('localization provides deterministic readable fallbacks without mutating content', () => {
  const complete = Object.freeze({ en: 'English', zh: '中文', ja: '日本語' });
  const partial = Object.freeze({ en: 'Default', zh: '本地文字' });
  assert.equal(resolveLocalized(complete, 'zh'), '中文');
  assert.equal(resolveLocalized(complete, 'ja'), '日本語');
  assert.equal(resolveLocalized(complete, 'fr'), 'English');
  assert.equal(resolveLocalized(partial, 'ja'), 'Default');
  assert.equal(resolveLocalized({ zh: '只有中文' }, 'en'), '只有中文');
  assert.equal(resolveLocalized('Queen', 'ja'), 'Queen');
  assert.equal(resolveLocalized(undefined, 'en'), '');
  assert.deepEqual(complete, { en: 'English', zh: '中文', ja: '日本語' });
});

const closeTo = (actual, expected, message) => {
  assert.ok(Math.abs(actual - expected) <= 1e-8 * Math.max(1, Math.abs(expected)),
    `${message}: expected ${expected}, received ${actual}`);
};

test('camera projection round-trips points across viewport sizes and zoom limits', () => {
  const viewports = [{ width: 390, height: 580 }, { width: 1440, height: 900 }, { width: 1, height: 1 }];
  const cameras = [
    { x: 0, y: 0, scale: 0.22 },
    { x: -1000, y: 2600, scale: 0.8 },
    { x: 2100, y: -500, scale: 2.4 },
  ];
  const points = [{ x: 0, y: 0 }, { x: -200, y: 1800 }, { x: 1999.25, y: -0.5 }];
  for (const viewport of viewports) {
    for (const camera of cameras) {
      for (const point of points) {
        const screen = worldToScreen(point, camera, viewport);
        const recovered = screenToWorld(screen, camera, viewport);
        closeTo(recovered.x, point.x, 'World x survives projection');
        closeTo(recovered.y, point.y, 'World y survives projection');
        const screenRecovered = worldToScreen(screenToWorld(point, camera, viewport), camera, viewport);
        closeTo(screenRecovered.x, point.x, 'Screen x survives inverse projection');
        closeTo(screenRecovered.y, point.y, 'Screen y survives inverse projection');
      }
    }
  }
});

test('zoom preserves the world under the pointer even when scale clamps', () => {
  const viewport = Object.freeze({ width: 950, height: 680 });
  const camera = Object.freeze({ x: 800, y: 520, scale: 0.67 });
  const points = [{ x: 0, y: 0 }, { x: 475, y: 340 }, { x: 910, y: 600 }, { x: -20, y: 720 }];
  for (const point of points) {
    const anchor = screenToWorld(point, camera, viewport);
    for (const requestedScale of [0.0001, 0.22, 0.67, 1.25, 2.4, 1000]) {
      const next = zoomAt(camera, point, requestedScale, viewport);
      assert.ok(next.scale >= 0.22 && next.scale <= 2.4);
      const projected = worldToScreen(anchor, next, viewport);
      closeTo(projected.x, point.x, 'Zoom x anchor remains under pointer');
      closeTo(projected.y, point.y, 'Zoom y anchor remains under pointer');
    }
  }
  assert.equal(zoomAt(camera, points[0], 0.001, viewport).scale, 0.22);
  assert.equal(zoomAt(camera, points[0], 100, viewport).scale, 2.4);
  assert.deepEqual(camera, { x: 800, y: 520, scale: 0.67 });
});

test('fitting keeps a feasible cloud inside the viewport and is translation invariant', () => {
  const points = [{ x: -180, y: -160 }, { x: 430, y: 290 }, { x: 0, y: 110 }, { x: 250, y: -50 }];
  const viewport = { width: 1000, height: 780 };
  const padding = 85;
  const camera = fitCamera(points, viewport, padding);
  for (const point of points) {
    const projected = worldToScreen(point, camera, viewport);
    assert.ok(projected.x >= padding - 1e-8 && projected.x <= viewport.width - padding + 1e-8);
    assert.ok(projected.y >= padding - 1e-8 && projected.y <= viewport.height - padding + 1e-8);
  }
  const translation = { x: -1200, y: 2320 };
  const shiftedPoints = points.map((point) => ({ x: point.x + translation.x, y: point.y + translation.y }));
  const shiftedCamera = fitCamera(shiftedPoints, viewport, padding);
  closeTo(shiftedCamera.scale, camera.scale, 'Translation does not change fit scale');
  points.forEach((point, index) => {
    const original = worldToScreen(point, camera, viewport);
    const shifted = worldToScreen(shiftedPoints[index], shiftedCamera, viewport);
    closeTo(shifted.x, original.x, 'Translation preserves framing x');
    closeTo(shifted.y, original.y, 'Translation preserves framing y');
  });
});

test('empty, single-point and tiny-viewport fits remain finite and bounded', () => {
  for (const viewport of [{ width: 0, height: 0 }, { width: 1, height: 1 }, { width: 390, height: 200 }]) {
    for (const points of [[], [{ x: -1e6, y: 1e6 }], [{ x: -2000, y: 0 }, { x: 2000, y: 3000 }]]) {
      const camera = fitCamera(points, viewport);
      assert.ok(Number.isFinite(camera.x));
      assert.ok(Number.isFinite(camera.y));
      assert.ok(Number.isFinite(camera.scale));
      assert.ok(camera.scale >= 0.22 && camera.scale <= 1.5);
      for (const point of points) {
        const projected = worldToScreen(point, camera, viewport);
        assert.ok(Number.isFinite(projected.x));
        assert.ok(Number.isFinite(projected.y));
        if (points.length === 1) {
          closeTo(projected.x, viewport.width / 2, 'Single point is centered horizontally');
          closeTo(projected.y, viewport.height / 2, 'Single point is centered vertically');
        }
      }
    }
  }
});

test('graph adjacency stays local and stable layout does not mutate content', () => {
  const relations = Object.freeze([
    Object.freeze({ source: 'film', target: 'book' }),
    Object.freeze({ source: 'book', target: 'author' }),
    Object.freeze({ source: 'song', target: 'artist' }),
  ]);
  assert.deepEqual([...connectedIds('book', relations)].sort(), ['author', 'book', 'film']);
  assert.deepEqual([...connectedIds('film', relations)].sort(), ['book', 'film']);
  assert.deepEqual([...connectedIds('unrelated', relations)], ['unrelated']);
  const content = Object.freeze(nodes.map((node) => Object.freeze({ ...node })));
  const layout = createGraphLayout(content);
  assert.deepEqual(layout, createGraphLayout(content), 'Initial positions are reproducible');
  assert.deepEqual(layout.map((node) => node.id), content.map((node) => node.id));
  assert.notEqual(layout[0], content[0]);
  for (const position of layout) {
    for (const key of ['x', 'y', 'anchorX', 'anchorY', 'phase', 'radius']) assert.ok(Number.isFinite(position[key]));
    assert.equal(position.x, position.anchorX);
    assert.equal(position.y, position.anchorY);
    assert.ok(position.radius > 0);
  }
});

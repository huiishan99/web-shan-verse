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
    }
  }
  assert.deepEqual([...seen].sort(), [...expected.keys()].sort());
});

test('categories and nodes have unique identities, explicit roles and readable localized names', () => {
  assert.equal(categoryById.size, categories.length, 'Duplicate category ID');
  assert.equal(nodeById.size, nodes.length, 'Duplicate node ID');
  assert.equal(categories.length, interests.length);
  const roles = new Set(['work', 'person', 'group', 'studio', 'topic']);

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
    if (['person', 'group', 'studio'].includes(node.type)) assert.equal(node.isContext, true);
    if (node.externalUrl) {
      const url = new URL(node.externalUrl);
      assert.equal(url.protocol, 'https:');
      assert.equal(url.username, '');
      assert.equal(url.password, '');
    }
  }
});

test('graph edges have valid endpoints, semantic relations and traceable provenance', () => {
  const relations = new Set(['performed-by', 'written-by', 'adapted-from', 'produced-by', 'shared-universe']);
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
    assert.ok(['existing-metadata', 'official-source'].includes(edge.provenance.kind));
    assert.ok(edge.provenance.source.trim());
    if (edge.provenance.kind === 'official-source') {
      const url = new URL(edge.provenance.source);
      assert.equal(url.protocol, 'https:');
      assert.equal(url.username, '');
      assert.equal(url.password, '');
    } else {
      assert.match(edge.provenance.source, /^src\/data\/about\.ts#/);
      assert.equal(edge.relationship, 'performed-by');
    }
  }
});

test('relationship direction preserves creator, adaptation and studio meanings', () => {
  for (const edge of edges) {
    const source = nodeById.get(edge.source);
    const target = nodeById.get(edge.target);
    assert.equal(source.type, 'work', `Relations originate from a work: ${edge.id}`);
    switch (edge.relationship) {
      case 'performed-by':
        assert.equal(source.category, 'music');
        assert.ok(['person', 'group'].includes(target.type));
        assert.equal(target.isContext, true);
        break;
      case 'written-by':
        assert.equal(source.category, 'books');
        assert.equal(target.type, 'person');
        assert.equal(target.isContext, true);
        break;
      case 'adapted-from':
        assert.ok(['movies', 'drama'].includes(source.category));
        assert.equal(target.type, 'work');
        assert.equal(target.category, 'books');
        break;
      case 'produced-by':
        assert.ok(['movies', 'drama'].includes(source.category));
        assert.equal(target.type, 'studio');
        assert.equal(target.isContext, true);
        break;
      case 'shared-universe':
        assert.equal(target.type, 'work');
        break;
    }
  }
  for (const context of nodes.filter((node) => node.isContext)) {
    assert.ok(edges.some((edge) => edge.source === context.id || edge.target === context.id),
      `Context node must explain a real relation: ${context.id}`);
  }
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

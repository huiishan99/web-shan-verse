import assert from 'node:assert/strict';
import test from 'node:test';
import { createViewHistory } from '../src/utils/beyond-code-navigation.js';

const view = (extra = {}) => ({
  category: 'all', query: '', mode: 'graph', selected: null,
  camera: { x: 800, y: 600, scale: 0.5 },
  userOffsets: [['song', { x: 12, y: -9 }]],
  positions: [['song', { x: 132, y: 91 }]],
  ...extra,
});

test('Back retraces a category and related-item traversal without leaving the page', () => {
  const history = createViewHistory();
  const overview = view();
  const music = view({ category: 'music', camera: { x: 350, y: 900, scale: 1.1 } });
  const song = view({ category: 'music', selected: 'song' });
  history.push(overview); // Open Music.
  history.push(music); // Open a song.
  history.push(song); // Follow its artist.

  assert.deepEqual(history.back(), song);
  assert.deepEqual(history.back(), music);
  assert.deepEqual(history.back(), overview);
  assert.equal(history.canGoBack(), false);
  assert.equal(history.back(), undefined);
});

test('return points own independent camera and placement snapshots', () => {
  const history = createViewHistory();
  const original = view();
  const expected = structuredClone(original);
  history.push(original);
  original.camera.x = -999;
  original.userOffsets[0][1].x = 400;
  original.userOffsets.push(['artist', { x: 10, y: 20 }]);
  original.positions[0][1].y = 999;
  original.positions.push(['artist', { x: 25, y: 60 }]);
  assert.deepEqual(history.back(), expected);
});

test('repeating one logical view keeps its first return camera rather than adding zoom steps', () => {
  const history = createViewHistory();
  const original = view();
  assert.equal(history.push(original), true);
  assert.equal(history.push(view({ camera: { x: 100, y: 50, scale: 2 } })), false);
  assert.deepEqual(history.back(), original);
  assert.equal(history.canGoBack(), false);
});

test('query, mode and selection each identify a distinct in-page return point', () => {
  const history = createViewHistory();
  const overview = view();
  const index = view({ mode: 'index' });
  const search = view({ mode: 'index', query: 'queen' });
  const selection = view({ selected: 'group-queen', query: 'queen' });
  for (const snapshot of [overview, index, search, selection]) history.push(snapshot);
  for (const snapshot of [selection, search, index, overview]) assert.deepEqual(history.back(), snapshot);
});

test('a bounded history retains the most recent return points and can be reset', () => {
  const history = createViewHistory(2);
  history.push(view());
  const games = view({ category: 'games' });
  const books = view({ category: 'books' });
  history.push(games);
  history.push(books);
  assert.deepEqual(history.back(), books);
  assert.deepEqual(history.back(), games);
  assert.equal(history.back(), undefined);

  history.push(view());
  history.clear();
  assert.equal(history.canGoBack(), false);
  assert.equal(history.back(), undefined);
});

test('invalid bounds are rejected instead of making an unbounded history', () => {
  for (const limit of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createViewHistory(limit), RangeError);
  }
});

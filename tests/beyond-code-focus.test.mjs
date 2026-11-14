import assert from 'node:assert/strict';
import test from 'node:test';
import { nodes, edges } from '../src/data/beyond-code.ts';
import { selectionFocusIds } from '../src/utils/beyond-code-focus.js';
import { connectedIds, createGraphLayout, fitCamera, worldToScreen } from '../src/utils/beyond-code-graph.js';
import { baseNodeDiameter, screenNodeDiameter } from '../src/utils/beyond-code-sizing.js';

test('selection framing excludes distant categories without changing the relationship set', () => {
  const byId = new Map([
    ['selected', { category: 'games' }],
    ['same-category', { category: 'games' }],
    ['unconnected', { category: 'games' }],
    ['cross-category', { category: 'drama' }],
  ]);
  const neighbors = new Set(['selected', 'same-category', 'cross-category', 'unknown']);
  const original = [...neighbors];
  assert.deepEqual(selectionFocusIds('selected', byId, neighbors), ['selected', 'same-category']);
  assert.deepEqual([...neighbors], original);
});

test('an isolated selection remains a camera framing point', () => {
  const byId = new Map([['isolated', { category: 'books' }]]);
  assert.deepEqual(selectionFocusIds('isolated', byId, []), ['isolated']);
  assert.deepEqual(selectionFocusIds('unknown', byId, ['isolated']), []);
});

test('the real Cyberpunk cross-category pair frames the selected artwork inside desktop and mobile viewports', () => {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const mobile of [false, true]) {
    const layout = new Map(createGraphLayout(nodes, edges, { mobile }).map((node) => [node.id, node]));
    const viewport = mobile ? { width: 375.4, height: 275 } : { width: 688, height: 755 };
    for (const selectedId of ['games-cyberpunk-2077', 'drama-cyberpunk-edgerunners']) {
      const neighbors = connectedIds(selectedId, edges);
      assert.ok(neighbors.size > 1, 'Keep the real cross-category relationship');
      const ids = selectionFocusIds(selectedId, byId, neighbors);
      assert.deepEqual(ids, [selectedId]);
      const camera = fitCamera(ids.map((id) => layout.get(id)), viewport, mobile ? 72 : 125);
      camera.scale = Math.min(camera.scale, mobile ? 0.95 : 1.35);
      const selected = worldToScreen(layout.get(selectedId), camera, viewport);
      const radius = screenNodeDiameter(baseNodeDiameter(neighbors.size - 1), camera.scale, true) / 2;
      assert.ok(selected.x - radius >= 0 && selected.x + radius <= viewport.width);
      assert.ok(selected.y - radius >= 0 && selected.y + radius <= viewport.height);
    }
  }
});

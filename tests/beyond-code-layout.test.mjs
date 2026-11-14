import assert from 'node:assert/strict';
import test from 'node:test';
import { nodes, edges } from '../src/data/beyond-code.ts';
import { clusterCenters, createGraphLayout } from '../src/utils/beyond-code-graph.js';

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const byId = (layout) => new Map(layout.map((node) => [node.id, node]));

test('omitting relations preserves the existing deterministic category layout and node metadata', () => {
  const fixture = [{ id: 'game', category: 'games', type: 'work' },
    { id: 'book', category: 'books', type: 'work' }];
  const layout = createGraphLayout(fixture);
  assert.deepEqual(layout, createGraphLayout(fixture, []));
  assert.equal(layout[0].x, clusterCenters.games.x);
  assert.equal(layout[0].y, clusterCenters.games.y - 35 * 0.87);
  assert.equal(layout[1].x, clusterCenters.books.x);
  assert.equal(layout[1].y, clusterCenters.books.y - 35 * 0.87);
  assert.equal(layout[0].radius, 34);
  assert.equal(layout[0].major, true);
  assert.equal(layout[0].phase, 0);
  assert.equal(layout[0].anchorX, layout[0].x);
  assert.equal(layout[0].anchorY, layout[0].y);
});

test('every actual cross-category relation is materially shorter and Cyberpunk no longer spans the graph', () => {
  const original = byId(createGraphLayout(nodes));
  const related = byId(createGraphLayout(nodes, edges));
  const dataById = new Map(nodes.map((node) => [node.id, node]));
  const cross = edges.filter((edge) => dataById.get(edge.source).category !== dataById.get(edge.target).category);
  assert.deepEqual(cross.map((edge) => [edge.source, edge.target]),
    [['games-cyberpunk-2077', 'drama-cyberpunk-edgerunners']],
    'Removing the unread Howl novel leaves only the approved Cyberpunk cross-category branch');
  for (const edge of cross) {
    const before = distance(original.get(edge.source), original.get(edge.target));
    const after = distance(related.get(edge.source), related.get(edge.target));
    assert.ok(after < before * 0.65, `${edge.source}: ${before} -> ${after}`);
  }
  assert.ok(distance(related.get('games-cyberpunk-2077'), related.get('drama-cyberpunk-edgerunners')) <= 550);
});

test('base anchors remain bounded, finite, separated and preserve node identity metadata', () => {
  const original = byId(createGraphLayout(nodes));
  const related = createGraphLayout(nodes, edges);
  assert.equal(related.length, nodes.length);
  for (const node of related) {
    const before = original.get(node.id);
    assert.ok([node.x, node.y, node.anchorX, node.anchorY].every(Number.isFinite));
    assert.ok(distance(node, before) <= 520 + 1e-6, `Displacement budget exceeded: ${node.id}`);
    assert.equal(node.anchorX, node.x); assert.equal(node.anchorY, node.y);
    assert.equal(node.radius, before.radius); assert.equal(node.major, before.major);
    assert.equal(node.phase, before.phase);
  }
  for (let first = 0; first < related.length; first++) {
    for (let second = first + 1; second < related.length; second++) {
      assert.ok(distance(related[first], related[second]) >= 100 - 0.01,
        `Initial pile: ${related[first].id}, ${related[second].id}`);
    }
  }
});

test('short relations and context branches keep space instead of collapsing to the same point', () => {
  const layout = byId(createGraphLayout(nodes, edges));
  for (const edge of edges) {
    const length = distance(layout.get(edge.source), layout.get(edge.target));
    assert.ok(length >= 100 - 0.01, `Collapsed relation: ${edge.source}`);
    assert.ok(length <= 550, `Context remained remote: ${edge.source} -> ${edge.target}: ${length}`);
  }
});

test('category geography stays recognizable from the original collection, not newly inferred relationships', () => {
  const layout = byId(createGraphLayout(nodes, edges));
  for (const [category, center] of Object.entries(clusterCenters)) {
    const collection = nodes.filter((node) => node.category === category && !node.isContext);
    const mean = collection.reduce((point, node) => ({
      x: point.x + layout.get(node.id).x / collection.length,
      y: point.y + layout.get(node.id).y / collection.length,
    }), { x: 0, y: 0 });
    assert.ok(distance(mean, center) < 210, `Category geography lost: ${category}`);
  }
});

test('relation order and duplicate or reversed records do not change anchor strength', () => {
  const baseline = createGraphLayout(nodes, edges);
  const reordered = [...edges].reverse();
  assert.deepEqual(createGraphLayout(nodes, reordered), baseline);
  assert.deepEqual(createGraphLayout(nodes, [...reordered, edges[0],
    { source: edges[0].target, target: edges[0].source }]), baseline);
});

test('missing endpoints, self edges and malformed relations cannot perturb valid anchors', () => {
  const invalid = [null, {}, { source: 'absent', target: nodes[0].id },
    { source: nodes[0].id, target: 'absent' }, { source: nodes[0].id, target: nodes[0].id }];
  assert.deepEqual(createGraphLayout(nodes, invalid), createGraphLayout(nodes));
  assert.deepEqual(createGraphLayout(nodes, [...invalid, ...edges]), createGraphLayout(nodes, edges));
});

test('layout handles direct synthetic links generically and never mutates frozen source data', () => {
  const fixture = [{ id: 'a', category: 'games', type: 'work', isContext: false },
    { id: 'b', category: 'topics', type: 'topic', isContext: false }];
  const links = [{ source: 'a', target: 'b' }];
  const before = structuredClone({ fixture, links });
  fixture.forEach(Object.freeze); links.forEach(Object.freeze);
  Object.freeze(fixture); Object.freeze(links);
  const original = createGraphLayout(fixture);
  const related = createGraphLayout(fixture, links);
  assert.ok(distance(related[0], related[1]) < distance(original[0], original[1]) * 0.65);
  assert.ok(distance(related[0], related[1]) >= 180);
  assert.deepEqual({ fixture, links }, before);
  assert.deepEqual(createGraphLayout([], links), []);
});

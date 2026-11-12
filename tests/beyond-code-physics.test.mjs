import assert from 'node:assert/strict';
import test from 'node:test';
import { solveStatic, stepPhysics } from '../src/utils/beyond-code-physics.js';

const body = (id, x, y, extra = {}) => ({ id, x, y, targetX: x, targetY: y,
  vx: 0, vy: 0, radius: 12, ...extra });
const advance = (nodes, links, frames, options = {}) => {
  let result;
  for (let frame = 0; frame < frames; frame++) result = stepPhysics(nodes, links, { dt: 1 / 60, ...options });
  return result;
};
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('a sideways drag pulls a linked neighbor while an unrelated distant body stays at its anchor', () => {
  const nodes = [body('drag', 0, 0), body('linked', 500, 0), body('unrelated', 1000, 0)];
  advance(nodes, [{ source: 'drag', target: 'linked' }], 60,
    { draggedId: 'drag', dragPoint: { x: 0, y: 160 } });
  assert.equal(nodes[0].x, 0); assert.equal(nodes[0].y, 160);
  assert.ok(nodes[1].y > 70, `The linked node did not follow: ${nodes[1].y}`);
  assert.equal(nodes[2].x, 1000); assert.equal(nodes[2].y, 0);
  assert.equal(nodes[0].vx, 0); assert.equal(nodes[0].vy, 0);
});

test('the displacement reaches a second linked neighbor, rather than translating the whole graph', () => {
  const nodes = [body('a', 0, 0), body('b', 200, 0), body('c', 400, 0), body('d', 800, 0)];
  const links = [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }];
  advance(nodes, links, 120, { draggedId: 'a', dragPoint: { x: 0, y: 140 } });
  assert.ok(nodes[1].y > nodes[2].y && nodes[2].y > 15);
  assert.equal(nodes[3].y, 0);
});

test('an unrelated nearby circle yields to a pinned drag and never displaces the pointer', () => {
  const nodes = [body('drag', 0, 0), body('nearby', 60, 0)];
  stepPhysics(nodes, [], { dt: 1 / 60, draggedId: 'drag', dragPoint: { x: 57, y: 0 }, padding: 8 });
  assert.equal(nodes[0].x, 57); assert.equal(nodes[0].y, 0);
  assert.ok(nodes[1].x > 60);
  assert.ok(distance(nodes[0], nodes[1]) >= 32 - 1e-4);
});

test('collision radii and padding keep the same screen separation at different camera scales', () => {
  for (const scale of [0.22, 0.5, 1, 2.4]) {
    const nodes = [body('a', 0, 0), body('b', 1, 0)];
    solveStatic(nodes, [], { scale, radiusFor: () => 25, padding: 9 });
    assert.ok(distance(nodes[0], nodes[1]) * scale >= 59 - 1e-4, `Scale ${scale}`);
  }
});

test('coincident starts separate deterministically, including a dense 49-body pile', () => {
  const fixture = () => Array.from({ length: 49 }, (_, index) => body(`node-${index}`, 0, 0));
  const first = fixture(); const second = fixture();
  const result = solveStatic(first, [], { iterations: 400 });
  solveStatic(second, [], { iterations: 400 });
  assert.deepEqual(first, second);
  assert.ok(result.maxOverlap < 0.01, `Unresolved overlap ${result.maxOverlap}`);
  for (const node of first) {
    assert.ok([node.x, node.y, node.vx, node.vy].every(Number.isFinite));
    assert.equal(node.vx, 0); assert.equal(node.vy, 0);
  }
});

test('a dynamic frame separates all circles in a dense pile within a subpixel tolerance', () => {
  const nodes = Array.from({ length: 49 }, (_, index) => body(`node-${index}`, 0, 0));
  const result = stepPhysics(nodes, [], { dt: 1 / 60 });
  assert.ok(result.maxOverlap < 0.01, `Unresolved overlap ${result.maxOverlap}`);
});

test('category cohesion is weak displacement sharing and never collapses the original category geometry', () => {
  const anchored = [body('a', 0, 0, { category: 'books' }), body('b', 500, 0, { category: 'books' })];
  advance(anchored, [], 120);
  assert.equal(distance(anchored[0], anchored[1]), 500);
  advance(anchored, [], 90, { draggedId: 'a', dragPoint: { x: 0, y: 160 } });
  assert.ok(anchored[1].y > 1 && anchored[1].y < 25);
});

test('after release, the graph damps back to its anchors without erasing the anchors', () => {
  const nodes = [body('a', 0, 0), body('b', 240, 0)];
  const links = [{ source: 'a', target: 'b' }];
  advance(nodes, links, 45, { draggedId: 'a', dragPoint: { x: 70, y: 130 } });
  const result = advance(nodes, links, 720);
  assert.ok(result.maxSpeed < 0.05, `Did not settle: ${result.maxSpeed}`);
  assert.ok(Math.hypot(nodes[0].x, nodes[0].y) < 0.01);
  assert.ok(Math.hypot(nodes[1].x - 240, nodes[1].y) < 0.01);
  assert.deepEqual(nodes.map((node) => [node.targetX, node.targetY]), [[0, 0], [240, 0]]);
});

test('changing target anchors supports reflow without moving or retaining a separate hidden rest layout', () => {
  const nodes = [body('a', 0, 0), body('b', 240, 0)];
  const links = [{ source: 'a', target: 'b' }];
  nodes[0].targetX = 100; nodes[0].targetY = 200;
  nodes[1].targetX = 550; nodes[1].targetY = 400;
  advance(nodes, links, 900);
  assert.ok(Math.hypot(nodes[0].x - 100, nodes[0].y - 200) < 0.01);
  assert.ok(Math.hypot(nodes[1].x - 550, nodes[1].y - 400) < 0.01);
});

test('idle offsets affect only anchor force and never alter canonical anchors or link rest vectors', () => {
  const lone = [body('a', 0, 0)];
  advance(lone, [], 600, { anchorOffsetFor: () => ({ x: 9, y: -7 }) });
  assert.ok(Math.hypot(lone[0].x - 9, lone[0].y + 7) < 0.01);
  assert.equal(lone[0].targetX, 0); assert.equal(lone[0].targetY, 0);
  const linked = [body('a', 0, 0), body('b', 500, 0)];
  advance(linked, [{ source: 'a', target: 'b' }], 120, {
    anchorStrength: 0, anchorOffsetFor: (node) => ({ x: node.id === 'a' ? 100 : 0, y: 0 }),
  });
  assert.deepEqual(linked.map((node) => [node.x, node.y]), [[0, 0], [500, 0]]);
});

test('inactive circles remain untouched and do not exert invisible forces or block visible circles', () => {
  const nodes = [body('visible', 0, 0), body('hidden', 0, 0, { vx: 300, vy: -10 })];
  const hidden = structuredClone(nodes[1]);
  advance(nodes, [{ source: 'visible', target: 'hidden' }], 30, { activeIds: new Set(['visible']) });
  assert.deepEqual(nodes[1], hidden);
  assert.equal(nodes[0].x, 0); assert.equal(nodes[0].y, 0);
});

test('fixed keyboard/hover nodes keep their position while a colliding mobile body moves away', () => {
  const nodes = [body('fixed', 0, 0), body('mobile', 4, 0)];
  solveStatic(nodes, [], { fixedIds: new Set(['fixed']), radiusFor: () => 20, scale: 0.5 });
  assert.equal(nodes[0].x, 0); assert.equal(nodes[0].y, 0);
  assert.ok(distance(nodes[0], nodes[1]) >= 96 - 1e-4);
});

test('zero elapsed time leaves valid unpinned bodies untouched, including overlapping circles', () => {
  const nodes = [body('a', 0, 0, { vx: 20 }), body('b', 0, 0)];
  const snapshot = structuredClone(nodes);
  stepPhysics(nodes, [], { dt: 0 });
  assert.deepEqual(nodes, snapshot);
});

test('a conflict between two fixed circles is reported instead of silently called settled', () => {
  const nodes = [body('a', 0, 0), body('b', 0, 0)];
  const result = solveStatic(nodes, [], { fixedIds: new Set(['a', 'b']) });
  assert.equal(nodes[0].x, 0); assert.equal(nodes[1].x, 0);
  assert.equal(result.maxOverlap, 32);
  assert.equal(result.settled, false);
});

test('static layout solving adds no idle motion and clears active velocities without pulling to anchors', () => {
  const nodes = [body('a', 100, 200, { targetX: 0, targetY: 0, vx: 20, vy: -30 })];
  solveStatic(nodes, [{ source: 'missing', target: 'a' }]);
  assert.equal(nodes[0].x, 100); assert.equal(nodes[0].y, 200);
  assert.equal(nodes[0].vx, 0); assert.equal(nodes[0].vy, 0);
  const snapshot = structuredClone(nodes);
  solveStatic(nodes);
  assert.deepEqual(nodes, snapshot);
});

test('large frame gaps and malformed numeric state stay finite and bounded', () => {
  const fixture = () => [body('a', 1e6, -1e6, { vx: 1e9, vy: -1e9 }), body('b', 200, 0)];
  const largeGap = fixture(); const clampedGap = fixture();
  stepPhysics(largeGap, [{ source: 'a', target: 'b' }], { dt: 500, maxSpeed: 480 });
  stepPhysics(clampedGap, [{ source: 'a', target: 'b' }], { dt: 0.05, maxSpeed: 480 });
  assert.deepEqual(largeGap, clampedGap);
  assert.ok(Math.hypot(largeGap[0].vx, largeGap[0].vy) <= 480 + 1e-8);
  const broken = [body('bad', Number.NaN, Number.POSITIVE_INFINITY,
    { vx: Number.NaN, vy: Number.NEGATIVE_INFINITY, targetX: 5, targetY: 10 })];
  stepPhysics(broken, [], { dt: Number.NaN, scale: Number.NaN });
  assert.deepEqual([broken[0].x, broken[0].y, broken[0].vx, broken[0].vy], [5, 10, 0, 0]);
});

test('different frame subdivisions produce close trajectories instead of frame-rate-dependent motion', () => {
  const fixture = () => [body('a', 0, 0), body('b', 250, 0)];
  const coarse = fixture(); const fine = fixture();
  const links = [{ source: 'a', target: 'b' }];
  const drag = { draggedId: 'a', dragPoint: { x: 0, y: 100 } };
  for (let frame = 0; frame < 60; frame++) stepPhysics(coarse, links, { ...drag, dt: 1 / 30 });
  for (let frame = 0; frame < 120; frame++) stepPhysics(fine, links, { ...drag, dt: 1 / 60 });
  assert.ok(distance(coarse[1], fine[1]) < 0.05);
});

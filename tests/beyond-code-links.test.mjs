import assert from 'node:assert/strict';
import test from 'node:test';
import { segmentBetweenCircles } from '../src/utils/beyond-code-links.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9,
  `Expected ${expected}, received ${actual}`);

test('connections stop outside both visible orbits with clearance at each end', () => {
  assert.deepEqual(segmentBetweenCircles({ x: 0, y: 20 }, { x: 100, y: 20 }, 10, 20), {
    from: { x: 14, y: 20 }, to: { x: 76, y: 20 },
  });
  assert.deepEqual(segmentBetweenCircles({ x: 20, y: 100 }, { x: 20, y: 0 }, 12, 8, 2), {
    from: { x: 20, y: 86 }, to: { x: 20, y: 10 },
  });
});

test('diagonal endpoints remain collinear and exactly the requested distance from centers', () => {
  const first = { x: 0, y: 0 };
  const second = { x: 60, y: 80 };
  const segment = segmentBetweenCircles(first, second, 6, 14);
  assert.ok(segment);
  near(segment.from.x, 6); near(segment.from.y, 8);
  near(segment.to.x, 49.2); near(segment.to.y, 65.6);
  near(Math.hypot(segment.from.x - first.x, segment.from.y - first.y), 10);
  near(Math.hypot(segment.to.x - second.x, segment.to.y - second.y), 18);
});

test('reversing a connection reverses its endpoints and preserves unequal radii', () => {
  const first = { x: -80, y: 35 };
  const second = { x: 120, y: -65 };
  const forward = segmentBetweenCircles(first, second, 13, 29, 3);
  const reverse = segmentBetweenCircles(second, first, 29, 13, 3);
  assert.ok(forward && reverse);
  near(forward.from.x, reverse.to.x); near(forward.from.y, reverse.to.y);
  near(forward.to.x, reverse.from.x); near(forward.to.y, reverse.from.y);
});

test('translation preserves a segment without changing or mutating its input centers', () => {
  const first = Object.freeze({ x: -40, y: 15 });
  const second = Object.freeze({ x: 120, y: 95 });
  const offset = { x: 235, y: -142 };
  const original = segmentBetweenCircles(first, second, 17, 24, 0);
  const shifted = segmentBetweenCircles({ x: first.x + offset.x, y: first.y + offset.y },
    { x: second.x + offset.x, y: second.y + offset.y }, 17, 24, 0);
  assert.ok(original && shifted);
  for (const endpoint of ['from', 'to']) {
    near(shifted[endpoint].x, original[endpoint].x + offset.x);
    near(shifted[endpoint].y, original[endpoint].y + offset.y);
  }
  assert.deepEqual(first, { x: -40, y: 15 });
  assert.deepEqual(second, { x: 120, y: 95 });
});

test('dense, coincident, touching and clearance-overlapping circles produce no reversed spike', () => {
  for (const separation of [0, 5, 20, 27, 28]) {
    assert.equal(segmentBetweenCircles({ x: 0, y: 0 }, { x: separation, y: 0 }, 10, 10), null);
  }
  const visible = segmentBetweenCircles({ x: 0, y: 0 }, { x: 28.1, y: 0 }, 10, 10);
  assert.ok(visible && visible.to.x > visible.from.x);
  assert.deepEqual(segmentBetweenCircles({ x: 0, y: 0 }, { x: 10, y: 0 }, 0, 0, 0), {
    from: { x: 0, y: 0 }, to: { x: 10, y: 0 },
  });
});

test('invalid or nonfinite screen geometry is suppressed without leaking NaN endpoints', () => {
  const first = { x: 0, y: 0 };
  const second = { x: 100, y: 100 };
  for (const invalid of [NaN, Infinity, -Infinity, undefined, '12']) {
    assert.equal(segmentBetweenCircles({ x: invalid, y: 0 }, second, 10, 20), null);
    assert.equal(segmentBetweenCircles(first, { x: 100, y: invalid }, 10, 20), null);
    assert.equal(segmentBetweenCircles(first, second, invalid, 20), null);
    assert.equal(segmentBetweenCircles(first, second, 10, invalid), null);
    if (invalid !== undefined) assert.equal(segmentBetweenCircles(first, second, 10, 20, invalid), null);
  }
  assert.equal(segmentBetweenCircles(null, second, 10, 20), null);
  assert.equal(segmentBetweenCircles(first, null, 10, 20), null);
  assert.equal(segmentBetweenCircles(first, second, -1, 20), null);
  assert.equal(segmentBetweenCircles(first, second, 10, -1), null);
  assert.equal(segmentBetweenCircles(first, second, 10, 20, -1), null);
  assert.equal(segmentBetweenCircles({ x: -1e308, y: 0 }, { x: 1e308, y: 0 }, 10, 20), null);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { baseNodeDiameter, screenNodeDiameter } from '../src/utils/beyond-code-sizing.js';

test('confirmed connections increase size with diminishing returns and a finite cap', () => {
  const degrees = [0, 1, 2, 3, 4, 5, 8, 16, 100, Number.MAX_VALUE];
  const sizes = degrees.map((degree) => baseNodeDiameter(degree));
  assert.ok(sizes.every((size, index) => size >= 34 && size <= 76
    && (index === 0 || size >= sizes[index - 1])));
  assert.ok(baseNodeDiameter(8) > baseNodeDiameter(3), 'eight-film series exceeds a trilogy');
  assert.ok(baseNodeDiameter(2) - baseNodeDiameter(1) < baseNodeDiameter(1) - baseNodeDiameter(0));
  assert.equal(baseNodeDiameter(100), baseNodeDiameter(Number.MAX_VALUE));
});

test('optional owner preference is neutral by default and always a modest bounded addition', () => {
  for (const degree of [0, 1, 3, 8, 100]) {
    const neutral = baseNodeDiameter(degree);
    assert.equal(neutral, baseNodeDiameter(degree, 0));
    for (const boost of [1, 2, 3, 4, 1e10]) {
      const difference = baseNodeDiameter(degree, boost) - neutral;
      assert.ok(difference > 0 && difference <= 6);
    }
    assert.equal(baseNodeDiameter(degree, -1), neutral);
  }
});

test('zoom and temporary selection remain bounded without reversing degree hierarchy', () => {
  for (const scale of [.0001, .2, 1, 2, 1e300]) {
    for (const selected of [false, true]) {
      const sizes = [0, 1, 3, 5, 8, 100].map((degree) => screenNodeDiameter(baseNodeDiameter(degree), scale, selected));
      assert.ok(sizes.every((size, index) => size >= 24 && size <= 82
        && (index === 0 || size >= sizes[index - 1])));
    }
  }
  const neutral = baseNodeDiameter(3);
  assert.ok(screenNodeDiameter(neutral, 1, true) > screenNodeDiameter(neutral, 1));
  assert.equal(neutral, baseNodeDiameter(3), 'selection must not persist preference');
});

test('malformed sizing inputs never produce invalid CSS or collision radii', () => {
  for (const invalid of [NaN, Infinity, -Infinity, -1]) {
    const base = baseNodeDiameter(invalid, invalid);
    assert.equal(base, baseNodeDiameter(0));
    assert.ok(Number.isFinite(screenNodeDiameter(base, invalid, true)));
    assert.equal(screenNodeDiameter(invalid, 1), screenNodeDiameter(34, 1));
  }
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseDiscoveryId, discoveryCandidateIds } from '../src/utils/beyond-code-discovery.js';

test('discovery uses only the supplied filter matches and excludes context and selection', () => {
  const matches = [
    { id: 'song-a', isContext: false },
    { id: 'performer', isContext: true },
    { id: 'song-b', isContext: false },
    { id: 'song-c', isContext: false },
  ];
  const original = structuredClone(matches);
  assert.deepEqual(discoveryCandidateIds(matches, 'song-b'), ['song-a', 'song-c']);
  assert.deepEqual(discoveryCandidateIds(matches, 'outside-filter'), ['song-a', 'song-b', 'song-c']);
  assert.deepEqual(matches, original);
});

test('empty and single-item discovery have no ineligible fallback', () => {
  const neverSample = () => { throw new Error('An empty collection must not sample'); };
  assert.equal(chooseDiscoveryId([], neverSample), null);
  assert.deepEqual(discoveryCandidateIds([{ id: 'only', isContext: false }], 'only'), []);
  assert.deepEqual(discoveryCandidateIds([{ id: 'context', isContext: true }]), []);
  assert.equal(chooseDiscoveryId(['only'], () => 0), 'only');
  assert.equal(chooseDiscoveryId(['only'], () => 0.999999), 'only');
});

test('every eligible node receives equal probability intervals independent of input rank', () => {
  for (const ids of [['a', 'b', 'c', 'd', 'e'], ['e', 'a', 'd', 'b', 'c']]) {
    const counts = new Map(ids.map((id) => [id, 0]));
    for (let sample = 0; sample < 1000; sample++) {
      const id = chooseDiscoveryId(ids, () => (sample + 0.5) / 1000);
      counts.set(id, counts.get(id) + 1);
    }
    assert.deepEqual([...counts.values()], [200, 200, 200, 200, 200]);
    assert.equal(chooseDiscoveryId(ids, () => 0), ids[0]);
    assert.equal(chooseDiscoveryId(ids, () => 1 - Number.EPSILON), ids.at(-1));
  }
});

test('invalid random samples fail explicitly rather than biasing discovery', () => {
  for (const sample of [-1, 1, NaN, Infinity]) {
    assert.throws(() => chooseDiscoveryId(['a', 'b'], () => sample), RangeError);
  }
});

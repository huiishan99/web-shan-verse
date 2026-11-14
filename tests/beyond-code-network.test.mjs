import assert from 'node:assert/strict';
import test from 'node:test';
import { createPhysicsNetwork } from '../src/utils/beyond-code-network.js';

const nodes = (...ids) => ids.map((id) => ({ id }));
const edge = (source, target) => ({ source, target });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12,
  `Expected mass ${expected}, received ${actual}`);

test('each active connection contributes reciprocal degree while isolated nodes keep unit mass', () => {
  const network = createPhysicsNetwork(nodes('song', 'artist', 'book', 'isolated'), [
    edge('song', 'artist'), edge('artist', 'book'),
  ]);
  assert.deepEqual(network.links, [edge('song', 'artist'), edge('artist', 'book')]);
  assert.equal(network.masses.get('song'), 1.18);
  near(network.masses.get('artist'), 1.36);
  assert.equal(network.masses.get('book'), 1.18);
  assert.equal(network.masses.get('isolated'), 1);
});

test('inactive endpoints neither exert a spring nor make visible bubbles heavier', () => {
  const links = [edge('visible', 'hidden'), edge('hidden', 'also-hidden')];
  const network = createPhysicsNetwork(nodes('visible', 'hidden', 'also-hidden'), links,
    new Set(['visible', 'unknown']));
  assert.deepEqual(network.links, []);
  assert.deepEqual([...network.masses], [['visible', 1]]);
  const empty = createPhysicsNetwork(nodes('visible', 'hidden'), links, new Set());
  assert.equal(empty.links.length, 0);
  assert.equal(empty.masses.size, 0);
});

test('duplicate and reverse links count as one pair, preserving first valid orientation', () => {
  const network = createPhysicsNetwork(nodes('a', 'b', 'c'), [
    edge('b', 'a'), edge('a', 'b'), edge('b', 'a'), edge('b', 'c'), edge('c', 'b'),
  ]);
  assert.deepEqual(network.links, [edge('b', 'a'), edge('b', 'c')]);
  assert.deepEqual([...network.masses.keys()], ['a', 'b', 'c']);
  near(network.masses.get('a'), 1.18);
  near(network.masses.get('b'), 1.36);
  near(network.masses.get('c'), 1.18);
});

test('missing endpoints, self-links and duplicate node IDs cannot inflate the network', () => {
  const network = createPhysicsNetwork(nodes('a', 'a', 'b', 'b', ''), [
    edge('a', 'a'), edge('a', 'ghost'), edge('ghost', 'b'), edge('', 'a'), edge('a', 'b'),
  ]);
  assert.deepEqual(network.links, [edge('a', 'b')]);
  assert.deepEqual([...network.masses], [['a', 1.18], ['b', 1.18]]);
});

test('category hubs gain bounded degree-based mass from their active members', () => {
  const members = Array.from({ length: 100 }, (_, index) => `member-${index}`);
  const graphNodes = nodes('hub', ...members);
  const links = members.map((member) => edge('hub', member));
  const full = createPhysicsNetwork(graphNodes, links);
  assert.equal(full.masses.get('hub'), 16);
  assert.ok(members.every((member) => full.masses.get(member) === 1.18));

  const filtered = createPhysicsNetwork(graphNodes, links, new Set(['hub', ...members.slice(0, 3)]));
  assert.equal(filtered.links.length, 3);
  assert.equal(filtered.masses.get('hub'), 1.54);
});

test('network construction is deterministic and does not mutate frozen source data or visibility', () => {
  const graphNodes = Object.freeze(nodes('a', 'b', 'isolated').map(Object.freeze));
  const graphLinks = Object.freeze([
    Object.freeze({ source: 'a', target: 'b', label: 'Source metadata stays separate' }),
    Object.freeze(edge('b', 'a')),
  ]);
  const activeIds = new Set(['a', 'b', 'isolated']);
  const originalNodes = structuredClone(graphNodes);
  const originalLinks = structuredClone(graphLinks);
  const first = createPhysicsNetwork(graphNodes, graphLinks, activeIds);
  const second = createPhysicsNetwork(graphNodes, graphLinks, activeIds);
  assert.deepEqual(first, second);
  assert.deepEqual(graphNodes, originalNodes);
  assert.deepEqual(graphLinks, originalLinks);
  assert.deepEqual([...activeIds], ['a', 'b', 'isolated']);
  assert.notEqual(first.links[0], graphLinks[0]);
  first.links[0].source = 'changed';
  first.masses.set('a', 15);
  assert.deepEqual(createPhysicsNetwork(graphNodes, graphLinks, activeIds), second);
});

test('pair deduplication preserves distinct IDs containing separators', () => {
  const network = createPhysicsNetwork(nodes('a', 'b\u0000c', 'a\u0000b', 'c'), [
    edge('a', 'b\u0000c'), edge('a\u0000b', 'c'),
  ]);
  assert.equal(network.links.length, 2);
  assert.ok([...network.masses.values()].every((mass) => mass === 1.18));
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';
import { nodes, edges } from '../src/data/beyond-code.ts';
import {
  artworkPath, manifestFile, sha256, thumbnailBudget, thumbnailSettings, usedArtwork,
} from '../scripts/generate-beyond-code-thumbnails.mjs';

const media = JSON.parse(await readFile(new URL('../src/data/beyond-code-media.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));

test('each used original artwork has exactly one generated thumbnail, with unchanged collection sources', async () => {
  assert.deepEqual(Object.keys(manifest.images).sort(), usedArtwork(media));
  for (const [key, value] of Object.entries(thumbnailSettings)) assert.equal(manifest[key], value);
  assert.equal(manifest.sharpVersion, sharp.versions.sharp);
  let bytes = 0;
  for (const [artwork, image] of Object.entries(manifest.images)) {
    const original = await readFile(artworkPath(artwork));
    const thumbnail = await readFile(artworkPath(image.thumbnail, true));
    assert.equal(sha256(original), image.sourceSha256, `Stale thumbnail for ${artwork}; run npm run generate:beyond-thumbnails`);
    assert.equal(sha256(thumbnail), image.sha256, `Corrupt thumbnail: ${image.thumbnail}`);
    assert.ok(image.thumbnail.endsWith(`.${image.sha256.slice(0, 12)}.webp`));
    assert.equal(thumbnail.byteLength, image.bytes);
    const metadata = await sharp(thumbnail).metadata();
    assert.equal(metadata.format, 'webp');
    assert.equal(metadata.width, image.width); assert.equal(metadata.height, image.height);
    // A complete decode catches damaged pixel data, beyond valid file headers.
    const decoded = await sharp(thumbnail).raw().toBuffer({ resolveWithObject: true });
    assert.ok(decoded.data.byteLength > 0);
    assert.ok(Math.max(image.width, image.height) <= 500);
    bytes += image.bytes;
  }
  assert.ok(bytes <= thumbnailBudget, `Thumbnails use ${bytes} bytes; budget is ${thumbnailBudget}`);
});

test('directly connected entries use distinct artwork content in the graph and introductions', async () => {
  const artworkById = new Map(nodes.map((node) => [node.id, media[node.id]?.artwork || node.artwork || '']));
  const fingerprints = new Map();
  const fingerprint = async (artwork) => {
    if (!fingerprints.has(artwork)) {
      const image = manifest.images[artwork];
      assert.ok(image, `Missing generated artwork for ${artwork}`);
      const [original, thumbnail] = await Promise.all([
        readFile(artworkPath(artwork)), readFile(artworkPath(image.thumbnail, true)),
      ]);
      fingerprints.set(artwork, { original: sha256(original), thumbnail: sha256(thumbnail) });
    }
    return fingerprints.get(artwork);
  };
  const duplicates = [];
  for (const edge of edges) {
    const source = artworkById.get(edge.source);
    const target = artworkById.get(edge.target);
    assert.ok(source && target, `A connected entry lacks artwork: ${edge.source} / ${edge.target}`);
    const [first, second] = await Promise.all([fingerprint(source), fingerprint(target)]);
    // Compare actual bytes as well as paths: copying an image under a new name
    // must not make two connected bubbles look like distinct collection entries.
    if (source === target || first.original === second.original || first.thumbnail === second.thumbnail) {
      duplicates.push({ source: edge.source, target: edge.target });
    }
  }
  assert.deepEqual(duplicates, [], 'Connected entries must not reuse identical original or thumbnail artwork');
});

test('thumbnail paths cannot escape or overwrite the original collection', () => {
  for (const url of [
    '/images/beyond-code/../secret.jpg', '/images/beyond-code/%2e%2e/secret.jpg',
    '/images/beyond-code/../../secret.jpg', '/images/other.jpg',
    'https://example.com/cover.jpg', 'C:\\secret.jpg', '/images/beyond-code/cover.jpg?query=1',
  ]) assert.throws(() => artworkPath(url));
  assert.throws(() => artworkPath('/images/beyond-code/original.jpg', true));
  assert.throws(() => artworkPath('/images/beyond-code/thumbnails/../original.jpg', true));
});

test('derived covers retain the original framing for books and contain artwork', async () => {
  // Resizing, never pre-cropping: the browser still applies its existing
  // object-position:50% 25% book rule and object-fit:contain Ghibli rule.
  for (const [artwork, image] of Object.entries(manifest.images)) {
    const original = await sharp(artworkPath(artwork)).rotate().toBuffer({ resolveWithObject: true });
    const aspectError = Math.abs(image.width / image.height - original.info.width / original.info.height);
    assert.ok(aspectError <= 1 / image.height + 1e-9, `Artwork was cropped: ${artwork}`);
    assert.ok(image.width <= original.info.width && image.height <= original.info.height,
      `Artwork was unnecessarily enlarged: ${artwork}`);
  }
});

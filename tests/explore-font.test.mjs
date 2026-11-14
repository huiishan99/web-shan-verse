import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the new exploration labels use a bounded authentic font subset', async () => {
  const manifest = JSON.parse(await readFile(new URL('../src/data/explore-font.json', import.meta.url), 'utf8'));
  const readAsset = (href) => readFile(new URL(`../public${href}`, import.meta.url));
  const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const [source, font, license] = await Promise.all([
    readAsset(manifest.source.href), readAsset(manifest.font.href), readAsset(manifest.source.licenseHref),
  ]);
  assert.equal(digest(source), manifest.source.sha256);
  assert.equal(digest(font), manifest.font.sha256);
  assert.equal(font.length, manifest.font.bytes);
  assert.ok(font.length < 8 * 1024, 'Shared navigation must not load a large CJK font');
  assert.equal(font.toString('ascii', 0, 4), 'wOF2');
  assert.ok(manifest.font.href.includes(digest(font).slice(0, 16)));
  assert.match(license.toString(), /SIL OPEN FONT LICENSE/);
  const expected = [...new Set('探索代码之外旅行星图时间线随便看看')].sort();
  assert.deepEqual([...manifest.coverage.characters], expected);
  assert.equal(manifest.coverage.unicodeRange,
    expected.map((character) => `U+${character.codePointAt(0).toString(16).toUpperCase()}`).join(', '));
  const component = await readFile(new URL('../src/components/navigation/ExploreNavigation.astro', import.meta.url), 'utf8');
  assert.ok(component.includes(`font-family: '${manifest.family}'`));
  assert.ok(component.includes(`src: url('${manifest.font.href}')`));
  assert.ok(component.includes(`unicode-range: ${manifest.coverage.unicodeRange};`));
  assert.doesNotMatch(component, /<style is:inline/,
    'The shared face must remain in the compiled stylesheet through SPA swaps');
});

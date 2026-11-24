import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const publicDirectory = path.join(projectDirectory, 'public');
const manifest = JSON.parse(await readFile(new URL('../src/data/google-fonts.json', import.meta.url), 'utf8'));
const upstreamCSS = await readFile(new URL('../src/data/google-fonts-upstream.css', import.meta.url));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const normalize = (value) => value.replace(/\s+/g, ' ').trim();

// Parse the simple provider @font-face format independently of the delivery
// generator. Face order and every descriptor except the URL must survive.
function fontFaces(css) {
  return [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(([, body]) =>
    Object.fromEntries(body.split(';').map((declaration) => {
      const separator = declaration.indexOf(':');
      return separator < 0 ? null : [declaration.slice(0, separator).trim(), normalize(declaration.slice(separator + 1))];
    }).filter(Boolean)));
}

function sourceURL(face) {
  const match = face.src.match(/url\((?:"([^"]+)"|'([^']+)'|([^\s)]+))\)/);
  assert.ok(match, `Missing font source in ${face.src}`);
  return match[1] ?? match[2] ?? match[3];
}

async function localFile(href) {
  assert.match(href, /^\/fonts\/google\/[a-z0-9._/-]+$/i);
  assert.ok(!href.split('/').includes('..'));
  const file = path.resolve(publicDirectory, `.${href}`);
  const relative = path.relative(path.join(await realpath(publicDirectory), 'fonts', 'google'), await realpath(file));
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), `Font asset escapes its directory: ${href}`);
  return readFile(file);
}

test('local font CSS retains every upstream face, weight, style and Unicode range in order', async () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.source.snapshot, 'src/data/google-fonts-upstream.css');
  assert.equal(hash(upstreamCSS), 'd85e59cc7ebed0a9b22a4f65761558b65230611070e24906a75956c4c7779d12');
  assert.equal(hash(upstreamCSS), manifest.source.sha256);
  assert.equal(upstreamCSS.byteLength, manifest.source.bytes);
  assert.equal(new URL(manifest.source.url).hostname, 'fonts.googleapis.com');
  assert.ok(manifest.source.userAgent);
  const css = await localFile(manifest.css.href);
  assert.equal(hash(css), manifest.css.sha256);
  assert.equal(css.byteLength, manifest.css.bytes);
  assert.ok(manifest.css.href.includes(`.${manifest.css.sha256.slice(0, 16)}.css`));
  assert.ok(!/https?:\/\/fonts\.(?:googleapis|gstatic)\.com/.test(css.toString()));
  const original = fontFaces(upstreamCSS.toString());
  const delivered = fontFaces(css.toString());
  assert.equal(original.length, 940);
  assert.equal(delivered.length, original.length);
  assert.equal(manifest.faces.length, original.length);
  const bySource = new Map(manifest.files.flatMap((file) => file.sourceUrls.map((url) => [url, file])));
  for (let index = 0; index < original.length; index++) {
    const before = original[index], after = delivered[index];
    const { src: originalSource, ...originalDescriptors } = before;
    const { src: localSource, ...localDescriptors } = after;
    assert.deepEqual(localDescriptors, originalDescriptors, `Face ${index} changed typography or glyph selection`);
    const asset = bySource.get(sourceURL(before));
    assert.ok(asset, `Missing asset for ${originalSource}`);
    assert.equal(sourceURL(after), asset.href);
    assert.equal(localSource.replace(asset.href, sourceURL(before)), originalSource);
    assert.deepEqual(manifest.faces[index].descriptors, before);
    assert.equal(manifest.faces[index].sourceUrl, sourceURL(before));
    assert.equal(manifest.faces[index].href, asset.href);
  }
  assert.deepEqual(new Set(bySource.keys()), new Set(original.map(sourceURL)));
  const familyStyles = new Map();
  for (const face of delivered) {
    const family = face['font-family'].replace(/^['"]|['"]$/g, '');
    if (!familyStyles.has(family)) familyStyles.set(family, new Set());
    familyStyles.get(family).add(`${face['font-style']}:${face['font-weight']}`);
  }
  assert.deepEqual(Object.fromEntries([...familyStyles].map(([name, values]) => [name, [...values].sort()])), {
    Cinzel: ['normal:400', 'normal:600', 'normal:700'],
    'Cormorant Garamond': ['normal:500', 'normal:600', 'normal:700'],
    'Crimson Pro': ['italic:400', 'normal:300', 'normal:400', 'normal:500', 'normal:600'],
    'JetBrains Mono': ['normal:400', 'normal:500'],
    'Noto Serif SC': ['normal:400', 'normal:500', 'normal:600', 'normal:700'],
    'Shippori Mincho': ['normal:400', 'normal:500', 'normal:600', 'normal:700'],
  });
});

test('all 608 local font assets have intact content hashes and valid WOFF2 headers', async () => {
  assert.equal(manifest.files.length, 608);
  assert.equal(new Set(manifest.files.map((file) => file.href)).size, 608);
  assert.equal(new Set(manifest.files.map((file) => file.sha256)).size, 608);
  const fontDirectory = path.join(publicDirectory, 'fonts', 'google');
  assert.deepEqual((await readdir(fontDirectory)).filter((name) => name.endsWith('.woff2')).sort(),
    manifest.files.map((file) => path.basename(file.href)).sort());
  let bytes = 0;
  for (const file of manifest.files) {
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
    assert.ok(file.href.includes(`.${file.sha256.slice(0, 16)}.woff2`));
    const contents = await localFile(file.href);
    assert.equal(contents.byteLength, file.bytes);
    assert.equal(hash(contents), file.sha256);
    assert.equal(contents.toString('ascii', 0, 4), 'wOF2', file.href);
    assert.equal(contents.readUInt32BE(8), contents.byteLength, `Truncated font: ${file.href}`);
    assert.equal(contents.readUInt16BE(14), 0);
    assert.ok(contents.readUInt16BE(12) > 0 && contents.readUInt16BE(12) <= 256);
    assert.ok(contents.readUInt32BE(16) > 0);
    assert.ok(contents.readUInt32BE(20) > 0 && contents.readUInt32BE(20) <= contents.byteLength - 48);
    bytes += contents.byteLength;
  }
  // The full Unicode catalog is shipped, not eagerly downloaded by a page.
  // The provider snapshot fixes coverage; this ceiling catches accidental bloat.
  assert.ok(bytes <= 24 * 1024 * 1024, `Local font catalog exceeds 24 MiB: ${bytes}`);
  assert.equal(manifest.families.length, 6);
  for (const family of manifest.families) {
    const license = await localFile(family.license.href);
    assert.equal(license.byteLength, family.license.bytes);
    assert.equal(hash(license), family.license.sha256);
    assert.match(license.toString(), /SIL OPEN FONT LICENSE/i);
    assert.match(family.license.sourceUrl, /^https:\/\//);
  }
});

test('the five existing Zhuque subsets stay byte-for-byte unchanged', async () => {
  const expected = {
    'ZhuqueFangsong-About.woff2': 'fe0732100d0cf3e7c1a48bf290aebd456cf18a4f65d9c245d26425d9f85ec54c',
    'ZhuqueFangsong-Blog.woff2': '6dfcf5a39c04348017c9d711fd4e21e720ae4242fca19bd2cfb75db9acd37fea',
    'ZhuqueFangsong-HomeHero.woff2': '321b1eecb9960b29c73268e88ddc9ce1d8241ebefa7d31b0d6c14d30e7c8c006',
    'ZhuqueFangsong-Navigation.woff2': '508e41b14df1d9eeafc0f0e31bffca46ac8dc5c24edb7489c2de58026555482c',
    'ZhuqueFangsong-PageSubtitle.woff2': 'a01442b1658e71cf9252b29e7dfd6f1796a542b613bf69ea3c93dc282d6f048b',
  };
  for (const [file, expectedHash] of Object.entries(expected)) {
    assert.match(expectedHash, /^[a-f0-9]{64}$/);
    assert.equal(hash(await readFile(path.join(publicDirectory, 'fonts', file))), expectedHash);
  }
});

test('the complete Zhuque catalog declares every pinned source code point exactly once', async () => {
  const catalog = JSON.parse(await readFile(new URL('../src/data/zhuque-font.json', import.meta.url), 'utf8'));
  const catalogDirectory = path.join(publicDirectory, 'fonts', 'zhuque');
  const pinnedCoverage = 'a1f4f2476066e3ae9af13636035a51c638fb0b9d30b6d2c99fbfdab5b4f6b8a4';
  assert.equal(catalog.source.codepoints, 12_882);
  assert.equal(catalog.source.codepointsSha256, pinnedCoverage);
  assert.equal(catalog.source.variationSequences.length, 9);

  async function readPinned(asset, extension) {
    const name = path.basename(asset.href);
    assert.equal(asset.href, `/fonts/zhuque/${name}`);
    const bytes = await readFile(path.join(catalogDirectory, name));
    assert.equal(hash(bytes), asset.sha256, asset.href);
    assert.equal(bytes.byteLength, asset.bytes);
    assert.ok(name.endsWith(`.${asset.sha256.slice(0, 16)}.${extension}`));
    return bytes;
  }

  const faces = fontFaces((await readPinned(catalog.css, 'css')).toString());
  assert.equal(faces.length, catalog.files.length);
  assert.deepEqual((await readdir(catalogDirectory)).sort(),
    [catalog.css, ...catalog.files].map(({ href }) => path.basename(href)).sort());

  const selectors = new Set(catalog.source.variationSequences.map(([, selector]) => selector));
  const covered = new Set();
  const rangeByPoint = new Map();
  for (const [index, asset] of catalog.files.entries()) {
    const face = faces[index];
    const font = await readPinned(asset, 'woff2');
    assert.equal(font.toString('ascii', 0, 4), 'wOF2');
    assert.equal(font.readUInt32BE(8), font.length);
    assert.equal(sourceURL(face), asset.href);
    assert.equal(face['font-family'], `'${catalog.family}'`);
    assert.equal(face['font-weight'], '400');
    assert.equal(face['font-style'], 'normal');
    assert.equal(face['font-display'], 'swap');
    assert.equal(face['unicode-range'], asset.unicodeRange);

    let codepoints = 0;
    for (const range of face['unicode-range'].split(', ')) {
      assert.match(range, /^U\+[A-F0-9]{1,6}(?:-[A-F0-9]{1,6})?$/);
      const [start, end = start] = range.slice(2).split('-').map((hex) => Number.parseInt(hex, 16));
      assert.ok(start <= end && end <= 0x10ffff);
      for (let point = start; point <= end; point++) {
        assert.equal(rangeByPoint.has(point), false, `Duplicate code point U+${point.toString(16)}`);
        rangeByPoint.set(point, asset.href);
        if (!selectors.has(point)) {
          codepoints++;
          covered.add(point);
        }
      }
    }
    assert.equal(codepoints, asset.codepoints);
  }
  assert.equal(covered.size, catalog.source.codepoints);
  const encoded = [...covered].sort((a, b) => a - b).map((point) => point.toString(16).toUpperCase()).join(',');
  assert.equal(hash(encoded), pinnedCoverage);
  for (const [base, selector] of catalog.source.variationSequences) {
    assert.ok(rangeByPoint.has(base));
    assert.equal(rangeByPoint.get(base), rangeByPoint.get(selector));
  }
});

test('the Chinese About glyph supplement is bounded and matches its declared coverage', async () => {
  const supplement = JSON.parse(await readFile(new URL('../src/data/about-font-supplement.json', import.meta.url), 'utf8'));
  const aboutPage = await readFile(new URL('../src/components/pages/AboutPage.astro', import.meta.url), 'utf8');
  assert.match(supplement.font.href, /^\/fonts\/ZhuqueFangsong-About-Supplement\.[a-f0-9]{16}\.woff2$/);
  const bytes = await readFile(path.join(publicDirectory, supplement.font.href.slice(1)));
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'wOF2');
  assert.equal(hash(bytes), supplement.font.sha256);
  assert.ok(supplement.font.href.includes(hash(bytes).slice(0, 16)));
  assert.equal(bytes.byteLength, supplement.font.bytes);
  assert.ok(bytes.byteLength < 12 * 1024, 'A complementary subset should not become a full font download');
  assert.deepEqual([...supplement.coverage.characters].map(character => `U+${character.codePointAt(0).toString(16).toUpperCase()}`), supplement.coverage.unicodes);
  const face = fontFaces(aboutPage).find(entry => entry['font-family'] === `'${supplement.family}'`);
  assert.ok(face);
  assert.equal(sourceURL(face), supplement.font.href);
  assert.equal(face['unicode-range'], supplement.coverage.unicodeRange);
  assert.equal(face['font-style'], supplement.style);
  assert.equal(face['font-weight'], String(supplement.weight));
  assert.equal(face['font-display'], 'swap');
});

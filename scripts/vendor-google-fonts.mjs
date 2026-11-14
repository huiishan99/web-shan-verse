import { createHash } from 'node:crypto';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { createConfinedFontFiles } from './lib/confined-font-files.mjs';

// Explicit maintenance command; never imported by the build. --initialize captures
// this reviewed snapshot once. Normal runs only restore missing, hash-pinned files.
const root = fileURLToPath(new URL('../', import.meta.url));
const { readMaybe, writeLocked } = createConfinedFontFiles(root);
const output = resolve(root, 'public/fonts/google');
const manifestPath = resolve(root, 'src/data/google-fonts.json');
const snapshotPath = resolve(root, 'src/data/google-fonts-upstream.css');
const sourceUrl = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+SC:wght@400;500;600;700&family=Shippori+Mincho:wght@400;500;600;700&display=swap';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36';
const snapshotSha256 = 'd85e59cc7ebed0a9b22a4f65761558b65230611070e24906a75956c4c7779d12';
const families = [
  ['Cinzel', 'cinzel'], ['Cormorant Garamond', 'cormorantgaramond'],
  ['Crimson Pro', 'crimsonpro'], ['JetBrains Mono', 'jetbrainsmono'],
  ['Noto Serif SC', 'notoserifsc'], ['Shippori Mincho', 'shipporimincho'],
];
const licenseUrls = families.map(([, slug]) => `https://raw.githubusercontent.com/google/fonts/main/ofl/${slug}/OFL.txt`);
const hash = (data) => createHash('sha256').update(data).digest('hex');
const info = (data) => ({ sha256: hash(data), bytes: data.length });
const transientStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);
const transientCodes = new Set(['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET']);

function assetPath(href) {
  if (!/^\/fonts\/google\/(?:[a-z0-9-]+\.[a-f0-9]{16}\.(?:woff2|css)|licenses\/[a-z]+-OFL\.txt)$/.test(href)) {
    throw new Error(`Unsafe generated font path: ${href}`);
  }
  const path = resolve(root, 'public', href.slice(1));
  if (!path.startsWith(`${output}${sep}`)) throw new Error('Font path leaves its output directory');
  return path;
}

function assertHash(data, expected, label) {
  if (hash(data) !== expected.sha256 || data.length !== expected.bytes) {
    throw new Error(`Pinned font data changed: ${label}`);
  }
}

async function download(url) {
  const parsed = new URL(url);
  const font = parsed.origin === 'https://fonts.gstatic.com'
    && /^\/s\/[a-z0-9]+\/v\d+\/[A-Za-z0-9_-]+(?:\.\d+)?\.woff2$/.test(parsed.pathname)
    && !parsed.search && !parsed.hash;
  if (!font && url !== sourceUrl && !licenseUrls.includes(url)) throw new Error(`Unapproved font source: ${url}`);
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': userAgent }, redirect: 'error', signal: AbortSignal.timeout(30_000) });
      if (!response.ok) {
        const error = new Error(`Font source returned HTTP ${response.status}: ${url}`);
        error.transient = transientStatuses.has(response.status);
        await response.body?.cancel();
        throw error;
      }
      const data = Buffer.from(await response.arrayBuffer());
      if (!data.length || data.length > 10_000_000) throw new Error(`Unexpected font source size: ${url}`);
      if (font && data.subarray(0, 4).toString('ascii') !== 'wOF2') throw new Error(`Expected WOFF2: ${url}`);
      return data;
    } catch (error) {
      const transient = error.transient || error.name === 'TimeoutError' || transientCodes.has(error.cause?.code);
      if (!transient || attempt >= 2) throw error;
      await delay(500 * 2 ** attempt);
    }
  }
}

async function pooled(items, action) {
  let next = 0;
  let failure;
  const result = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(6, items.length) }, async () => {
    while (!failure && next < items.length) {
      const index = next++;
      try { result[index] = await action(items[index], index); }
      catch (error) { failure = error; }
    }
  }));
  if (failure) throw failure;
  return result;
}

function parseFaces(css) {
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map((match) => {
    const descriptors = Object.fromEntries([...match[1].matchAll(/([\w-]+)\s*:\s*([^;]+);/g)].map((item) => [item[1], item[2].trim()]));
    const source = /^url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\) format\('woff2'\)$/.exec(descriptors.src)?.[1];
    if (!source || descriptors['font-display'] !== 'swap' || !descriptors['unicode-range']) throw new Error('Unexpected upstream font declaration');
    return { descriptors, sourceUrl: source };
  });
  const names = [...new Set(faces.map(({ descriptors }) => descriptors['font-family'].replaceAll("'", '')))];
  if (faces.length !== 940 || JSON.stringify(names) !== JSON.stringify(families.map(([name]) => name))) {
    throw new Error('Reviewed font family or face inventory changed');
  }
  return faces;
}

async function main() {
  const mode = process.argv[2];
  if (process.argv.length > 3 || (mode && !['--initialize', '--check'].includes(mode))) throw new Error('Usage: node scripts/vendor-google-fonts.mjs [--initialize|--check]');
  const initialize = mode === '--initialize';
  const check = mode === '--check';
  const previousBytes = await readMaybe(manifestPath);
  const previous = previousBytes && JSON.parse(previousBytes);
  if (!previous && !initialize) throw new Error('Pinned font manifest missing; an explicit reviewed --initialize is required');
  if (previous && initialize) throw new Error('Fonts are already pinned; use the default command to restore or --check to verify');
  let snapshot = await readMaybe(snapshotPath);
  if (!snapshot) {
    if (!initialize) throw new Error('Pinned upstream CSS snapshot is missing');
    snapshot = await download(sourceUrl);
  }
  if (hash(snapshot) !== snapshotSha256) throw new Error('Upstream font CSS differs from the reviewed snapshot; review version changes before repinning');
  const css = snapshot.toString('utf8');
  const faces = parseFaces(css);
  const urls = [...new Set(faces.map((face) => face.sourceUrl))];
  if (urls.length !== 608) throw new Error('Reviewed font file inventory changed');
  const expectedBySource = new Map(previous?.files.flatMap((file) => file.sourceUrls.map((url) => [url, file])));
  if (previous && (previous.schemaVersion !== 1 || previous.source.url !== sourceUrl
    || previous.source.userAgent !== userAgent || previous.source.sha256 !== snapshotSha256
    || expectedBySource.size !== urls.length || urls.some((url) => !expectedBySource.has(url)))) {
    throw new Error('Pinned font provenance or file inventory changed');
  }
  let completed = 0;
  const downloaded = await pooled(urls, async (url) => {
    const expected = expectedBySource.get(url);
    let data = expected && await readMaybe(assetPath(expected.href));
    if (!data) {
      if (check) throw new Error(`Missing pinned font: ${url}`);
      data = await download(url);
    }
    if (expected) assertHash(data, expected, url);
    const slug = new URL(url).pathname.split('/')[2];
    const href = expected?.href || `/fonts/google/${slug}.${hash(data).slice(0, 16)}.woff2`;
    if (!href.endsWith(`.${hash(data).slice(0, 16)}.woff2`)) throw new Error(`Font filename does not match its content: ${href}`);
    if (!check) await writeLocked(assetPath(href), data);
    if (++completed % 100 === 0) process.stdout.write(`Fonts ${completed}/${urls.length}\n`);
    return { sourceUrl: url, href, ...info(data) };
  });
  const byHash = new Map();
  for (const file of downloaded) {
    const existing = byHash.get(file.sha256);
    if (existing) existing.sourceUrls.push(file.sourceUrl);
    else byHash.set(file.sha256, { sourceUrls: [file.sourceUrl], href: file.href, sha256: file.sha256, bytes: file.bytes });
  }
  const files = [...byHash.values()];
  const localBySource = new Map(files.flatMap((file) => file.sourceUrls.map((url) => [url, file.href])));
  const localCss = css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, (_all, url) => {
    const href = localBySource.get(url);
    if (!href) throw new Error(`Unmapped upstream font: ${url}`);
    return `url(${href})`;
  });
  const cssBytes = Buffer.from(localCss);
  const cssHref = `/fonts/google/fonts.${hash(cssBytes).slice(0, 16)}.css`;
  const licensedFamilies = await pooled(families, async ([name, slug], index) => {
    const href = `/fonts/google/licenses/${slug}-OFL.txt`;
    const expected = previous?.families.find((family) => family.name === name)?.license;
    if (previous && !expected) throw new Error(`Pinned font license is missing from the manifest: ${name}`);
    let data = await readMaybe(assetPath(href));
    if (!data) {
      if (check) throw new Error(`Missing font license: ${name}`);
      data = await download(licenseUrls[index]);
    }
    if (expected) assertHash(data, expected, name);
    if (!data.toString('utf8').includes('SIL OPEN FONT LICENSE Version 1.1')) throw new Error(`Unexpected font license: ${name}`);
    if (!check) await writeLocked(assetPath(href), data);
    return { name, license: { sourceUrl: licenseUrls[index], href, ...info(data) } };
  });
  function latinPreload(family) {
    const face = faces.find(({ descriptors }) => descriptors['font-family'] === `'${family}'`
      && descriptors['font-style'] === 'normal' && descriptors['font-weight'] === '400'
      && descriptors['unicode-range'].includes('U+0000-00FF'));
    if (!face) throw new Error(`Primary Latin face missing: ${family}`);
    return localBySource.get(face.sourceUrl);
  }
  const manifest = {
    schemaVersion: 1,
    source: { url: sourceUrl, userAgent, snapshot: 'src/data/google-fonts-upstream.css', ...info(snapshot) },
    css: { href: cssHref, ...info(cssBytes) },
    preloads: { cinzelLatin: latinPreload('Cinzel'), crimsonProNormalLatin: latinPreload('Crimson Pro') },
    families: licensedFamilies,
    files,
    faces: faces.map((face) => ({ ...face, href: localBySource.get(face.sourceUrl) })),
  };
  const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  if (previousBytes && !previousBytes.equals(manifestBytes)) throw new Error('Generated font manifest differs from its pinned source');
  if (check) {
    const installedCss = await readMaybe(assetPath(cssHref));
    if (!installedCss) throw new Error('Generated font stylesheet missing');
    assertHash(installedCss, manifest.css, cssHref);
  } else {
    await writeLocked(snapshotPath, snapshot);
    await writeLocked(assetPath(cssHref), cssBytes);
    await writeLocked(manifestPath, manifestBytes);
  }
  process.stdout.write(`${check ? 'Verified' : 'Pinned'} ${faces.length} faces, ${files.length} WOFF2 files (${files.reduce((total, file) => total + file.bytes, 0)} bytes); CSS ${cssHref}\n`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });

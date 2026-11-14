import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { nodes } from '../src/data/beyond-code.ts';

export const thumbnailSettings = Object.freeze({
  schemaVersion: 1, width: 256, height: 256, fit: 'outside',
  withoutEnlargement: true, format: 'webp', quality: 70,
});
export const thumbnailBudget = 1_500_000;
export const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));
export const manifestFile = fileURLToPath(new URL('../src/data/beyond-code-thumbnails.json', import.meta.url));
const mediaFile = new URL('../src/data/beyond-code-media.json', import.meta.url);
const thumbnailPrefix = '/images/beyond-code/thumbnails/';
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

/** Accept only this collection's local, single-file originals or generated covers. */
export function artworkPath(url, generated = false) {
  const pattern = generated
    ? /^\/images\/beyond-code\/thumbnails\/[a-z0-9][a-z0-9-]*\.[a-f0-9]{12}\.webp$/i
    : /^\/images\/beyond-code\/[a-z0-9][a-z0-9-]*\.(?:jpe?g|png|gif|webp)$/i;
  if (typeof url !== 'string' || !pattern.test(url)) throw new Error(`Invalid collection artwork path: ${url}`);
  return path.resolve(publicDirectory, `.${url}`);
}

export function usedArtwork(media) {
  return [...new Set(nodes.map((node) => media[node.id]?.artwork || node.artwork || '').filter(Boolean))].sort();
}

async function assertConfined(file) {
  const base = path.join(await realpath(publicDirectory), 'images', 'beyond-code');
  const relative = path.relative(base, await realpath(file));
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Artwork escapes collection directory: ${file}`);
}

export async function generateThumbnails() {
  const media = JSON.parse(await readFile(mediaFile, 'utf8'));
  const prepared = [];
  for (const artwork of usedArtwork(media)) {
    const sourcePath = artworkPath(artwork);
    await assertConfined(sourcePath);
    const source = await readFile(sourcePath);
    // Preserve aspect ratio: existing book object-position and Ghibli's contain
    // presentation must keep using the same framing as the original artwork.
    const { data, info } = await sharp(source).rotate()
      .resize({ width: thumbnailSettings.width, height: thumbnailSettings.height,
        fit: thumbnailSettings.fit, withoutEnlargement: thumbnailSettings.withoutEnlargement })
      .webp({ quality: thumbnailSettings.quality }).toBuffer({ resolveWithObject: true });
    const hash = sha256(data);
    const stem = path.posix.basename(artwork, path.posix.extname(artwork));
    const thumbnail = `${thumbnailPrefix}${stem}.${hash.slice(0, 12)}.webp`;
    prepared.push({ artwork, data, entry: { thumbnail, sourceSha256: sha256(source),
      sha256: hash, width: info.width, height: info.height, bytes: info.size } });
  }
  const bytes = prepared.reduce((sum, image) => sum + image.data.byteLength, 0);
  if (bytes > thumbnailBudget) throw new Error(`Collection thumbnails exceed ${thumbnailBudget} bytes: ${bytes}`);
  const outputDirectory = path.join(publicDirectory, 'images', 'beyond-code', 'thumbnails');
  await mkdir(outputDirectory, { recursive: true });
  await assertConfined(outputDirectory);
  for (const { data, entry } of prepared) {
    const outputFile = artworkPath(entry.thumbnail, true);
    try {
      await writeFile(outputFile, data, { flag: 'wx' });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      await assertConfined(outputFile);
      if (sha256(await readFile(outputFile)) !== entry.sha256) throw new Error(`Unexpected existing thumbnail: ${outputFile}`, { cause: error });
    }
  }
  const manifest = { ...thumbnailSettings, sharpVersion: sharp.versions.sharp,
    images: Object.fromEntries(prepared.map(({ artwork, entry }) => [artwork, entry])) };
  await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  return { images: prepared.length, bytes };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = await generateThumbnails();
  console.info(`Generated ${result.images} collection thumbnails (${result.bytes} bytes). Originals unchanged.`);
}

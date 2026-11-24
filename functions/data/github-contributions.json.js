import { validateGithubSnapshot } from '../../src/utils/github-contributions.js';

const snapshotPath = '/data/github-contributions.json';
const publishedSnapshotUrl = `https://huiishan99.github.io/web-shan-verse${snapshotPath}`;
const maxSnapshotBytes = 64 * 1024;

async function readPublishedSnapshot() {
  const response = await fetch(publishedSnapshotUrl, {
    headers: { Accept: 'application/json' },
    redirect: 'manual',
    signal: AbortSignal.timeout(1_800),
  });
  if (!response.ok) throw new Error(`Snapshot mirror returned HTTP ${response.status}`);
  if (!response.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    throw new Error('Snapshot mirror did not return JSON');
  }
  if (Number(response.headers.get('Content-Length')) > maxSnapshotBytes) throw new Error('Snapshot mirror response is too large');

  const body = await response.text();
  if (new TextEncoder().encode(body).byteLength > maxSnapshotBytes) throw new Error('Snapshot mirror response is too large');
  return validateGithubSnapshot(JSON.parse(body));
}

export async function onRequestGet({ next, request }) {
  // Request the full local asset without the visitor's conditional or range headers.
  const assetRequest = new Request(new URL(snapshotPath, request.url));
  const [fallback, published] = await Promise.all([
    next(assetRequest),
    readPublishedSnapshot().catch((error) => {
      console.warn('GitHub contribution snapshot mirror unavailable:', error.message);
      return undefined;
    }),
  ]);
  if (!published) return fallback;

  if (fallback.ok) {
    try {
      const local = validateGithubSnapshot(await fallback.clone().json());
      if (published.rangeEnd < local.rangeEnd || (published.rangeEnd === local.rangeEnd
        && Date.parse(published.fetchedAt) <= Date.parse(local.fetchedAt))) return fallback;
    } catch (error) {
      console.warn('Bundled GitHub contribution snapshot invalid:', error.message);
    }
  }
  return Response.json(published, { headers: { 'Cache-Control': 'public, max-age=300' } });
}

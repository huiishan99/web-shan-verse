import bundledSnapshot from '../../public/data/github-contributions.json' with { type: 'json' };
import { validateGithubSnapshot } from '../../src/utils/github-contributions.js';

const publishedSnapshotUrl = 'https://huiishan99.github.io/web-shan-verse/data/github-contributions.json';
const maxSnapshotBytes = 64 * 1024;
const staticSnapshot = validateGithubSnapshot(bundledSnapshot);

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

export async function onRequestGet({ next }) {
  const published = await readPublishedSnapshot().catch((error) => {
    console.warn('GitHub contribution snapshot mirror unavailable:', error.message);
    return undefined;
  });
  if (published && (published.rangeEnd > staticSnapshot.rangeEnd
    || (published.rangeEnd === staticSnapshot.rangeEnd
      && Date.parse(published.fetchedAt) > Date.parse(staticSnapshot.fetchedAt)))) {
    return Response.json(published, { headers: { 'Cache-Control': 'public, max-age=300' } });
  }
  return next();
}

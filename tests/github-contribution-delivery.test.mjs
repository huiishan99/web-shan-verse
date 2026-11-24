import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { onRequestGet } from '../functions/data/github-contributions.json.js';

const ARTIFACT_URL = 'https://huiishan99.github.io/web-shan-verse/data/github-contributions.json';
const DAY_MS = 86_400_000;
const staticBytes = await readFile(new URL('../public/data/github-contributions.json', import.meta.url), 'utf8');
const baseline = JSON.parse(staticBytes);

function updatedSnapshot() {
  const snapshot = structuredClone(baseline);
  snapshot.fetchedAt = new Date(Date.parse(baseline.fetchedAt) + 1000).toISOString();
  // GitHub can correct its count down on the same day. Coverage and observation
  // time determine freshness, not whether the contribution total increases.
  const lastDay = snapshot.contributions.at(-1);
  lastDay.count = lastDay.count > 0 ? lastDay.count - 1 : 1;
  return snapshot;
}

function jsonArtifact(snapshot) {
  const response = Response.json(snapshot);
  Object.defineProperty(response, 'url', { value: ARTIFACT_URL });
  return response;
}

function requestContext() {
  const staticResponse = new Response(staticBytes, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=120',
      ETag: '"bundled-snapshot"',
    },
  });
  let nextCalls = 0;
  return {
    request: new Request('https://preview.example/data/github-contributions.json?url=https://other.example', {
      headers: { 'If-None-Match': '"visitor-cache"', Range: 'bytes=0-8' },
    }),
    async next(request) {
      nextCalls++;
      assert.equal(request.url, 'https://preview.example/data/github-contributions.json');
      assert.equal(request.headers.has('if-none-match'), false);
      assert.equal(request.headers.has('range'), false);
      return staticResponse;
    },
    expectStaticServed: async (response) => {
      assert.equal(nextCalls, 1);
      assert.equal(response.status, 200);
      assert.deepEqual([...response.headers], [...staticResponse.headers]);
      assert.equal(await response.text(), staticBytes);
    },
  };
}

test('Cloudflare invokes the Pages Function only for the contribution JSON route', async () => {
  const routes = JSON.parse(await readFile(new URL('../public/_routes.json', import.meta.url), 'utf8'));
  assert.deepEqual(routes, { version: 1, include: ['/data/github-contributions.json'], exclude: [] });
});

test('the public JSON route reads a fixed HTTPS artifact without redirects and serves same-day count corrections', async (t) => {
  const newer = updatedSnapshot();
  const remote = t.mock.method(globalThis, 'fetch', async () => jsonArtifact(newer));
  const response = await onRequestGet(requestContext());

  assert.equal(remote.mock.callCount(), 1);
  const [url, options] = remote.mock.calls[0].arguments;
  assert.equal(String(url), ARTIFACT_URL);
  assert.equal(options.redirect, 'manual');
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/i);
  assert.deepEqual(await response.json(), newer);
});

test('the public JSON route serves a valid snapshot that covers the following day', async (t) => {
  const nextDay = structuredClone(baseline);
  nextDay.rangeEnd = new Date(Date.parse(`${baseline.rangeEnd}T00:00:00Z`) + DAY_MS).toISOString().slice(0, 10);
  nextDay.fetchedAt = new Date(Date.parse(baseline.fetchedAt) + DAY_MS).toISOString();
  nextDay.contributions.shift();
  nextDay.rangeStart = nextDay.contributions[0].date;
  nextDay.contributions.push({ date: nextDay.rangeEnd, count: 12, level: 1 });

  t.mock.method(globalThis, 'fetch', async () => jsonArtifact(nextDay));
  const response = await onRequestGet(requestContext());
  assert.deepEqual(await response.json(), nextDay);
});

test('a more recent fetch with an older last observed day cannot replace the bundled coverage', async (t) => {
  const older = updatedSnapshot();
  const first = Date.parse(`${older.rangeStart}T00:00:00Z`);
  older.rangeStart = new Date(first - DAY_MS).toISOString().slice(0, 10);
  older.contributions.unshift({ date: older.rangeStart, count: 0, level: 0 });
  older.contributions.pop();
  older.rangeEnd = older.contributions.at(-1).date;

  t.mock.method(globalThis, 'fetch', async () => jsonArtifact(older));
  const context = requestContext();
  await context.expectStaticServed(await onRequestGet(context));
});

for (const [name, fetchImpl] of [
  ['an equal observation', async () => jsonArtifact(baseline)],
  ['an older same-day observation', async () => {
    const snapshot = updatedSnapshot();
    snapshot.fetchedAt = new Date(Date.parse(baseline.fetchedAt) - 1000).toISOString();
    return jsonArtifact(snapshot);
  }],
  ['a different snapshot owner', async () => jsonArtifact({ ...updatedSnapshot(), username: 'someone-else' })],
  ['missing days', async () => {
    const snapshot = updatedSnapshot();
    snapshot.contributions.splice(10, 1);
    return jsonArtifact(snapshot);
  }],
  ['oversized JSON without a content-length', async () => jsonArtifact({ ...updatedSnapshot(), padding: 'x'.repeat(70 * 1024) })],
  ['malformed JSON', async () => new Response('{', { headers: { 'Content-Type': 'application/json' } })],
  ['an HTTP error', async () => new Response('Unavailable', { status: 503 })],
  ['a redirect', async () => Response.redirect('https://other.example/data/github-contributions.json')],
  ['a network failure', async () => { throw new TypeError('Network unavailable'); }],
  ['an aborted fetch', async () => { throw new DOMException('Request was aborted', 'AbortError'); }],
]) {
  test(`the public JSON route serves the complete static fallback after ${name}`, async (t) => {
    const remote = t.mock.method(globalThis, 'fetch', fetchImpl);
    const context = requestContext();
    await context.expectStaticServed(await onRequestGet(context));
    assert.equal(remote.mock.callCount(), 1);
  });
}

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validateGithubSnapshot } from '../src/utils/github-contributions.js';
import {
  parseGithubContributions,
  refreshGithubSnapshot,
} from '../scripts/update-github-contributions.mjs';

const USERNAME = 'huiishan99';
const SOURCE = `https://github.com/users/${USERNAME}/contributions`;
const DAY_MS = 86_400_000;
const NOW = '2026-11-08T12:00:00.000Z';

function snapshotFixture({ days = 365, end = '2026-11-08', fetchedAt = NOW } = {}) {
  const endTime = Date.parse(`${end}T00:00:00.000Z`);
  const contributions = Array.from({ length: days }, (_, index) => ({
    date: new Date(endTime - (days - index - 1) * DAY_MS).toISOString().slice(0, 10),
    count: [0, 1, 23, 1234][index % 4],
    level: [0, 1, 2, 4][index % 4],
  }));
  return {
    schemaVersion: 1,
    username: USERNAME,
    source: SOURCE,
    fetchedAt,
    rangeStart: contributions[0].date,
    rangeEnd: contributions.at(-1).date,
    contributions,
  };
}

function htmlFixture(snapshot = snapshotFixture()) {
  // GitHub's tool-tip elements are separate from the cells. Intentionally give
  // the cells and tooltips different orders so joining by position is incorrect.
  const cells = snapshot.contributions.map((day, index) => (
    `<td class="other-class ContributionCalendar-day" id="day-${index}" data-date="${day.date}" data-level="${day.level}"></td>`
  )).reverse();
  const tooltips = snapshot.contributions.map((day, index) => {
    const count = day.count === 0 ? 'No' : day.count.toLocaleString('en-US');
    const suffix = day.count === 1 ? 'contribution' : 'contributions';
    return `<tool-tip for="day-${index}">${count} ${suffix} on ${day.date}.</tool-tip>`;
  });
  const interleavedTooltips = [
    ...tooltips.filter((_, index) => index % 2 === 1),
    ...tooltips.filter((_, index) => index % 2 === 0),
  ];
  return `<html><body><table><tbody><tr>${cells.join('')}<td data-date="1900-01-01" data-level="4">unrelated cell</td></tr></tbody></table><div>${interleavedTooltips.join('')}</div></body></html>`;
}

function htmlResponse(html, url = '') {
  const response = new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  if (url) Object.defineProperty(response, 'url', { value: url });
  return response;
}

async function temporaryOutput(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'shan-github-contributions-'));
  t.after(() => {
    const target = path.resolve(directory);
    assert.equal(path.dirname(target), path.resolve(tmpdir()));
    assert.ok(path.basename(target).startsWith('shan-github-contributions-'));
    return rm(target, { recursive: true, force: true });
  });
  const outputPath = path.join(directory, 'data', 'github-contributions.json');
  await mkdir(path.dirname(outputPath));
  return { directory, outputPath };
}

async function cacheSnapshot(outputPath, snapshot = snapshotFixture()) {
  const bytes = `${JSON.stringify(snapshot, null, 2)}\n`;
  await writeFile(outputPath, bytes);
  // A fixed old timestamp detects replacement even on fast filesystems where
  // two consecutive writes could otherwise receive indistinguishable times.
  await utimes(outputPath, new Date('2001-01-01T00:00:00.000Z'), new Date('2001-01-01T00:00:00.000Z'));
  const { mtimeNs } = await stat(outputPath, { bigint: true });
  return { bytes, mtimeNs, snapshot };
}

async function expectCacheUnchanged(outputPath, previous) {
  assert.equal(await readFile(outputPath, 'utf8'), previous.bytes);
  assert.equal((await stat(outputPath, { bigint: true })).mtimeNs, previous.mtimeNs);
}

test('snapshot validation accepts complete common/leap-year coverage and preserves identity', () => {
  for (const snapshot of [
    snapshotFixture(),
    snapshotFixture({ days: 366, end: '2024-03-01', fetchedAt: '2024-03-02T12:00:00.000Z' }),
  ]) {
    assert.strictEqual(validateGithubSnapshot(snapshot), snapshot);
  }
  const maximumSafeCount = snapshotFixture();
  maximumSafeCount.contributions[0].count = Number.MAX_SAFE_INTEGER;
  assert.strictEqual(validateGithubSnapshot(maximumSafeCount), maximumSafeCount);
  const anotherUser = {
    ...snapshotFixture(),
    username: 'another-user',
    source: 'https://github.com/users/another-user/contributions',
  };
  assert.strictEqual(validateGithubSnapshot(anotherUser, 'another-user'), anotherUser);
});

test('snapshot timestamps accept valid ISO UTC precision without accepting offsets or invalid dates', () => {
  for (const fetchedAt of ['2026-11-08T12:00:00Z', '2026-11-08T12:00:00.1Z', '2026-11-08T12:00:00.12Z', NOW]) {
    const snapshot = snapshotFixture({ fetchedAt });
    assert.strictEqual(validateGithubSnapshot(snapshot), snapshot);
  }
  for (const fetchedAt of ['not-a-date', '2026-11-08', '2026-11-08T12:00:00+00:00', '2026-02-30T12:00:00.000Z', '2026-11-08T25:00:00.000Z']) {
    assert.throws(() => validateGithubSnapshot(snapshotFixture({ fetchedAt })), fetchedAt);
  }
});

test('snapshot validation rejects incompatible metadata, owner/source mismatches, and reversed/future ranges', () => {
  const changes = [
    (data) => { data.schemaVersion = 2; },
    (data) => { data.schemaVersion = '1'; },
    (data) => { data.username = 'another-user'; },
    (data) => { data.username = ' Huiishan99 '; },
    (data) => { data.source = 'https://example.com/users/huiishan99/contributions'; },
    (data) => { data.source = 'https://github.com/users/another-user/contributions'; },
    (data) => { data.source += '?unverified=1'; },
    (data) => { data.rangeStart = data.contributions[1].date; },
    (data) => { data.rangeEnd = data.contributions.at(-2).date; },
    (data) => { [data.rangeStart, data.rangeEnd] = [data.rangeEnd, data.rangeStart]; },
    (data) => { data.fetchedAt = '2026-11-07T23:59:59.999Z'; },
  ];
  for (const change of changes) {
    const snapshot = snapshotFixture();
    change(snapshot);
    assert.throws(() => validateGithubSnapshot(snapshot), change.toString());
  }
  assert.throws(() => validateGithubSnapshot(snapshotFixture(), 'another-user'));
  for (const invalid of [null, [], {}, { contributions: [] }]) assert.throws(() => validateGithubSnapshot(invalid));
});

test('snapshot validation rejects missing, duplicate, unsorted, malformed, or nonconsecutive dates', () => {
  const changes = [
    (data) => { data.contributions.pop(); data.rangeEnd = data.contributions.at(-1).date; },
    (data) => { data.contributions = []; },
    (data) => { data.contributions[10].date = data.contributions[9].date; },
    (data) => { [data.contributions[8], data.contributions[9]] = [data.contributions[9], data.contributions[8]]; },
    (data) => { data.contributions[10].date = '2026-02-30'; },
    (data) => { data.contributions[10].date = '2026-2-01'; },
    (data) => { data.contributions[10].date = '2026-02-01T00:00:00Z'; },
  ];
  for (const change of changes) {
    const snapshot = snapshotFixture();
    change(snapshot);
    assert.throws(() => validateGithubSnapshot(snapshot), change.toString());
  }
  // Keep 365 unique sorted real dates while leaving a gap in the middle.
  const withGap = snapshotFixture({ days: 366 });
  withGap.contributions.splice(100, 1);
  assert.throws(() => validateGithubSnapshot(withGap));
});

test('snapshot validation rejects unsafe or noninteger counts and invalid levels without coercion', () => {
  for (const count of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '7', null, true]) {
    const snapshot = snapshotFixture();
    snapshot.contributions[2].count = count;
    assert.throws(() => validateGithubSnapshot(snapshot), `count=${String(count)}`);
  }
  for (const level of [-1, 5, 1.5, NaN, Infinity, '4', null, true]) {
    const snapshot = snapshotFixture();
    snapshot.contributions[2].level = level;
    assert.throws(() => validateGithubSnapshot(snapshot), `level=${String(level)}`);
  }
});

test('HTML parsing joins independent tooltips by ID, sorts dates, and reads zero/singular/plural/comma counts', () => {
  const snapshot = snapshotFixture();
  const parsed = parseGithubContributions(htmlFixture(snapshot), { fetchedAt: NOW });
  assert.deepEqual(parsed, snapshot);
  assert.deepEqual(parsed.contributions.slice(0, 4).map(({ count }) => count), [0, 1, 23, 1234]);
});

test('HTML parsing accepts a complete 366-day range containing February 29', () => {
  const snapshot = snapshotFixture({ days: 366, end: '2024-03-01', fetchedAt: '2024-03-02T12:00:00.000Z' });
  const parsed = parseGithubContributions(htmlFixture(snapshot), { fetchedAt: snapshot.fetchedAt });
  assert.deepEqual(parsed, snapshot);
  assert.ok(parsed.contributions.some(({ date }) => date === '2024-02-29'));
});

test('HTML parsing rejects missing/unrecognized tooltips rather than inventing zero contributions', () => {
  const html = htmlFixture();
  for (const invalidHtml of [
    html.replace(/<tool-tip for="day-0">[^<]*<\/tool-tip>/, ''),
    html.replace('No contributions on', 'Contribution count unavailable on'),
    html.replace('1 contribution on', '1.5 contributions on'),
    html.replace('1,234 contributions on', '12,34 contributions on'),
    html.replace('for="day-0"', 'for="unmatched-cell"'),
  ]) {
    assert.throws(() => parseGithubContributions(invalidHtml, { fetchedAt: NOW }));
  }
});

test('HTML parsing rejects challenges, truncated grids, invalid dates, and invalid levels', () => {
  const html = htmlFixture();
  const snapshot = snapshotFixture();
  for (const invalidHtml of [
    '<html><title>Just a moment...</title><body>Checking your browser before continuing</body></html>',
    '<html><body>GitHub is temporarily unavailable</body></html>',
    html.replace(/<td class="other-class ContributionCalendar-day" id="day-0"[^>]*><\/td>/, ''),
    html.replace(`data-date="${snapshot.rangeStart}"`, 'data-date="2026-02-30"'),
    html.replace('data-level="0"', 'data-level="5"'),
    html.replace('data-level="0"', ''),
  ]) {
    assert.throws(() => parseGithubContributions(invalidHtml, { fetchedAt: NOW }));
  }
});

test('refresh writes only a validated snapshot from the canonical public endpoint', async (t) => {
  const { outputPath } = await temporaryOutput(t);
  const expected = snapshotFixture();
  let requests = 0;
  const result = await refreshGithubSnapshot({
    outputPath,
    now: () => new Date(NOW),
    fetchImpl: async (url, options) => {
      requests += 1;
      assert.equal(String(url), SOURCE);
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal instanceof AbortSignal);
      return htmlResponse(htmlFixture(expected), SOURCE);
    },
    warn: () => assert.fail('A successful refresh must not warn'),
  });
  assert.equal(requests, 1);
  assert.equal(result.updated, true);
  assert.deepEqual(result.snapshot, expected);
  assert.deepEqual(JSON.parse(await readFile(outputPath, 'utf8')), expected);
});

test('a response completed across UTC midnight records the completed observation date', async (t) => {
  const { outputPath } = await temporaryOutput(t);
  let currentTime = new Date('2026-11-08T23:59:59.000Z');
  const completedAt = '2026-11-09T00:00:01.000Z';
  const expected = snapshotFixture({ end: '2026-11-09', fetchedAt: completedAt });
  const result = await refreshGithubSnapshot({
    outputPath,
    now: () => currentTime,
    fetchImpl: async () => {
      const response = htmlResponse(htmlFixture(expected));
      const readText = response.text.bind(response);
      response.text = async () => {
        const html = await readText();
        currentTime = new Date(completedAt);
        return html;
      };
      return response;
    },
    warn: () => assert.fail('A valid response crossing midnight must not warn'),
  });
  assert.equal(result.updated, true);
  assert.equal(result.snapshot.fetchedAt, completedAt);
  assert.deepEqual(result.snapshot, expected);
  assert.deepEqual(JSON.parse(await readFile(outputPath, 'utf8')), expected);
});

test('refresh can replace a valid cached snapshot with corrected counts from the same latest day', async (t) => {
  const { outputPath } = await temporaryOutput(t);
  const cached = snapshotFixture({ fetchedAt: '2026-11-08T08:00:00.000Z' });
  cached.contributions[2].count = 99;
  await cacheSnapshot(outputPath, cached);
  const expected = snapshotFixture();
  const result = await refreshGithubSnapshot({
    outputPath,
    now: () => new Date(NOW),
    fetchImpl: async () => htmlResponse(htmlFixture(expected)),
    warn: () => assert.fail('A corrected snapshot must not warn'),
  });
  assert.equal(result.updated, true);
  assert.deepEqual(result.snapshot, expected);
  assert.equal(result.snapshot.contributions[2].count, 23);
  assert.deepEqual(JSON.parse(await readFile(outputPath, 'utf8')), expected);
});

for (const conflict of ['older-range', 'older-observation']) {
  test(`a late concurrent ${conflict} response cannot replace a newer committed snapshot`, async (t) => {
    const { outputPath } = await temporaryOutput(t);
    await cacheSnapshot(outputPath, snapshotFixture({ end: '2026-11-06', fetchedAt: '2026-11-08T09:00:00.000Z' }));
    const older = snapshotFixture({
      end: conflict === 'older-range' ? '2026-11-07' : '2026-11-08',
      fetchedAt: '2026-11-08T10:00:00.000Z',
    });
    const newer = snapshotFixture({ fetchedAt: '2026-11-08T11:00:00.000Z' });
    newer.contributions[2].count = 9;
    let releaseOlder;
    let markOlderStarted;
    const olderStarted = new Promise((resolve) => { markOlderStarted = resolve; });
    const olderResponse = new Promise((resolve) => {
      releaseOlder = () => resolve(htmlResponse(htmlFixture(older)));
    });
    const warnings = [];
    const pendingOlder = refreshGithubSnapshot({
      outputPath,
      now: () => new Date(older.fetchedAt),
      fetchImpl: async () => {
        markOlderStarted();
        return olderResponse;
      },
      warn: (...args) => warnings.push(args),
    });
    try {
      await olderStarted;
      const newerResult = await refreshGithubSnapshot({
        outputPath,
        now: () => new Date(newer.fetchedAt),
        fetchImpl: async () => htmlResponse(htmlFixture(newer)),
        warn: () => assert.fail('The newer concurrent response must not warn'),
      });
      assert.equal(newerResult.updated, true);
      const committed = {
        bytes: await readFile(outputPath, 'utf8'),
        mtimeNs: (await stat(outputPath, { bigint: true })).mtimeNs,
      };
      releaseOlder();
      const olderResult = await pendingOlder;
      assert.equal(olderResult.updated, false);
      assert.deepEqual(olderResult.snapshot, newer);
      assert.ok(warnings.length > 0);
      assert.deepEqual(JSON.parse(await readFile(outputPath, 'utf8')), newer);
      await expectCacheUnchanged(outputPath, committed);
    } finally {
      releaseOlder();
      await pendingOlder.catch(() => {});
    }
  });
}

for (const failure of ['network', 'http-503', 'challenge', 'wrong-content-type', 'wrong-response-owner', 'stale-candidate', 'future-candidate']) {
  test(`a ${failure} refresh preserves valid cached bytes and mtime while warning`, async (t) => {
    const { outputPath } = await temporaryOutput(t);
    const previous = await cacheSnapshot(outputPath);
    const warnings = [];
    const result = await refreshGithubSnapshot({
      outputPath,
      now: () => new Date(NOW),
      fetchImpl: async () => {
        if (failure === 'network') throw new Error('Offline test');
        if (failure === 'http-503') return new Response('Unavailable', { status: 503 });
        if (failure === 'challenge') return htmlResponse('<html><title>Just a moment...</title></html>');
        if (failure === 'wrong-content-type') return new Response(htmlFixture(), { headers: { 'Content-Type': 'application/json' } });
        if (failure === 'wrong-response-owner') return htmlResponse(htmlFixture(), 'https://github.com/users/another-user/contributions');
        if (failure === 'stale-candidate') return htmlResponse(htmlFixture(snapshotFixture({ end: '2026-11-07' })));
        return htmlResponse(htmlFixture(snapshotFixture({ end: '2026-11-09', fetchedAt: '2026-11-09T12:00:00.000Z' })));
      },
      warn: (...args) => warnings.push(args),
    });
    assert.equal(result.updated, false);
    assert.deepEqual(result.snapshot, previous.snapshot);
    assert.ok(warnings.length > 0);
    await expectCacheUnchanged(outputPath, previous);
  });
}

test('an aborted short refresh timeout preserves valid cached bytes and mtime', { timeout: 2000 }, async (t) => {
  const { outputPath } = await temporaryOutput(t);
  const previous = await cacheSnapshot(outputPath);
  let aborted = false;
  const warnings = [];
  const result = await refreshGithubSnapshot({
    outputPath,
    now: () => new Date(NOW),
    timeoutMs: 20,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      const onAbort = () => {
        aborted = true;
        reject(new DOMException('Timeout test', 'AbortError'));
      };
      if (signal.aborted) onAbort();
      else signal.addEventListener('abort', onAbort, { once: true });
    }),
    warn: (...args) => warnings.push(args),
  });
  assert.equal(aborted, true);
  assert.equal(result.updated, false);
  assert.deepEqual(result.snapshot, previous.snapshot);
  assert.ok(warnings.length > 0);
  await expectCacheUnchanged(outputPath, previous);
});

test('the refresh timeout also covers a stalled HTML response body after headers arrive', { timeout: 2000 }, async (t) => {
  const { outputPath } = await temporaryOutput(t);
  const previous = await cacheSnapshot(outputPath);
  let aborted = false;
  let bodyController;
  t.after(() => bodyController?.error(new Error('Test cleanup')));
  const warnings = [];
  const result = await refreshGithubSnapshot({
    outputPath,
    now: () => new Date(NOW),
    timeoutMs: 20,
    fetchImpl: async (_url, { signal }) => new Response(new ReadableStream({
      start(controller) {
        bodyController = controller;
        controller.enqueue(new TextEncoder().encode('<html><body>'));
        signal.addEventListener('abort', () => {
          aborted = true;
          controller.error(new DOMException('Body timeout test', 'AbortError'));
        }, { once: true });
      },
    }), { headers: { 'Content-Type': 'text/html' } }),
    warn: (...args) => warnings.push(args),
  });
  assert.equal(aborted, true);
  assert.equal(result.updated, false);
  assert.deepEqual(result.snapshot, previous.snapshot);
  assert.ok(warnings.length > 0);
  await expectCacheUnchanged(outputPath, previous);
});

test('refresh failures with no cache throw and never create a misleading snapshot', async (t) => {
  const { outputPath } = await temporaryOutput(t);
  await assert.rejects(refreshGithubSnapshot({
    outputPath,
    now: () => new Date(NOW),
    fetchImpl: async () => new Response('Unavailable', { status: 503 }),
    warn: () => {},
  }));
  await assert.rejects(readFile(outputPath), { code: 'ENOENT' });
});

test('a corrupt or wrong-owner cache is not accepted as a fallback', async (t) => {
  const { outputPath } = await temporaryOutput(t);
  const wrongOwner = snapshotFixture();
  wrongOwner.username = 'another-user';
  for (const bytes of ['{invalid-json', JSON.stringify(wrongOwner), JSON.stringify({ contributions: [] })]) {
    await writeFile(outputPath, bytes);
    await assert.rejects(refreshGithubSnapshot({
      outputPath,
      now: () => new Date(NOW),
      fetchImpl: async () => { throw new Error('Offline test'); },
      warn: () => {},
    }));
    assert.equal(await readFile(outputPath, 'utf8'), bytes);
  }
});

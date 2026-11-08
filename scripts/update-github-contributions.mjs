import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'parse5';
import { validateGithubSnapshot } from '../src/utils/github-contributions.js';

const DEFAULT_USERNAME = 'huiishan99';
const DEFAULT_OUTPUT = fileURLToPath(new URL('../public/data/github-contributions.json', import.meta.url));
const pendingCommits = new Map();

class SnapshotRefreshError extends Error {}

function sourceFor(username) {
  if (typeof username !== 'string' || !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)
    || username.includes('--')) {
    throw new SnapshotRefreshError('Invalid GitHub username');
  }
  return `https://github.com/users/${username}/contributions`;
}

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes || []) walk(child, visit);
}

function attributes(node) {
  return Object.fromEntries((node.attrs || []).map(({ name, value }) => [name, value]));
}

function textContent(node) {
  if (node.nodeName === '#text') return node.value;
  return (node.childNodes || []).map(textContent).join('');
}

function tooltipCount(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (/^No contributions on\b/.test(normalized)) return 0;
  const match = normalized.match(/^(\d{1,3}(?:,\d{3})*|\d+) contributions? on\b/);
  if (!match) throw new SnapshotRefreshError('Unrecognized GitHub contribution tooltip');
  const count = Number(match[1].replaceAll(',', ''));
  if (!Number.isSafeInteger(count)) throw new SnapshotRefreshError('Invalid GitHub contribution tooltip count');
  return count;
}

/** Parse GitHub's public rolling-year fragment; tooltip references identify cells. */
export function parseGithubContributions(html, {
  username = DEFAULT_USERNAME,
  fetchedAt = new Date().toISOString(),
} = {}) {
  const source = sourceFor(username);
  if (typeof html !== 'string' || !html.trim()) throw new SnapshotRefreshError('Empty GitHub contribution HTML');
  const cells = [];
  const tooltips = new Map();
  walk(parse(html), (node) => {
    if (!node.tagName) return;
    const attrs = attributes(node);
    if (node.tagName === 'td' && (attrs.class || '').split(/\s+/).includes('ContributionCalendar-day')) {
      cells.push(attrs);
    }
    if (node.tagName === 'tool-tip' && attrs.for) {
      const existing = tooltips.get(attrs.for) || [];
      existing.push(textContent(node));
      tooltips.set(attrs.for, existing);
    }
  });
  if (!cells.length) throw new SnapshotRefreshError('GitHub response has no contribution calendar');
  const cellIds = new Set();
  const contributions = cells.map((cell) => {
    if (!cell.id || cellIds.has(cell.id)) throw new SnapshotRefreshError('Missing or duplicate GitHub contribution cell ID');
    cellIds.add(cell.id);
    const texts = tooltips.get(cell.id);
    if (texts?.length !== 1) throw new SnapshotRefreshError('Missing or duplicate GitHub contribution tooltip');
    if (!/^[0-4]$/.test(cell['data-level'] || '')) throw new SnapshotRefreshError('Invalid GitHub contribution level');
    return {
      date: cell['data-date'],
      count: tooltipCount(texts[0]),
      level: Number(cell['data-level']),
    };
  });
  contributions.sort((left, right) => (left.date || '').localeCompare(right.date || ''));
  return validateGithubSnapshot({
    schemaVersion: 1,
    username,
    source,
    fetchedAt,
    rangeStart: contributions[0].date,
    rangeEnd: contributions.at(-1).date,
    contributions,
  }, username);
}

async function readSnapshot(outputPath, username) {
  try {
    return validateGithubSnapshot(JSON.parse(await readFile(outputPath, 'utf8')), username);
  } catch {
    return undefined;
  }
}

async function fetchHtml(source, fetchImpl, timeoutMs) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new SnapshotRefreshError('GitHub contribution fetch timed out'));
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      (async () => {
        const response = await fetchImpl(source, {
          redirect: 'error',
          signal: controller.signal,
          headers: { Accept: 'text/html', 'Accept-Language': 'en-US,en;q=0.9' },
        });
        if (!response.ok) throw new SnapshotRefreshError(`GitHub contribution fetch returned HTTP ${response.status}`);
        if (response.url && response.url !== source) throw new SnapshotRefreshError('Unexpected GitHub contribution response URL');
        if (!response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
          throw new SnapshotRefreshError('GitHub contribution response is not HTML');
        }
        return response.text();
      })(),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function commitSnapshot(outputPath, username, snapshot) {
  // Serialize same-process writers and re-read immediately before replacement;
  // an older in-flight refresh must not overwrite a newer committed snapshot.
  const previous = pendingCommits.get(outputPath) || Promise.resolve();
  const commit = previous.catch(() => {}).then(async () => {
    const current = await readSnapshot(outputPath, username);
    if (current && (snapshot.rangeEnd < current.rangeEnd
      || (snapshot.rangeEnd === current.rangeEnd && Date.parse(snapshot.fetchedAt) < Date.parse(current.fetchedAt)))) {
      throw new SnapshotRefreshError('GitHub contribution refresh would replace a newer snapshot');
    }
    await mkdir(path.dirname(outputPath), { recursive: true });
    const temporary = `${outputPath}.${process.pid}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
      await rename(temporary, outputPath);
    } finally {
      await unlink(temporary).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  });
  pendingCommits.set(outputPath, commit);
  try {
    await commit;
  } finally {
    if (pendingCommits.get(outputPath) === commit) pendingCommits.delete(outputPath);
  }
}

/** Refresh the public artifact, retaining the last valid file on any failure. */
export async function refreshGithubSnapshot({
  username = DEFAULT_USERNAME,
  outputPath = DEFAULT_OUTPUT,
  fetchImpl = globalThis.fetch,
  now = () => new Date(),
  timeoutMs = 10_000,
  warn = console.warn,
} = {}) {
  const source = sourceFor(username);
  outputPath = path.resolve(outputPath);
  try {
    const html = await fetchHtml(source, fetchImpl, timeoutMs);
    const fetchedAt = new Date(now()).toISOString();
    const snapshot = parseGithubContributions(html, { username, fetchedAt });
    await commitSnapshot(outputPath, username, snapshot);
    return { snapshot, updated: true };
  } catch (error) {
    const snapshot = await readSnapshot(outputPath, username);
    const reason = error instanceof SnapshotRefreshError ? error.message : 'Request or snapshot validation failed';
    if (!snapshot) {
      throw new Error(`Unable to refresh GitHub contributions: ${reason}; no valid cached snapshot is available.`, { cause: error });
    }
    const warning = `Unable to refresh GitHub contributions: ${reason}; retaining cached snapshot through ${snapshot.rangeEnd}.`;
    warn(warning);
    return { snapshot, updated: false, warning };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { snapshot, updated } = await refreshGithubSnapshot();
    console.log(`${updated ? 'Updated' : 'Retained'} GitHub contributions for ${snapshot.username}: ${snapshot.rangeStart} through ${snapshot.rangeEnd}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

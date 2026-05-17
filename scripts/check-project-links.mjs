import fs from 'node:fs/promises';

const PROJECTS_FILE = new URL('../src/data/projects.ts', import.meta.url);
const REQUEST_TIMEOUT_MS = 15_000;
const WARNING_STATUSES = new Set([401, 403]);

function loadProjectCategories(source) {
  const executableSource = source
    .replace(/export interface\s+\w+\s*\{[\s\S]*?\n\}/g, '')
    .replace(/export type\s+\w+\s*=[\s\S]*?;\n/g, '')
    .replace(
      /export const projectCategories:\s*ProjectCategory\[\]\s*=/,
      'const projectCategories ='
    );

  return Function(`${executableSource}; return projectCategories;`)();
}

function collectLinks(projectCategories) {
  const links = [];

  for (const category of projectCategories) {
    for (const item of category.items) {
      for (const field of ['github', 'website']) {
        const url = item[field];
        if (typeof url !== 'string' || url.trim() === '') continue;

        links.push({
          category: category.title,
          field,
          title: item.title,
          url: url.trim(),
        });
      }
    }
  }

  return links;
}

async function request(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'shan-verse-link-check',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkLink(link) {
  try {
    let response = await request(link.url, 'HEAD');

    if (response.status === 405 || response.status >= 400) {
      response = await request(link.url, 'GET');
    }

    return {
      ...link,
      ok: response.status >= 200 && response.status < 400,
      warning: WARNING_STATUSES.has(response.status),
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url,
    };
  } catch (error) {
    return {
      ...link,
      ok: false,
      warning: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function formatResult(result) {
  const status = result.error
    ? result.error
    : `${result.status} ${result.statusText}`.trim();
  return `${result.title} [${result.field}] ${result.url} -> ${status}`;
}

const source = await fs.readFile(PROJECTS_FILE, 'utf8');
const projectCategories = loadProjectCategories(source);
const links = collectLinks(projectCategories);
const results = [];

for (const link of links) {
  results.push(await checkLink(link));
}

const failures = results.filter((result) => !result.ok && !result.warning);
const warnings = results.filter((result) => result.warning);

for (const result of results) {
  if (result.ok) {
    console.log(`ok: ${formatResult(result)}`);
  } else if (result.warning) {
    console.warn(`warn: ${formatResult(result)}`);
  } else {
    console.error(`fail: ${formatResult(result)}`);
  }
}

console.log(
  `Checked ${results.length} project links: ${results.length - failures.length - warnings.length} ok, ${warnings.length} warnings, ${failures.length} failures.`
);

if (failures.length > 0) {
  process.exitCode = 1;
}

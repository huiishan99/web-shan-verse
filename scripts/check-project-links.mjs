import fs from 'node:fs/promises';

const PROJECTS_FILE = new URL('../src/data/projects.ts', import.meta.url);
const REQUEST_TIMEOUT_MS = 15_000;
const GET_REQUEST_ATTEMPTS = 2;
const RETRY_DELAY_MS = 500;
const WARNING_STATUSES = new Set([401, 403]);

function loadProjectCategories(source) {
  const executableSource = source
    .replace(/export interface\s+\w+\s*\{[\s\S]*?\n\}/g, '')
    .replace(/(?:export\s+)?type\s+\w+\s*=\s*string\s*\|\s*\{[\s\S]*?\};\n/g, '')
    .replace(/(?:export\s+)?type\s+\w+\s*=[\s\S]*?;\n/g, '')
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
      for (const field of ['github', 'paper', 'caseStudy', 'website']) {
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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isTransientRequestError(error) {
  if (!(error instanceof Error)) return false;

  const cause = error.cause instanceof Error ? error.cause : undefined;
  const code = error.code || error.cause?.code || '';
  const message = `${error.name} ${error.message} ${cause?.message ?? ''}`.toLowerCase();

  return (
    error.name === 'AbortError' ||
    error.name === 'TimeoutError' ||
    [
      'ECONNRESET',
      'EAI_AGAIN',
      'ETIMEDOUT',
      'UND_ERR_ABORTED',
      'UND_ERR_BODY_TIMEOUT',
      'UND_ERR_CONNECT_TIMEOUT',
      'UND_ERR_HEADERS_TIMEOUT',
      'UND_ERR_SOCKET',
    ].includes(code) ||
    message.includes('aborted') ||
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('socket') ||
    message.includes('terminated') ||
    message.includes('timed out')
  );
}

async function requestOnce(url, method) {
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

async function request(url, method, attempts = 1) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await requestOnce(url, method);
    } catch (error) {
      lastError = error;

      if (!isTransientRequestError(error) || attempt === attempts) {
        throw error;
      }

      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError;
}

async function checkLink(link) {
  try {
    let response;

    try {
      response = await request(link.url, 'HEAD');
    } catch (error) {
      if (!isTransientRequestError(error)) {
        throw error;
      }

      response = await request(link.url, 'GET', GET_REQUEST_ATTEMPTS);
    }

    if (response.status === 405 || response.status >= 400) {
      response = await request(link.url, 'GET', GET_REQUEST_ATTEMPTS);
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

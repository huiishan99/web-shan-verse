import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const SITE_ORIGIN = 'https://shan-verse.com';
const SUPPORTED_LANGUAGES = new Set(['en', 'zh', 'ja']);
const EXPECTED_ALTERNATE_LANGUAGES = ['en', 'zh', 'ja', 'x-default'];

function walkHtmlFiles(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function routeForFile(file) {
  const relativePath = path.relative(DIST_DIR, file).replaceAll('\\', '/');
  const route = relativePath.replace(/(?:index)?\.html$/, '').replace(/\/$/, '');
  return route ? `/${route}` : '/';
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match?.[1] ?? match?.[2];
}

function getInternalPath(reference, route) {
  if (!reference || reference.startsWith('#')) return null;

  let url;
  try {
    const basePath = route === '/' ? '/' : `${route}/`;
    url = new URL(reference, new URL(basePath, SITE_ORIGIN));
  } catch {
    throw new Error(`malformed URL ${reference}`);
  }

  if (url.origin !== SITE_ORIGIN || url.pathname.startsWith('/api/')) return null;
  return decodeURIComponent(url.pathname);
}

function resolveInternalReference(reference, route) {
  const pathname = getInternalPath(reference, route);
  if (!pathname) return null;
  if (pathname === '/') return path.join(DIST_DIR, 'index.html');

  const relativePath = pathname.replace(/^\/+/, '');
  const directTarget = path.join(DIST_DIR, relativePath);
  if (path.extname(relativePath)) return directTarget;
  return path.join(directTarget, 'index.html');
}

function findDuplicateIds(html) {
  const ids = [...html.matchAll(/\sid=(?:"([^"]+)"|'([^']+)')/gi)]
    .map((match) => match[1] || match[2]);
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

if (!fs.existsSync(DIST_DIR)) {
  console.error('Generated HTML check requires dist/. Run npm run build first.');
  process.exitCode = 1;
} else {
  const files = walkHtmlFiles(DIST_DIR);
  const failures = [];

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const route = routeForFile(file);
    const expectedLanguage = route === '/zh' || route.startsWith('/zh/') ? 'zh'
      : route === '/ja' || route.startsWith('/ja/') ? 'ja'
        : 'en';
    const mainCount = (html.match(/<main(?:\s|>)/gi) || []).length;
    const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
    const titleMatches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
    const htmlLanguage = html.match(/<html\b[^>]*\slang=(?:"([^"]*)"|'([^']*)')/i);
    const images = html.match(/<img\b[^>]*>/gi) || [];
    const imagesMissingAlt = images.filter(
      (tag) => !/\salt=(?:"[^"]*"|'[^']*')/i.test(tag)
    ).length;
    const duplicateIds = findDuplicateIds(html);
    const linkTags = html.match(/<link\b[^>]*>/gi) || [];
    const canonicalTags = linkTags.filter((tag) => {
      const rel = getAttribute(tag, 'rel')?.split(/\s+/) ?? [];
      return rel.includes('canonical');
    });
    const alternateLanguages = linkTags
      .filter((tag) => {
        const rel = getAttribute(tag, 'rel')?.split(/\s+/) ?? [];
        return rel.includes('alternate') && getAttribute(tag, 'hreflang');
      })
      .map((tag) => getAttribute(tag, 'hreflang'));

    if (mainCount !== 1) failures.push(`${route}: expected 1 <main>, found ${mainCount}`);
    if (h1Count !== 1) failures.push(`${route}: expected 1 <h1>, found ${h1Count}`);
    if (titleMatches.length !== 1 || !titleMatches[0]?.[1].trim()) {
      failures.push(`${route}: expected one non-empty <title>`);
    }
    const language = htmlLanguage?.[1] || htmlLanguage?.[2];
    if (!language || !SUPPORTED_LANGUAGES.has(language)) {
      failures.push(`${route}: missing or unsupported html lang`);
    } else if (language !== expectedLanguage) {
      failures.push(`${route}: expected html lang="${expectedLanguage}", found "${language}"`);
    }
    if (imagesMissingAlt > 0) {
      failures.push(`${route}: ${imagesMissingAlt} image(s) are missing alt text`);
    }
    if (duplicateIds.length > 0) {
      failures.push(`${route}: duplicate id(s): ${duplicateIds.join(', ')}`);
    }
    if (canonicalTags.length !== 1) {
      failures.push(`${route}: expected 1 canonical link, found ${canonicalTags.length}`);
    } else {
      const canonicalHref = getAttribute(canonicalTags[0], 'href');
      const expectedPath = route === '/' ? '/' : `${route}/`;
      try {
        const canonicalUrl = new URL(canonicalHref);
        if (canonicalUrl.origin !== SITE_ORIGIN || canonicalUrl.pathname !== expectedPath) {
          failures.push(`${route}: canonical URL does not match the generated route`);
        }
      } catch {
        failures.push(`${route}: malformed canonical URL ${canonicalHref ?? ''}`);
      }
    }
    if (
      alternateLanguages.length !== EXPECTED_ALTERNATE_LANGUAGES.length
      || EXPECTED_ALTERNATE_LANGUAGES.some((languageCode) => !alternateLanguages.includes(languageCode))
    ) {
      failures.push(`${route}: expected alternate links for ${EXPECTED_ALTERNATE_LANGUAGES.join(', ')}`);
    }

    const referenceMarkup = html.replace(
      /(<script\b[^>]*>)[\s\S]*?<\/script>/gi,
      '$1</script>'
    );
    const internalReferences = [
      ...referenceMarkup.matchAll(/\s(?:href|src|poster)=(?:"([^"]*)"|'([^']*)')/gi),
    ]
      .map((match) => match[1] || match[2]);

    for (const reference of internalReferences) {
      let target;
      try {
        target = resolveInternalReference(reference, route);
      } catch (error) {
        failures.push(`${route}: ${error.message}`);
        continue;
      }

      if (target && !fs.existsSync(target)) {
        failures.push(`${route}: internal reference does not resolve: ${reference}`);
      }
    }
  }

  if (failures.length > 0) {
    failures.forEach((failure) => console.error(`fail: ${failure}`));
    console.error(`Generated HTML check failed with ${failures.length} issue(s).`);
    process.exitCode = 1;
  } else {
    console.log(
      `Checked ${files.length} generated pages: metadata, landmarks, image alt text, IDs, and internal references are valid.`
    );
  }
}

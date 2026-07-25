import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');

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

function resolveInternalHref(href) {
  const cleanHref = decodeURIComponent(href.split('#')[0].split('?')[0]);
  if (cleanHref === '/') return path.join(DIST_DIR, 'index.html');

  const relativePath = cleanHref.replace(/^\/+/, '');
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
    const mainCount = (html.match(/<main(?:\s|>)/gi) || []).length;
    const h1Count = (html.match(/<h1(?:\s|>)/gi) || []).length;
    const images = html.match(/<img\b[^>]*>/gi) || [];
    const imagesMissingAlt = images.filter(
      (tag) => !/\salt=(?:"[^"]*"|'[^']*')/i.test(tag)
    ).length;
    const duplicateIds = findDuplicateIds(html);

    if (mainCount !== 1) failures.push(`${route}: expected 1 <main>, found ${mainCount}`);
    if (h1Count !== 1) failures.push(`${route}: expected 1 <h1>, found ${h1Count}`);
    if (imagesMissingAlt > 0) {
      failures.push(`${route}: ${imagesMissingAlt} image(s) are missing alt text`);
    }
    if (duplicateIds.length > 0) {
      failures.push(`${route}: duplicate id(s): ${duplicateIds.join(', ')}`);
    }

    const internalHrefs = [
      ...html.matchAll(/<a\b[^>]*\shref=(?:"([^"]*)"|'([^']*)')[^>]*>/gi),
    ]
      .map((match) => match[1] || match[2])
      .filter((href) => href.startsWith('/') && !href.startsWith('//'));

    for (const href of internalHrefs) {
      let target;
      try {
        target = resolveInternalHref(href);
      } catch {
        failures.push(`${route}: malformed internal URL ${href}`);
        continue;
      }

      if (!fs.existsSync(target)) {
        failures.push(`${route}: internal URL does not resolve: ${href}`);
      }
    }
  }

  if (failures.length > 0) {
    failures.forEach((failure) => console.error(`fail: ${failure}`));
    console.error(`Generated HTML check failed with ${failures.length} issue(s).`);
    process.exitCode = 1;
  } else {
    console.log(
      `Checked ${files.length} generated pages: landmarks, headings, image alt text, IDs, and internal links are valid.`
    );
  }
}

import { expect, test, type Page } from '@playwright/test';

type IndexEntry = { type: string; title: string; url: string; tags?: string[] };
type IndexPayload = { locales: Record<string, IndexEntry[]> };
const locales = [
  { lang: 'en', prefix: '' },
  { lang: 'zh', prefix: '/zh' },
  { lang: 'ja', prefix: '/ja' },
];
const isStandaloneTimeline = (path: string) => /^\/(?:zh\/|ja\/)?timeline\/?$/.test(new URL(path, 'https://shan-verse.com').pathname);

async function mockRuntimeServices(page: Page) {
  await page.route('https://**/*', async (route) => route.fulfill({
    contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'text/plain',
    body: '',
  }));
  await page.route('**/api/site-stats', async (route) => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ views: 128, visitors: 64, online: 3 }),
  }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

test('the real CLI index omits standalone Timeline while retaining posts and projects in every locale', async ({ request }) => {
  const response = await request.get('/cli-index.json');
  expect(response.status()).toBe(200);
  const payload = await response.json() as IndexPayload;
  for (const { lang } of locales) {
    const entries = payload.locales[lang];
    expect(entries.some((entry) => entry.type === 'post')).toBe(true);
    expect(entries.some((entry) => entry.type === 'project')).toBe(true);
    expect(entries.every((entry) => ['post', 'project'].includes(entry.type))).toBe(true);
    expect(entries.some((entry) => isStandaloneTimeline(entry.url))).toBe(false);
  }
});

for (const { lang, prefix } of locales) {
  test(`${lang} old Timeline remains available without promoting it in normal navigation or CLI help`, async ({ page }) => {
    await mockRuntimeServices(page);
    const response = await page.goto(`${prefix}/timeline/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveCount(1);
    const directives = (await robots.getAttribute('content'))!.toLowerCase().split(/[\s,]+/);
    expect(directives).toContain('noindex');
    expect(directives).toContain('follow');
    expect(directives).not.toContain('nofollow');

    // A normal SPA destination must not inherit the legacy page's robots tag.
    await page.locator('[data-site-explore-toggle]').click();
    await page.locator('[data-site-area="beyond-code"]').click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/beyond-code/$`));
    await expect(page.locator('[data-beyond]')).toHaveClass(/is-ready/);
    const normalDirectives = await page.locator('meta[name="robots"]').evaluateAll((tags) =>
      tags.map((tag) => tag.getAttribute('content') || '').join(','),
    );
    expect(normalDirectives.toLowerCase()).not.toMatch(/\b(?:noindex|nofollow)\b/);
    const publicLinks = await page.locator('.site-header a').evaluateAll((links) => links.map((link) => link.getAttribute('href') || ''));
    expect(publicLinks.some(isStandaloneTimeline)).toBe(false);
    await expect(page.locator('[data-site-area="timeline"]')).toHaveCount(0);
    await expect(page.locator('[data-timeline-path]')).toHaveCount(0);

    await page.locator('[data-cli-trigger]').click();
    const input = page.locator('[data-cli-input]');
    await expect(page.locator('[data-cli-overlay]')).toHaveAttribute('aria-hidden', 'false');
    await input.fill('help');
    await input.press('Enter');
    await expect(page.locator('[data-cli-output] .cli-help-heading').first()).toBeVisible();
    await expect(page.locator('[data-cli-output]')).not.toContainText(/timeline|时间线|タイムライン/i);
  });
}

test('the generated sitemap excludes all standalone Timeline routes and retains each Atlas route', async ({ request }) => {
  const indexResponse = await request.get('/sitemap-index.xml');
  expect(indexResponse.status()).toBe(200);
  const locations = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const sitemapUrls = locations(await indexResponse.text());
  expect(sitemapUrls.length).toBeGreaterThan(0);
  const pageUrls: string[] = [];
  for (const sitemapUrl of sitemapUrls) {
    // The generated XML names the production host; inspect this build's files.
    const url = new URL(sitemapUrl);
    const response = await request.get(`${url.pathname}${url.search}`);
    expect(response.status()).toBe(200);
    pageUrls.push(...locations(await response.text()));
  }
  expect(pageUrls.some(isStandaloneTimeline)).toBe(false);
  const paths = pageUrls.map((url) => new URL(url).pathname);
  for (const { prefix } of locales) expect(paths).toContain(`${prefix}/journey/`);
});

for (const { lang, prefix } of locales) {
  test(`${lang} home activity opens the existing Atlas timeline panel while its mode buttons remain usable`, async ({ page }) => {
    await mockRuntimeServices(page);
    await page.goto(prefix ? `${prefix}/` : '/');
    const activity = page.locator('.activity-log a:has(.activity-type--activity)');
    const milestones = page.locator('.activity-log a:has(.activity-type--milestone)');
    expect(await activity.count()).toBeGreaterThan(0);
    expect(await milestones.count()).toBeGreaterThan(0);
    const expectedHref = `${prefix}/journey/?view=timeline`;
    for (const link of [...await activity.all(), ...await milestones.all()]) await expect(link).toHaveAttribute('href', expectedHref);

    await milestones.first().click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/journey/\\?view=timeline$`));
    expect(new URL(page.url()).pathname).toBe(`${prefix}/journey/`);
    expect(new URL(page.url()).searchParams.get('view')).toBe('timeline');
    const shell = page.locator('[data-earth-scene]');
    const panel = shell.locator('[data-timeline-panel]');
    const atlasButton = shell.locator('[data-journey-mode="atlas"]');
    const timelineButton = shell.locator('[data-journey-mode="timeline"]');
    await expect(shell).toHaveClass(/is-timeline-open/);
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await expect(timelineButton).toHaveAttribute('aria-pressed', 'true');
    expect(await panel.locator('.atlas-year').count()).toBeGreaterThan(0);

    await atlasButton.click();
    await expect(panel).toHaveAttribute('aria-hidden', 'true');
    await expect(shell).not.toHaveClass(/is-timeline-open/);
    await expect(atlasButton).toHaveAttribute('aria-pressed', 'true');
    await expect(timelineButton).toHaveAttribute('aria-pressed', 'false');
    await timelineButton.click();
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await expect(timelineButton).toHaveAttribute('aria-pressed', 'true');
  });
}

test('a stale CLI payload cannot reintroduce Timeline results or remove valid posts and projects', async ({ page, request }) => {
  await mockRuntimeServices(page);
  const response = await request.get('/cli-index.json');
  const payload = await response.json() as IndexPayload;
  const post = payload.locales.en.find((entry) => entry.type === 'post')!;
  const project = payload.locales.en.find((entry) => entry.type === 'project')!;
  expect(post).toBeDefined();
  expect(project).toBeDefined();
  const keyword = 'cached-visibility-probe-7fd3';
  const cachedPayload = {
    locales: { en: [
      { ...post, tags: [keyword] },
      { ...project, tags: [keyword] },
      { type: 'timeline', title: 'Retained legacy Timeline record', url: '/timeline/#year-2026', tags: [keyword] },
      { type: 'unknown', title: 'Unknown stale record', url: '/timeline/', tags: [keyword] },
    ] },
  };
  await page.route('**/cli-index.json', async (route) => route.fulfill({
    contentType: 'application/json', body: JSON.stringify(cachedPayload),
  }));
  await page.goto('/');
  await page.locator('[data-cli-trigger]').click();
  const input = page.locator('[data-cli-input]');
  await input.fill(`search ${keyword}`);
  await input.press('Enter');
  const results = page.locator('[data-cli-output] .cli-result-link');
  await expect(results).toHaveCount(2);
  const resultUrls = await results.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(resultUrls.sort()).toEqual([post.url, project.url].sort());
  expect(resultUrls.some((url) => isStandaloneTimeline(url!))).toBe(false);
});

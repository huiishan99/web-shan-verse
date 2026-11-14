import { expect, test, type Page } from '@playwright/test';

async function mockRuntimeServices(page: Page) {
  await page.route('https://**/*', async (route) => {
    await route.fulfill({
      contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'text/plain',
      body: '',
    });
  });
  await page.route('**/api/site-stats', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ views: 128, visitors: 64, online: 3 }),
    });
  });
}

test('late first page-load preserves an interactive scene and SPA reentry initializes a fresh one', async ({ page }) => {
  await mockRuntimeServices(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const state = window as typeof window & { __lifecyclePageLoads?: number };
    state.__lifecyclePageLoads = 0;
    document.addEventListener('astro:page-load', () => state.__lifecyclePageLoads!++);
  });
  const pageLoads = () => page.evaluate(() => (
    window as typeof window & { __lifecyclePageLoads?: number }
  ).__lifecyclePageLoads);

  let releaseCovers!: () => void;
  const gate = new Promise<void>((resolve) => { releaseCovers = resolve; });
  let heldRequests = 0;
  await page.route('**/images/beyond-code/**', async (route) => {
    heldRequests++;
    await gate;
    await route.continue();
  });

  try {
    // A slow cover must not postpone useful interaction or cause it to be reset
    // when the browser finally emits load / Astro's initial page-load event.
    await page.goto('/beyond-code/', { waitUntil: 'domcontentloaded' });
    const root = page.locator('[data-beyond]');
    const search = root.locator('[data-beyond-search]');
    const games = root.locator('[data-beyond-category="games"]');
    const motion = root.locator('[data-beyond-motion]');
    const series = root.locator('[data-node="games-assassins-creed-series"]');
    await expect(root).toHaveClass(/is-ready/);
    await expect.poll(() => heldRequests).toBeGreaterThan(0);
    expect(await pageLoads()).toBe(0);
    expect(await page.evaluate(() => document.readyState)).toBe('interactive');

    await games.click();
    await motion.click();
    await search.fill('Assassin');
    // Keyboard activation avoids turning this lifecycle test into a moving-target
    // pointer test while the camera eases toward the search results.
    await series.press('Enter');
    await expect(root.locator('[data-beyond-detail]')).toBeVisible();
    await expect(root.locator('[data-detail-title]')).toHaveText("Assassin's Creed series");
    await expect(games).toHaveAttribute('aria-pressed', 'true');
    await expect(motion).toHaveAttribute('aria-pressed', 'false');
    expect(await pageLoads()).toBe(0);

    releaseCovers();
    await page.waitForLoadState('load');
    await expect.poll(pageLoads).toBe(1);
    await expect(games).toHaveAttribute('aria-pressed', 'true');
    await expect(search).toHaveValue('Assassin');
    await expect(motion).toHaveAttribute('aria-pressed', 'false');
    await expect(series).toHaveAttribute('aria-pressed', 'true');
    await expect(root.locator('[data-beyond-detail]')).toBeVisible();
    await expect(root.locator('[data-detail-title]')).toHaveText("Assassin's Creed series");

    await page.locator('.nav-links').getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.locator('[data-beyond]')).toHaveCount(0);
    await expect.poll(pageLoads).toBe(2);
    await page.getByRole('link', { name: 'Explore my favorites', exact: true }).click();
    await expect(page).toHaveURL(/\/beyond-code\/$/);
    await expect.poll(pageLoads).toBe(3); // Same document: this was an Astro SPA round trip.
    await expect(root).toHaveClass(/is-ready/);
    await expect(root.locator('[data-beyond-category="all"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(search).toHaveValue('');
    await expect(motion).toHaveAttribute('aria-pressed', 'true');
    await expect(root.locator('[data-beyond-detail]')).toBeHidden();
    await expect(root.locator('[data-node][aria-pressed="true"]')).toHaveCount(0);
  } finally {
    // Also unblock requests when an assertion fails, so teardown cannot hang.
    releaseCovers();
  }
});

test('the constellation downloads thumbnails until a selected detail needs its original cover', async ({ page }) => {
  await mockRuntimeServices(page);
  const originalRequests: string[] = [];
  const thumbnailRequests: string[] = [];
  await page.route('**/images/beyond-code/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.includes('/thumbnails/')) thumbnailRequests.push(path);
    else originalRequests.push(path);
    await route.continue();
  });

  await page.goto('/beyond-code/', { waitUntil: 'load' });
  const root = page.locator('[data-beyond]');
  const graphImages = root.locator('[data-beyond-graph] [data-node] img');
  await expect(root).toHaveClass(/is-ready/);
  await expect(graphImages).toHaveCount(106);
  expect(await graphImages.evaluateAll((images) => images.every((image) => (
    image.getAttribute('src')?.startsWith('/images/beyond-code/thumbnails/')
  )))).toBe(true);
  await expect.poll(() => graphImages.evaluateAll((images) => images.every((image) => (
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
  )))).toBe(true);
  await expect(root.locator('[data-beyond-index]')).toBeHidden();
  expect(thumbnailRequests.length).toBeGreaterThan(0);
  expect(originalRequests).toEqual([]);

  const data = JSON.parse(await root.locator('[data-beyond-data]').textContent() || '{}') as {
    nodes: { id: string; artwork: string }[];
  };
  const series = data.nodes.find((node) => node.id === 'games-assassins-creed-series');
  expect(series).toBeDefined();
  expect(series!.artwork).not.toContain('/thumbnails/');
  await root.locator('[data-node="games-assassins-creed-series"]').press('Enter');
  const detailImage = root.locator('[data-detail-image] img');
  await expect(root.locator('[data-beyond-detail]')).toBeVisible();
  await expect(detailImage).toHaveAttribute('src', series!.artwork);
  await expect.poll(() => detailImage.evaluate((image) => (
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
  ))).toBe(true);
  const relatedImages = root.locator('[data-related-node] img');
  await expect(relatedImages).toHaveCount(3);
  expect(await relatedImages.evaluateAll((images) => images.every((image) => (
    image.getAttribute('src')?.startsWith('/images/beyond-code/thumbnails/')
  )))).toBe(true);
  // Hidden Index covers and the three related-item icons must not compete with
  // the one full-size image that the selected introduction actually displays.
  expect(originalRequests).toEqual([series!.artwork]);
});

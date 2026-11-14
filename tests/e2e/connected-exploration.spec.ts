import { expect, test, type Page } from '@playwright/test';

type CollectionNode = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  searchText: string;
  isContext: boolean;
};

async function mockRuntimeServices(page: Page) {
  await page.route('https://**/*', async (route) => route.fulfill({
    contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'text/plain',
    body: '',
  }));
  await page.route('**/api/site-stats', async (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ views: 128, visitors: 64, online: 3 }),
  }));
}

async function openCollection(page: Page, path = '/beyond-code/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-beyond]');
  await expect(root).toHaveClass(/is-ready/);
  return root;
}

async function selectedId(page: Page) {
  const selected = page.locator('[data-beyond] [data-node][aria-pressed="true"]');
  await expect(selected).toHaveCount(1);
  return (await selected.getAttribute('data-node'))!;
}

test.beforeEach(async ({ page }) => {
  await mockRuntimeServices(page);
  // State/navigation assertions use stable targets. Native moving-scene gestures
  // and the subjective appearance of movement are separately verified by hand.
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('a fresh overview has no local Back or empty breadcrumb, while selection remains undoable', async ({ page }) => {
  const root = await openCollection(page);
  const back = root.locator('[data-beyond-back]');
  const breadcrumb = root.locator('.beyond-breadcrumb');
  await expect(back).toBeHidden();
  await expect(breadcrumb).toBeHidden();
  await expect(root.locator('[data-beyond-category="all"]')).toHaveAttribute('aria-pressed', 'true');

  await root.locator('[data-node="games-stardew-valley"]').press('Enter');
  await expect(root.locator('[data-beyond-detail]')).toBeVisible();
  await expect(back).toBeVisible();
  await expect(back).toBeEnabled();
  await back.click();
  await expect(root.locator('[data-beyond-detail]')).toBeHidden();
  await expect(root.locator('[data-node][aria-pressed="true"]')).toHaveCount(0);
  await expect(back).toBeHidden();
  await expect(breadcrumb).toBeHidden();
});

test('non-All category, Index and coalesced search retain their local Back chain', async ({ page }) => {
  const root = await openCollection(page);
  const back = root.locator('[data-beyond-back]');
  const search = root.locator('[data-beyond-search]');
  const games = root.locator('[data-beyond-category="games"]');
  const index = root.locator('[data-beyond-index]');
  const detail = root.locator('[data-beyond-detail]');

  await games.click();
  await expect(back).toBeVisible();
  await root.locator('[data-beyond-view="index"]').click();
  await expect(index).toBeVisible();
  await expect(back).toBeVisible();
  await search.fill('Assa');
  await search.fill('Assassin');
  await expect(back).toBeVisible();
  await root.locator('[data-index-node="games-assassins-creed-series"]').press('Enter');
  await expect(detail).toBeVisible();
  await expect(index).toBeHidden();
  await expect(root.locator('[data-detail-title]')).toHaveText("Assassin's Creed series");

  await expect(back).toBeVisible();
  await expect(search).toHaveValue('Assassin');
  await expect(games).toHaveAttribute('aria-pressed', 'true');

  await back.click();
  await expect(detail).toBeHidden();
  await expect(index).toBeVisible();
  await expect(search).toHaveValue('Assassin');
  await expect(back).toBeVisible();
  await back.click();
  await expect(index).toBeVisible();
  await expect(search).toHaveValue('');
  await expect(back).toBeVisible();
  await back.click();
  await expect(index).toBeHidden();
  await expect(games).toHaveAttribute('aria-pressed', 'true');
  await expect(back).toBeVisible();
  await back.click();
  await expect(root.locator('[data-beyond-category="all"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(back).toBeHidden();
});

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
test(`All overview hides Back after category return, search, Index and Reset despite retained history at ${viewport.width}px`, async ({ page }) => {
  await page.setViewportSize(viewport);
  expect(page.viewportSize()).toEqual(viewport);
  const root = await openCollection(page);
  expect(await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))).toEqual(viewport);
  const back = root.locator('[data-beyond-back]');
  const breadcrumb = root.locator('.beyond-breadcrumb');
  const search = root.locator('[data-beyond-search]');
  const all = root.locator('[data-beyond-category="all"]');
  const games = root.locator('[data-beyond-category="games"]');

  await games.click();
  await expect(back).toBeVisible();
  await all.click();
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(back).toBeHidden();
  await expect(breadcrumb).toBeHidden();

  await search.fill('Stardew');
  await expect(back).toBeHidden();
  await root.locator('[data-beyond-view="index"]').click();
  await expect(root.locator('[data-beyond-index]')).toBeVisible();
  await expect(back).toBeHidden();
  await expect(breadcrumb).toBeHidden();
  await root.locator('[data-beyond-view="graph"]').click();
  await expect(back).toBeHidden();

  await games.click();
  await expect(back).toBeVisible();
  await root.locator('[data-node="games-stardew-valley"]').press('Enter');
  await expect(root.locator('[data-beyond-detail]')).toBeVisible();
  await expect(back).toBeVisible();
  await root.locator('[data-beyond-reset]').click();
  await expect(root.locator('[data-beyond-detail]')).toBeHidden();
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(search).toHaveValue('');
  await expect(back).toBeHidden();
  await expect(breadcrumb).toBeHidden();
  await root.locator('[data-beyond-reset]').click();
  await expect(back).toBeHidden();
  await expect(breadcrumb).toBeHidden();
});

test(`All detail Close and Escape hide Back again without exposing retained return points at ${viewport.width}px`, async ({ page }) => {
  await page.setViewportSize(viewport);
  expect(page.viewportSize()).toEqual(viewport);
  const root = await openCollection(page);
  expect(await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))).toEqual(viewport);
  const back = root.locator('[data-beyond-back]');
  const breadcrumb = root.locator('.beyond-breadcrumb');
  const detail = root.locator('[data-beyond-detail]');
  const node = root.locator('[data-node="games-stardew-valley"]');

  await node.press('Enter');
  await expect(detail).toBeVisible();
  await expect(back).toBeVisible();
  await root.locator('[data-beyond-close]').click();
  await expect(detail).toBeHidden();
  await expect(back).toBeHidden();
  await expect(breadcrumb).toBeHidden();

  await node.press('Enter');
  await expect(detail).toBeVisible();
  await expect(back).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(detail).toBeHidden();
  await expect(root.locator('[data-beyond-category="all"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(back).toBeHidden();
  await expect(breadcrumb).toBeHidden();
});
}

test('discovery uses direct filtered personal matches, excludes the selected node, and supports Index history', async ({ page }) => {
  const root = await openCollection(page);
  const surprise = root.locator('[data-beyond-surprise]');
  const search = root.locator('[data-beyond-search]');
  const back = root.locator('[data-beyond-back]');
  const payload = JSON.parse((await root.locator('[data-beyond-data]').textContent())!) as { nodes: CollectionNode[] };
  const eligible = payload.nodes.filter((node) => !node.isContext && node.category === 'music'
    && `${node.title} ${node.searchText} ${node.subtitle}`.toLowerCase().includes('queen'));
  expect(eligible.length).toBeGreaterThan(1);

  await root.locator('[data-beyond-category="music"]').click();
  await search.fill('Queen');
  await root.locator('[data-beyond-view="index"]').click();
  await expect(surprise).toBeVisible();
  await surprise.click();
  await expect(root.locator('[data-beyond-index]')).toBeHidden();
  const first = await selectedId(page);
  expect(eligible.some((node) => node.id === first)).toBe(true);
  await expect(search).toHaveValue('Queen');
  await expect(root.locator('[data-beyond-category="music"]')).toHaveAttribute('aria-pressed', 'true');
  await surprise.click();
  const second = await selectedId(page);
  expect(second).not.toBe(first);
  expect(eligible.some((node) => node.id === second)).toBe(true);
  await back.click();
  expect(await selectedId(page)).toBe(first);
  await back.click();
  await expect(root.locator('[data-beyond-index]')).toBeVisible();
  await expect(search).toHaveValue('Queen');

  await search.fill('Bohemian Rhapsody');
  await surprise.click();
  expect(await selectedId(page)).toBe('music-bohemian-rhapsody');
  await expect(surprise).toBeDisabled(); // Its sole personal match is already selected.
  await search.fill('no-matching-world-7b833c');
  await expect(root.locator('[data-beyond-empty]')).toBeVisible();
  await expect(surprise).toBeDisabled();
  await expect(root.locator('[data-node][aria-pressed="true"]')).toHaveCount(0);
});

test('Explore owns its Escape without closing a selected work or adding graph history', async ({ page }) => {
  const root = await openCollection(page);
  const explore = page.locator('[data-site-explore]');
  const toggle = explore.locator('[data-site-explore-toggle]');
  const detail = root.locator('[data-beyond-detail]');
  const back = root.locator('[data-beyond-back]');

  await toggle.click();
  await expect(explore).toHaveAttribute('open', '');
  await toggle.press('Escape');
  await expect(explore).not.toHaveAttribute('open', '');
  await expect(back).toBeHidden();

  await root.locator('[data-node="games-stardew-valley"]').press('Enter');
  await expect(detail).toBeVisible();
  const title = await root.locator('[data-detail-title]').textContent();
  await toggle.click();
  await expect(explore).toHaveAttribute('open', '');
  await toggle.press('Escape');
  await expect(explore).not.toHaveAttribute('open', '');
  await expect(toggle).toBeFocused();
  await expect(detail).toBeVisible();
  await expect(root.locator('[data-detail-title]')).toHaveText(title!);

  await toggle.click();
  await root.locator('[data-detail-title]').click(); // Outside dismissal leaves scene state alone.
  await expect(explore).not.toHaveAttribute('open', '');
  await expect(detail).toBeVisible();
  await back.click();
  await expect(detail).toBeHidden();
  await expect(back).toBeHidden(); // Opening/dismissing Explore added no return point.
});

for (const locale of [
  { prefix: '', current: 'Beyond Code', discovery: 'Surprise me' },
  { prefix: '/zh', current: '代码之外', discovery: '随便看看' },
  { prefix: '/ja', current: 'コードを超えて', discovery: 'おまかせ' },
]) {
  test(`Explore links address existing locale-canonical destinations for ${locale.prefix || 'English'}`, async ({ page }) => {
    const root = await openCollection(page, `${locale.prefix}/beyond-code/`);
    const explore = page.locator('[data-site-explore]');
    await explore.locator('[data-site-explore-toggle]').click();
    const panel = explore.locator('[data-site-explore-panel]');
    await expect(panel.locator('a')).toHaveCount(2);
    const current = panel.locator('[data-site-area="beyond-code"]');
    await expect(current).toHaveAttribute('href', `${locale.prefix}/beyond-code/`);
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current).toHaveText(locale.current);
    await expect(panel.locator('[data-site-area="atlas"]')).toHaveAttribute('href', `${locale.prefix}/journey/`);
    await expect(panel.locator('[data-site-area="timeline"]')).toHaveCount(0);
    await expect(panel.locator('[data-journey-preload]')).toHaveCount(0);
    await expect(root.locator('[data-beyond-surprise]')).toHaveAccessibleName(locale.discovery);
  });
}

test('opening and browsing Explore starts no Earth texture or new script load', async ({ page }) => {
  const scripts: string[] = [];
  const earthTextures: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url());
    if (/\/images\/earth-natural-muted-\d+\.jpg(?:[?#]|$)/.test(request.url())) earthTextures.push(request.url());
  });
  const root = await openCollection(page);
  await page.waitForLoadState('networkidle');
  const initialScripts = [...scripts];
  const explore = page.locator('[data-site-explore]');
  await explore.locator('[data-site-explore-toggle]').click();
  await explore.locator('[data-site-area="atlas"]').hover();
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.waitForLoadState('networkidle');
  expect(scripts).toEqual(initialScripts);
  expect(earthTextures).toEqual([]);
  await expect(root).toHaveClass(/is-ready/);
  await expect(page.locator('[data-earth-scene]')).toHaveCount(0);
  await expect(page.locator('[data-beyond-canvas]')).toHaveCount(1);
});

test('Beyond and Atlas links mount one scene per route through an Astro round trip', async ({ page }) => {
  test.setTimeout(45_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(() => {
    const state = window as typeof window & {
      __connectedPageLoads?: number;
      __connectedPointerdownRegistrations?: number;
    };
    state.__connectedPageLoads = 0;
    state.__connectedPointerdownRegistrations = 0;
    const addDocumentListener = document.addEventListener.bind(document);
    // Count real registrations across the same-document route changes. This
    // detects a replayed inline Explore module without mocking its behavior.
    document.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      if (type === 'pointerdown') state.__connectedPointerdownRegistrations!++;
      addDocumentListener(type, listener, options);
    }) as typeof document.addEventListener;
    document.addEventListener('astro:page-load', () => state.__connectedPageLoads!++);
  });
  const loads = () => page.evaluate(() => (window as typeof window & { __connectedPageLoads?: number }).__connectedPageLoads);
  const pointerdownRegistrations = () => page.evaluate(() => (
    window as typeof window & { __connectedPointerdownRegistrations?: number }
  ).__connectedPointerdownRegistrations);
  const root = await openCollection(page);
  await page.waitForLoadState('load');
  await expect.poll(loads).toBe(1);
  expect(await pointerdownRegistrations()).toBe(1);
  await root.locator('[data-beyond-category="music"]').click();
  await root.locator('[data-node="music-bohemian-rhapsody"]').press('Enter');
  await expect(root.locator('[data-beyond-detail]')).toBeVisible();

  await page.locator('[data-site-explore-toggle]').click();
  await page.locator('[data-site-area="atlas"]').click();
  await expect(page).toHaveURL(/\/journey\/$/);
  await expect(page.locator('[data-earth-scene]')).toHaveCount(1);
  await expect(page.locator('[data-earth-scene]')).toHaveAttribute('data-earth-ready', 'true');
  await expect(page.locator('[data-earth-canvas]')).toHaveCount(1);
  await expect(page.locator('[data-beyond-canvas]')).toHaveCount(0);
  await expect.poll(loads).toBe(2);
  await page.locator('[data-site-explore-toggle]').click();
  await expect(page.locator('[data-site-area="atlas"]')).toHaveAttribute('aria-current', 'page');
  await page.locator('[data-site-area="beyond-code"]').click();
  await expect(page).toHaveURL(/\/beyond-code\/$/);
  await expect(root).toHaveClass(/is-ready/);
  await expect.poll(loads).toBe(3); // Same document: no hard-navigation counter reset.
  expect(await pointerdownRegistrations()).toBe(1);
  await expect(page.locator('[data-beyond-canvas]')).toHaveCount(1);
  await expect(page.locator('[data-earth-canvas]')).toHaveCount(0);
  await expect(root.locator('[data-node]')).toHaveCount(106);
  await expect(root.locator('[data-beyond-back]')).toBeHidden();
  await expect(root.locator('[data-beyond-detail]')).toBeHidden();
  await expect(root.locator('[data-beyond-category="all"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-site-explore]')).not.toHaveAttribute('open', '');
  expect(errors).toEqual([]);
});

async function expectSelectedArtworkInView(page: Page, id: string, compact: boolean) {
  const root = page.locator('[data-beyond]');
  const art = root.locator(`[data-node="${id}"] .beyond-node-art`);
  await expect(root.locator(`[data-node="${id}"]`)).toHaveAttribute('aria-pressed', 'true');
  // The reduced-motion fixture snaps the camera. Allow its requested paint to
  // run before measuring the actual rendered cover, not the button's hit area.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect.poll(async () => {
    const [graph, image, detail] = await Promise.all([
      root.locator('[data-beyond-graph]').boundingBox(),
      art.boundingBox(),
      root.locator('[data-beyond-detail]').boundingBox(),
    ]);
    if (!graph || !image || !detail) return null;
    return {
      insideLeft: image.x >= graph.x,
      insideRight: image.x + image.width <= graph.x + graph.width,
      insideTop: image.y >= graph.y,
      insideBottom: image.y + image.height <= graph.y + graph.height,
      clearOfIntroduction: compact
        ? image.y + image.height <= detail.y
        : image.x + image.width <= detail.x,
    };
  }, `Selected artwork ${id} must stay fully in the unobscured graph`).toEqual({
    insideLeft: true, insideRight: true, insideTop: true, insideBottom: true, clearOfIntroduction: true,
  });
}

for (const viewport of [
  { width: 1280, height: 900, compact: false },
  { width: 390, height: 844, compact: true },
]) {
  test(`a cross-category selection keeps its cover visible and related traversal works at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const root = await openCollection(page);
    await root.locator('[data-node="games-cyberpunk-2077"]').press('Enter');
    await expect(root.locator('[data-beyond-detail]')).toBeVisible();
    await expectSelectedArtworkInView(page, 'games-cyberpunk-2077', viewport.compact);

    const relatedAnime = root.locator('[data-related-node="drama-cyberpunk-edgerunners"]');
    await expect(relatedAnime).toBeVisible();
    await expect(relatedAnime).toBeEnabled();
    await relatedAnime.click();
    expect(await selectedId(page)).toBe('drama-cyberpunk-edgerunners');
    await expectSelectedArtworkInView(page, 'drama-cyberpunk-edgerunners', viewport.compact);
    await expect(root.locator('[data-related-node="games-cyberpunk-2077"]')).toBeVisible();
  });
}

for (const width of [320, 390]) {
  test(`Explore remains readable and dismissible at ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openCollection(page, '/zh/beyond-code/');
    const explore = page.locator('[data-site-explore]');
    const toggle = explore.locator('[data-site-explore-toggle]');
    await toggle.click();
    const panel = explore.locator('[data-site-explore-panel]');
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 0.5);
    for (const area of ['beyond-code', 'atlas']) await expect(panel.locator(`[data-site-area="${area}"]`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await toggle.press('Escape');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
  });
}

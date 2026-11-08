import { expect, test, type Page, type Route } from '@playwright/test';

type StatsRequest = { method: string; event?: string; path?: string };

function recordRequest(route: Route, requests: StatsRequest[]) {
  const request = route.request();
  const payload = request.method() === 'POST'
    ? request.postDataJSON() as { event?: string; path?: string; clientId?: string }
    : undefined;
  requests.push({ method: request.method(), event: payload?.event, path: payload?.path });
  return payload;
}

async function respondWithStats(route: Route, online: number) {
  await route.fulfill({
    contentType: 'application/json',
    headers: { 'Cache-Control': 'no-store' },
    body: JSON.stringify({
      ok: true,
      views: 128,
      visitors: 64,
      online,
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
  });
}

async function expectOnline(page: Page, online: string, instances = 2) {
  await expect(page.locator('[data-site-stat="online"]')).toHaveText(Array(instances).fill(online));
}

async function pauseAfterLoad(page: Page) {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 1_000);
}

async function mockExternalServices(page: Page) {
  await page.route('https://**/*', async (route) => {
    const request = route.request();
    if (new URL(request.url()).hostname === 'github-contributions-api.jogruber.de') {
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ contributions: [] }) });
      return;
    }
    await route.fulfill({
      contentType: request.resourceType() === 'stylesheet' ? 'text/css' : 'text/plain',
      body: '',
    });
  });
}

test.beforeEach(async ({ page }) => {
  // Install before page scripts use timers; pause only after the initial render.
  await page.clock.install({ time: new Date('2026-01-01T00:00:00.000Z') });
  await mockExternalServices(page);
});

test('anonymous identity survives reloads, is shared across tabs and differs between browsers', async ({ page, context, browser }) => {
  const ids: string[] = [];
  async function collectIdentity(target: Page) {
    await target.route('**/api/site-stats', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON() as { clientId?: string };
        if (payload.clientId) ids.push(payload.clientId);
      }
      await respondWithStats(route, 1);
    });
  }

  await collectIdentity(page);
  await page.goto('/');
  await expectOnline(page, '1');
  expect(ids[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  const firstId = ids[0];

  await page.reload();
  await expectOnline(page, '1');
  expect(new Set(ids)).toEqual(new Set([firstId]));

  const secondTab = await context.newPage();
  const secondBrowser = await browser.newContext();
  try {
    await mockExternalServices(secondTab);
    await collectIdentity(secondTab);
    await secondTab.goto(new URL('/about', page.url()).href);
    await expectOnline(secondTab, '1', 1);
    expect(new Set(ids)).toEqual(new Set([firstId]));

    const otherPage = await secondBrowser.newPage();
    await mockExternalServices(otherPage);
    await collectIdentity(otherPage);
    await otherPage.goto(new URL('/', page.url()).href);
    await expectOnline(otherPage, '1');
    expect(new Set(ids).size).toBe(2);
  } finally {
    await secondTab.close();
    await secondBrowser.close();
  }
});

test('online refreshes from 1 to 2 to 3 through reads without extra pageviews or heartbeats', async ({ page }) => {
  let online = 1;
  const requests: StatsRequest[] = [];
  await page.route('**/api/site-stats', async (route) => {
    recordRequest(route, requests);
    await respondWithStats(route, online);
  });

  await page.goto('/');
  await expectOnline(page, '1');
  await pauseAfterLoad(page);
  const initialReads = requests.filter(({ method }) => method === 'GET').length;

  online = 2;
  await page.clock.fastForward(15_000);
  await expectOnline(page, '2');
  online = 3;
  await page.clock.fastForward(15_000);
  await expectOnline(page, '3');

  expect(requests.filter(({ method }) => method === 'GET')).toHaveLength(initialReads + 2);
  expect(requests.filter(({ method }) => method === 'POST')).toEqual([
    { method: 'POST', event: 'pageview', path: '/' },
  ]);
  await expect(page.locator('[data-site-stat="views"]')).toHaveText(['128', '128']);
});

test('a failed refresh clears stale online counts and a retry restores them', async ({ page }) => {
  let unavailable = false;
  let online = 1;
  const requests: StatsRequest[] = [];
  await page.route('**/api/site-stats', async (route) => {
    recordRequest(route, requests);
    if (unavailable) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"ok":false}' });
      return;
    }
    await respondWithStats(route, online);
  });

  await page.goto('/');
  await expectOnline(page, '1');
  await pauseAfterLoad(page);
  unavailable = true;
  await page.clock.fastForward(15_000);
  await expectOnline(page, '--');
  for (const root of await page.locator('[data-site-stats]').all()) {
    await expect(root).toHaveClass(/is-unavailable/);
  }

  unavailable = false;
  online = 2;
  await page.clock.fastForward(15_000);
  await expectOnline(page, '2');
  for (const root of await page.locator('[data-site-stats]').all()) {
    await expect(root).not.toHaveClass(/is-unavailable/);
  }
  expect(requests.filter(({ event }) => event === 'pageview')).toHaveLength(1);
});

for (const delayedStatus of [200, 503]) {
  test(`a delayed ${delayedStatus} read cannot replace a newer navigation result`, async ({ page }) => {
    const requests: StatsRequest[] = [];
    let heldRead: Route | undefined;
    let released = false;
    await page.route('**/api/site-stats', async (route) => {
      const payload = recordRequest(route, requests);
      if (route.request().method() === 'GET' && !heldRead) {
        heldRead = route;
        return;
      }
      await respondWithStats(route, payload?.path === '/about' ? 3 : 1);
    });

    try {
      await page.goto('/');
      await expectOnline(page, '1');
      await pauseAfterLoad(page);
      await page.clock.fastForward(15_000);
      await expect.poll(() => Boolean(heldRead)).toBe(true);

      // Real Astro navigation issues a newer POST while the earlier GET is pending.
      await page.clock.resume();
      await page.locator('.nav-links a[href="/about"]').click();
      await expect(page).toHaveURL(/\/about\/?$/);
      await expectOnline(page, '3', 1);
      await pauseAfterLoad(page);

      const read = heldRead;
      if (!read) throw new Error('The scheduled stats read was not intercepted');
      const responseReceived = page.waitForResponse((response) => response.request() === read.request());
      if (delayedStatus === 200) await respondWithStats(read, 1);
      else await read.fulfill({ status: delayedStatus, contentType: 'application/json', body: '{"ok":false}' });
      released = true;
      await (await responseReceived).finished();
      await page.clock.runFor(100);

      await expectOnline(page, '3', 1);
      await expect(page.locator('[data-site-stats]')).not.toHaveClass(/is-unavailable/);
      expect(requests.some(({ method, path }) => method === 'POST' && path === '/about')).toBe(true);
    } finally {
      if (heldRead && !released) await heldRead.abort().catch(() => {});
    }
  });
}

test('Astro navigation restores cached counts while a fresh pageview is pending and keeps polling', async ({ page }) => {
  const requests: StatsRequest[] = [];
  let pageviews = 0;
  let heldReturn: Route | undefined;
  let released = false;
  await page.route('**/api/site-stats', async (route) => {
    const payload = recordRequest(route, requests);
    if (payload?.event === 'pageview') {
      pageviews += 1;
      if (pageviews === 3) {
        heldReturn = route;
        return;
      }
    }
    await respondWithStats(route, Math.min(pageviews, 3));
  });

  try {
    await page.goto('/');
    await expectOnline(page, '1');
    await pauseAfterLoad(page);
    await page.evaluate(() => Reflect.set(window, 'siteStatsNavigationMarker', 'same-document'));

    await page.clock.resume();
    await page.locator('.nav-links a[href="/about"]').click();
    await expect(page).toHaveURL(/\/about\/?$/);
    await expectOnline(page, '2', 1);
    await pauseAfterLoad(page);

    await page.clock.resume();
    await page.locator('.site-header a.logo').click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => Boolean(heldReturn)).toBe(true);
    await expectOnline(page, '2');
    await pauseAfterLoad(page);
    expect(await page.evaluate(() => Reflect.get(window, 'siteStatsNavigationMarker'))).toBe('same-document');

    const pending = heldReturn;
    if (!pending) throw new Error('The return pageview was not intercepted');
    await respondWithStats(pending, 3);
    released = true;
    await expectOnline(page, '3');
    const readsBeforeTick = requests.filter(({ method }) => method === 'GET').length;
    await page.clock.fastForward(15_000);
    await expect.poll(() => requests.filter(({ method }) => method === 'GET').length).toBe(readsBeforeTick + 1);
    await expectOnline(page, '3');
    expect(requests.filter(({ event }) => event === 'pageview').map(({ path }) => path)).toEqual(['/', '/about', '/']);
  } finally {
    if (heldReturn && !released) await heldReturn.abort().catch(() => {});
  }
});

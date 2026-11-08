import { expect, test, type Page, type Route } from '@playwright/test';

const SNAPSHOT_PATTERN = /\/data\/github-contributions\.json(?:\?.*)?$/;
const SOURCE_URL = 'https://github.com/users/huiishan99/contributions';
const DAY_MS = 86_400_000;
const externalRequests = new WeakMap<Page, string[]>();
type Contribution = { date: string; count: number; level: number };
type Snapshot = { schemaVersion: number; username: string; source: string; fetchedAt: string; rangeStart: string; rangeEnd: string; contributions: Contribution[] };
type Fixture = { snapshot: Snapshot; markedDate: string };

function todayInTokyo(): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = (name: Intl.DateTimeFormatPartTypes) => parts.find(({ type }) => type === name)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);
}
function displayDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00.000Z`));
}
async function fixtureFor(page: Page, count = 7, ageDays = 0): Promise<Fixture> {
  const gridEnd = await page.locator('.github-calendar--full').getAttribute('data-end');
  if (!gridEnd) throw new Error('The full calendar has no date range');
  const today = await page.evaluate(() => new Date().toISOString().slice(0, 10));
  const rangeEnd = shiftDate(gridEnd < today ? gridEnd : today, -ageDays);
  const contributions = Array.from({ length: 365 }, (_, index) => ({
    date: shiftDate(rangeEnd, index - 364), count: index === 363 ? count : 0, level: index === 363 && count > 0 ? 4 : 0,
  }));
  return { snapshot: { schemaVersion: 1, username: 'huiishan99', source: SOURCE_URL, fetchedAt: `${rangeEnd}T02:00:00.000Z`, rangeStart: contributions[0].date, rangeEnd, contributions }, markedDate: contributions[363].date };
}
async function fulfillSnapshot(route: Route, snapshot: Snapshot) {
  expect(new URL(route.request().url()).origin).toBe('http://127.0.0.1:4321');
  await route.fulfill({ contentType: 'application/json', body: JSON.stringify(snapshot) });
}
async function failSnapshot(route: Route) {
  await route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"temporarily unavailable"}' });
}
async function visitHome(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-github-activity]').scrollIntoViewIfNeeded();
}
async function expectEnhanced(page: Page, fixture: Fixture, count = 7) {
  const activity = page.locator('[data-github-activity]');
  await expect(activity).toHaveClass(/is-enhanced/);
  await expect(activity).not.toHaveClass(/is-loading|is-unavailable/);
  await expect(activity).toHaveAttribute('aria-busy', 'false');
  const title = `${displayDate(fixture.markedDate)}: ${count} GitHub contribution${count === 1 ? '' : 's'}`;
  for (const variant of ['full', 'compact']) {
    const cell = activity.locator(`.github-calendar--${variant}`).getByTitle(title, { exact: true });
    await expect(cell).toHaveCount(1);
    await expect(cell).toHaveClass(/github-calendar-day--4/);
  }
  await expect(activity.locator('.github-activity-fallback, img')).toHaveCount(0);
  await expect(activity.locator('[data-github-data-status], [data-github-fallback-message]')).toHaveCount(0);
}
async function expectUnavailable(page: Page) {
  const activity = page.locator('[data-github-activity]');
  await expect(activity).toHaveClass(/is-unavailable/);
  await expect(activity).not.toHaveClass(/is-loading|is-enhanced/);
  await expect(activity).toHaveAttribute('aria-busy', 'false');
  await expect(activity.locator('.github-calendar--full')).toBeVisible();
  expect(await activity.locator('.github-calendar--full .github-calendar-day--unknown').count()).toBeGreaterThan(300);
  await expect(activity.locator('.github-calendar-day--0, .github-calendar-day--1, .github-calendar-day--2, .github-calendar-day--3, .github-calendar-day--4')).toHaveCount(0);
  await expect(activity.locator('.github-activity-fallback, img')).toHaveCount(0);
  await expect(activity.locator('[data-github-data-status], [data-github-fallback-message]')).toHaveCount(0);
}
async function pauseAfterLoad(page: Page) {
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 100);
}
async function leaveAndReturn(page: Page) {
  await page.clock.resume();
  await page.locator('.nav-links a[href="/about"]').click();
  await expect(page).toHaveURL(/\/about\/?$/);
  await page.locator('.site-header a.logo').click();
  await expect(page).toHaveURL(/\/$/);
  await page.locator('[data-github-activity]').scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => Reflect.get(window, 'githubCalendarNavigationMarker'))).toBe('same-document');
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(`${todayInTokyo()}T03:00:00.000Z`) });
  const observed: string[] = [];
  externalRequests.set(page, observed);
  page.on('request', (request) => {
    if (['github-contributions-api.jogruber.de', 'ghchart.rshah.org'].includes(new URL(request.url()).hostname)) observed.push(request.url());
  });
  // This is an outage test for every external host, not a mocked successful API.
  await page.route('https://**/*', (route) => route.abort('failed'));
  await page.route('**/api/site-stats', (route) => route.fulfill({ contentType: 'application/json', body: '{"views":128,"visitors":64,"online":1}' }));
});
test.afterEach(async ({ page }) => {
  expect(externalRequests.get(page)).toEqual([]);
});

for (const width of [1280, 390]) {
  test(`same-origin data preserves the gold rounded grid with external hosts blocked at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let fixture: Fixture | undefined;
    let requests = 0;
    await page.route(SNAPSHOT_PATTERN, async (route) => { requests += 1; fixture = await fixtureFor(page); await fulfillSnapshot(route, fixture.snapshot); });
    await visitHome(page);
    await expect.poll(() => fixture?.markedDate).toBeTruthy();
    await expectEnhanced(page, fixture!);
    expect(requests).toBe(1);
    const variant = width < 720 ? 'compact' : 'full';
    await expect(page.locator(`.github-calendar--${variant}`)).toBeVisible();
    await expect(page.locator(`.github-calendar--${width < 720 ? 'full' : 'compact'}`)).toBeHidden();
    const coloredCell = page.locator(`.github-calendar--${variant} .github-calendar-day--4`);
    await expect(coloredCell).toHaveCSS('border-radius', width < 720 ? '2px' : '3px');
    await expect(coloredCell).toHaveCSS('background-color', 'rgba(212, 168, 75, 0.9)');
  });
}

test('legitimate zero contributions stay distinct from unavailable dates', async ({ page }) => {
  let fixture: Fixture | undefined;
  await page.route(SNAPSHOT_PATTERN, async (route) => { fixture = await fixtureFor(page, 0); await fulfillSnapshot(route, fixture.snapshot); });
  await visitHome(page);
  await expect(page.locator('[data-github-activity]')).toHaveClass(/is-enhanced/);
  await expect.poll(() => fixture?.snapshot.rangeEnd).toBeTruthy();
  const activity = page.locator('[data-github-activity]');
  expect(await activity.locator('.github-calendar--full .github-calendar-day--0').count()).toBeGreaterThan(300);
  await expect(activity.locator('.github-calendar-day--1, .github-calendar-day--2, .github-calendar-day--3, .github-calendar-day--4')).toHaveCount(0);
  const zero = activity.locator('.github-calendar--full').getByTitle(`${displayDate(fixture!.snapshot.rangeEnd)}: 0 GitHub contributions`, { exact: true });
  await expect(zero).toHaveClass(/github-calendar-day--0/);
  await expect(zero).not.toHaveClass(/github-calendar-day--unknown/);
});

test('a dated older snapshot retains known contributions and marks later dates unknown', async ({ page }) => {
  let fixture: Fixture | undefined;
  await page.route(SNAPSHOT_PATTERN, async (route) => { fixture = await fixtureFor(page, 7, 3); await fulfillSnapshot(route, fixture.snapshot); });
  await visitHome(page);
  await expect.poll(() => fixture?.markedDate).toBeTruthy();
  await expectEnhanced(page, fixture!);
  const gridEnd = await page.locator('.github-calendar--full').getAttribute('data-end');
  if (!gridEnd) throw new Error('The full calendar has no end date');
  const unknownCount = (Date.parse(gridEnd) - Date.parse(fixture!.snapshot.rangeEnd)) / DAY_MS;
  expect(unknownCount).toBeGreaterThanOrEqual(3);
  for (const variant of ['full', 'compact']) {
    const unknown = page.locator(`.github-calendar--${variant} .github-calendar-day--unknown`);
    await expect(unknown).toHaveCount(unknownCount);
    await expect(unknown.first()).not.toHaveAttribute('title', /: 0 GitHub contributions$/);
  }
});

for (const failure of ['http-503', 'invalid-200']) {
  test(`a ${failure} snapshot is retried after real Astro navigation`, async ({ page }) => {
    let unavailable = true;
    let requests = 0;
    let fixture: Fixture | undefined;
    await page.route(SNAPSHOT_PATTERN, async (route) => {
      requests += 1;
      if (unavailable) {
        if (failure === 'http-503') return failSnapshot(route);
        const broken = await fixtureFor(page);
        broken.snapshot.contributions.splice(100, 1);
        return fulfillSnapshot(route, broken.snapshot);
      }
      fixture = await fixtureFor(page);
      await fulfillSnapshot(route, fixture.snapshot);
    });
    await visitHome(page);
    await expectUnavailable(page);
    const baseline = requests;
    await page.evaluate(() => Reflect.set(window, 'githubCalendarNavigationMarker', 'same-document'));
    unavailable = false;
    await leaveAndReturn(page);
    await expect.poll(() => requests).toBe(baseline + 1);
    await expect.poll(() => fixture?.markedDate).toBeTruthy();
    await expectEnhanced(page, fixture!);
  });
}

test('a pending snapshot stops loading at three seconds without inventing zeroes', async ({ page }) => {
  let heldRequest: Route | undefined;
  let requestedAt = 0;
  await page.route(SNAPSHOT_PATTERN, async (route) => { heldRequest = route; requestedAt = await page.evaluate(() => Date.now()); });
  try {
    await visitHome(page);
    await expect.poll(() => requestedAt).toBeGreaterThan(0);
    const activity = page.locator('[data-github-activity]');
    await expect(activity).toHaveClass(/is-loading/);
    await pauseAfterLoad(page);
    const remaining = requestedAt + 2_900 - await page.evaluate(() => Date.now());
    expect(remaining).toBeGreaterThan(0);
    await page.clock.fastForward(remaining);
    await expect(activity).toHaveClass(/is-loading/);
    await expect(activity).toHaveAttribute('aria-busy', 'true');
    await page.clock.fastForward(200);
    await expectUnavailable(page);
  } finally {
    if (heldRequest) await heldRequest.abort().catch(() => {});
  }
});

for (const invalid of ['empty', 'wrong-user', 'missing-day', 'duplicate-day', 'invalid-date', 'negative-count', 'invalid-level', 'wrong-range', 'wrong-source', 'bad-timestamp', 'schema-version']) {
  test(`a ${invalid} snapshot cannot masquerade as zero contributions`, async ({ page }) => {
    await page.route(SNAPSHOT_PATTERN, async (route) => {
      const { snapshot } = await fixtureFor(page);
      if (invalid === 'empty') snapshot.contributions = [];
      if (invalid === 'wrong-user') snapshot.username = 'another-user';
      if (invalid === 'missing-day') snapshot.contributions.splice(100, 1);
      if (invalid === 'duplicate-day') snapshot.contributions[100] = { ...snapshot.contributions[99] };
      if (invalid === 'invalid-date') snapshot.contributions[100].date = '2026-02-30';
      if (invalid === 'negative-count') snapshot.contributions[363].count = -1;
      if (invalid === 'invalid-level') snapshot.contributions[363].level = 5;
      if (invalid === 'wrong-range') snapshot.rangeEnd = shiftDate(snapshot.rangeEnd, 1);
      if (invalid === 'wrong-source') snapshot.source = 'https://example.com/untrusted-contributions';
      if (invalid === 'bad-timestamp') snapshot.fetchedAt = 'not-a-date';
      if (invalid === 'schema-version') snapshot.schemaVersion = 2;
      await fulfillSnapshot(route, snapshot);
    });
    await visitHome(page);
    await expectUnavailable(page);
  });
}

for (const coverage of ['entirely-outside', 'no-compact-overlap']) {
  test(`a snapshot with ${coverage} coverage keeps the original grid visibly unavailable`, async ({ page }) => {
    await page.route(SNAPSHOT_PATTERN, async (route) => { const fixture = await fixtureFor(page, 7, coverage === 'entirely-outside' ? 730 : 200); await fulfillSnapshot(route, fixture.snapshot); });
    await visitHome(page);
    await expectUnavailable(page);
  });
}

test('data is shared for five minutes and a refresh may correct historical counts downward', async ({ page }) => {
  let requests = 0;
  let fixture: Fixture | undefined;
  await page.route(SNAPSHOT_PATTERN, async (route) => { requests += 1; fixture = await fixtureFor(page, requests === 1 ? 7 : 3); await fulfillSnapshot(route, fixture.snapshot); });
  await visitHome(page);
  await expect.poll(() => fixture?.markedDate).toBeTruthy();
  await expectEnhanced(page, fixture!);
  await page.evaluate(() => Reflect.set(window, 'githubCalendarNavigationMarker', 'same-document'));
  await pauseAfterLoad(page);
  await page.clock.fastForward(240_000);
  await leaveAndReturn(page);
  await expectEnhanced(page, fixture!);
  expect(requests).toBe(1);
  await pauseAfterLoad(page);
  await page.clock.fastForward(61_000);
  await leaveAndReturn(page);
  await expect.poll(() => requests).toBe(2);
  await expectEnhanced(page, fixture!, 3);
});

test('the online event recovers a failed snapshot without a full reload', async ({ page }) => {
  let unavailable = true;
  let requests = 0;
  let fixture: Fixture | undefined;
  await page.route(SNAPSHOT_PATTERN, async (route) => {
    requests += 1;
    if (unavailable) return failSnapshot(route);
    fixture = await fixtureFor(page);
    await fulfillSnapshot(route, fixture.snapshot);
  });
  await visitHome(page);
  await expectUnavailable(page);
  const baseline = requests;
  unavailable = false;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect.poll(() => requests).toBe(baseline + 1);
  await expect.poll(() => fixture?.markedDate).toBeTruthy();
  await expectEnhanced(page, fixture!);
});

for (const path of ['/', '/zh', '/ja']) {
  test(`the real built snapshot is readable from the ${path} homepage`, async ({ page }) => {
    const response = await page.request.get('/data/github-contributions.json');
    expect(response.ok()).toBe(true);
    const snapshot = await response.json() as Snapshot;
    expect(snapshot.username).toBe('huiishan99');
    expect(snapshot.contributions.length).toBeGreaterThanOrEqual(365);
    const requestUrls: string[] = [];
    page.on('request', (request) => { if (SNAPSHOT_PATTERN.test(request.url())) requestUrls.push(request.url()); });
    await visitHome(page, path);
    const activity = page.locator('[data-github-activity]');
    await expect(activity).toHaveClass(/is-enhanced/);
    await expect(activity).toHaveAttribute('aria-busy', 'false');
    await expect(activity.locator('[data-github-data-status], [data-github-fallback-message]')).toHaveCount(0);
    await expect(activity.locator('img')).toHaveCount(0);
    expect(requestUrls).toHaveLength(1);
    expect(new URL(requestUrls[0]).pathname).toBe('/data/github-contributions.json');
    expect(new URL(requestUrls[0]).origin).toBe('http://127.0.0.1:4321');
  });
}

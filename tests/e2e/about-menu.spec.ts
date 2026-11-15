import { expect, test, type Locator, type Page } from '@playwright/test';

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

function aboutNavigation(page: Page) {
  const root = page.locator('[data-site-about]');
  return {
    root,
    about: root.locator('[data-site-about-link]'),
    menu: root.locator('[data-site-about-menu]'),
    toggle: root.locator('[data-site-about-toggle]'),
    panel: root.locator('[data-site-about-panel]'),
  };
}

async function paddingPoint(link: Locator) {
  const box = (await link.boundingBox())!;
  const text = (await link.locator('span').boundingBox())!;
  // Exercise the real link's blank trailing padding, not its text or icon.
  const point = { x: box.width - 4, y: box.height / 2 };
  expect(box.x + point.x).toBeGreaterThan(text.x + text.width);
  return point;
}

test.beforeEach(async ({ page }) => {
  await mockRuntimeServices(page);
});

test('the first Home click opens About destinations and text, icon and row padding are real links', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  const nav = aboutNavigation(page);
  await expect(nav.root).toHaveCount(1);
  await expect(nav.about).toHaveAttribute('href', '/about/');
  await expect(nav.menu).not.toHaveAttribute('open', '');
  await expect(page.locator('[data-site-explore]')).toHaveCount(0);
  await expect(page.locator('.nav-links > li')).toHaveCount(3);

  await nav.toggle.click(); // No preparatory hover or second click.
  await expect(nav.menu).toHaveAttribute('open', '');
  await expect(nav.panel).toBeVisible();
  await expect(nav.panel.locator('a')).toHaveCount(2);
  await page.locator('main h1').click();
  await expect(nav.panel).toBeHidden();
  await expect(page).toHaveURL(/\/$/);

  await nav.toggle.click();
  await nav.panel.locator('[data-site-area="beyond-code"] span').click();
  await expect(page).toHaveURL(/\/beyond-code\/$/);
  await expect(page.locator('[data-beyond]')).toHaveClass(/is-ready/);
  await expect(nav.menu).not.toHaveAttribute('open', '');

  await nav.toggle.click();
  await nav.panel.locator('[data-site-area="atlas"] svg').click();
  await expect(page).toHaveURL(/\/journey\/$/);
  await expect(page.locator('[data-earth-scene]')).toHaveAttribute('data-earth-ready', 'true');
  await expect(nav.menu).not.toHaveAttribute('open', '');

  await nav.toggle.click();
  const beyond = nav.panel.locator('[data-site-area="beyond-code"]');
  await beyond.click({ position: await paddingPoint(beyond) });
  await expect(page).toHaveURL(/\/beyond-code\/$/);
  await expect(page.locator('[data-beyond]')).toHaveClass(/is-ready/);

  // About remains a separate native destination even while its submenu is open.
  await nav.toggle.click();
  await nav.about.click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.locator('main h1')).toBeVisible();
  await expect(nav.panel).toBeHidden();
  await nav.toggle.click(); // New header after multiple Astro swaps stays usable.
  await expect(nav.panel).toBeVisible();
  await nav.toggle.click();
  await expect(nav.panel).toBeHidden();
});

test('Tab and Enter distinguish the direct About link from its disclosure and Escape restores focus', async ({ page }) => {
  await page.goto('/');
  const nav = aboutNavigation(page);
  await page.locator('.site-header .logo').focus();
  await page.keyboard.press('Tab');
  await expect(nav.about).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(nav.toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(nav.panel).toBeVisible();
  await page.keyboard.press('Tab');
  const beyond = nav.panel.locator('[data-site-area="beyond-code"]');
  await expect(beyond).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/beyond-code\/$/);
  await expect(page.locator('[data-beyond]')).toHaveClass(/is-ready/);

  await nav.toggle.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(beyond).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nav.panel).toBeHidden();
  await expect(nav.toggle).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.nav-links a[href="/projects/"]')).toBeFocused();

  await nav.toggle.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(nav.about).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(nav.panel).toBeHidden();
});

test.describe('touch navigation', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('a first tap opens the menu, outside touch dismisses it and full rows navigate at 390px', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto('/');
    const nav = aboutNavigation(page);
    await nav.toggle.tap();
    await expect(nav.panel).toBeVisible();
    const beyond = nav.panel.locator('[data-site-area="beyond-code"]');
    const local = await paddingPoint(beyond);
    const box = (await beyond.boundingBox())!;
    await page.touchscreen.tap(box.x + local.x, box.y + local.y);
    await expect(page).toHaveURL(/\/beyond-code\/$/);
    await expect(page.locator('[data-beyond]')).toHaveClass(/is-ready/);
    await expect(nav.panel).toBeHidden();
    await nav.toggle.tap();
    await expect(nav.panel).toBeVisible();
    const panel = (await nav.panel.boundingBox())!;
    await page.touchscreen.tap(Math.max(2, panel.x / 2), panel.y + panel.height / 2);
    await expect(nav.panel).toBeHidden();
    await expect(page).toHaveURL(/\/beyond-code\/$/);
    await nav.toggle.tap();
    await nav.panel.locator('[data-site-area="atlas"]').tap();
    await expect(page).toHaveURL(/\/journey\/$/);
    await expect(page.locator('[data-earth-scene]')).toHaveAttribute('data-earth-ready', 'true');
    await expect(nav.panel).toBeHidden();
    await nav.about.tap();
    await expect(page).toHaveURL(/\/about\/$/);
    await nav.toggle.tap();
    await expect(nav.panel).toBeVisible();
    await nav.toggle.tap();
    await expect(nav.panel).toBeHidden();
  });
});

for (const locale of [
  { lang: 'en', prefix: '', about: 'About', toggle: 'More about me', beyond: 'Beyond Code', atlas: 'Travel Atlas' },
  { lang: 'zh', prefix: '/zh', about: '关于', toggle: '更多关于我的页面', beyond: '代码之外', atlas: '旅行星图' },
  { lang: 'ja', prefix: '/ja', about: '私について', toggle: '自分についてのページ', beyond: 'コードを超えて', atlas: '旅の星図' },
]) {
  test(`${locale.lang} About destinations fit 320px and 390px without adding a top-level tab`, async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(locale.prefix ? `${locale.prefix}/` : '/');
      const nav = aboutNavigation(page);
      await expect(nav.about).toHaveAttribute('href', `${locale.prefix}/about/`);
      await expect(nav.about).toHaveText(locale.about);
      await expect(nav.toggle).toHaveAccessibleName(locale.toggle);
      await expect(page.locator('.nav-links > li')).toHaveCount(3);
      await nav.toggle.click();
      await expect(nav.panel).toBeVisible();
      const box = (await nav.panel.boundingBox())!;
      const toggle = (await nav.toggle.boundingBox())!;
      expect(toggle.width).toBeGreaterThanOrEqual(44);
      expect(toggle.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 0.5);
      expect(box.y).toBeGreaterThanOrEqual(toggle.y + toggle.height);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
      await expect(nav.panel.locator('a')).toHaveCount(2);
      for (const destination of [
        { id: 'beyond-code', path: '/beyond-code/', label: locale.beyond },
        { id: 'atlas', path: '/journey/', label: locale.atlas },
      ]) {
        const link = nav.panel.locator(`[data-site-area="${destination.id}"]`);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', `${locale.prefix}${destination.path}`);
        await expect(link).toHaveText(destination.label);
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await expect(nav.panel.locator('[data-site-area="timeline"]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await nav.toggle.press('Escape');
      await expect(nav.panel).toBeHidden();
      await expect(nav.toggle).toBeFocused();
    }
  });
}

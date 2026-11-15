import { expect, test, type Locator, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

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

async function mobileNavigationMetrics(page: Page) {
  return page.evaluate(() => {
    const rect = (element: Element) => {
      const box = element.getBoundingClientRect();
      return {
        x: box.x, y: box.y, width: box.width, height: box.height,
        right: box.right, bottom: box.bottom,
        centerX: box.x + box.width / 2, centerY: box.y + box.height / 2,
      };
    };
    const row = document.querySelector('.nav-links')!;
    const context = document.createElement('canvas').getContext('2d')!;
    const items = [...row.querySelectorAll(':scope > li')].map((item) => {
      const label = item.querySelector<HTMLAnchorElement>('[data-site-about-link], :scope > a')!;
      const group = item.querySelector('[data-site-about]') ?? label;
      const range = document.createRange();
      range.selectNodeContents(label);
      const text = range.getBoundingClientRect();
      const style = getComputedStyle(label);
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const font = context.measureText(label.textContent!.trim());
      return {
        text: label.textContent!.trim(), item: rect(item), group: rect(group), link: rect(label),
        label: { x: text.x, y: text.y, width: text.width, height: text.height, bottom: text.bottom },
        // The labels share a font within a locale. Range top + the browser's
        // font-box ascent gives a comparable baseline without changing the DOM.
        baseline: text.y + font.fontBoundingBoxAscent,
        font: { family: style.fontFamily, size: style.fontSize, lineHeight: style.lineHeight },
      };
    });
    return {
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      header: rect(document.querySelector('.site-header')!), row: rect(row), items,
      toggle: rect(document.querySelector('[data-site-about-toggle]')!),
      groupGaps: items.slice(1).map((item, index) => item.group.x - items[index].group.right),
      itemGaps: items.slice(1).map((item, index) => item.item.x - items[index].item.right),
      baselineSpread: Math.max(...items.map((item) => item.baseline)) - Math.min(...items.map((item) => item.baseline)),
    };
  });
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
  test(`${locale.lang} About destinations fit 320px, 390px and 768px without adding a top-level tab`, async ({ page }, testInfo) => {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(locale.prefix ? `${locale.prefix}/` : '/');
      await page.evaluate(() => document.fonts.ready);
      const nav = aboutNavigation(page);
      await expect(nav.about).toHaveAttribute('href', `${locale.prefix}/about/`);
      await expect(nav.about).toHaveText(locale.about);
      await expect(nav.toggle).toHaveAccessibleName(locale.toggle);
      await expect(page.locator('.nav-links > li')).toHaveCount(3);
      const alignment = await mobileNavigationMetrics(page);
      // Local review capture is opt-in. --output chooses its location; no user
      // machine path or routine screenshot artifact is part of the CI contract.
      if (process.env.CAPTURE_MOBILE_NAV_ALIGNMENT === '1') {
        const metricsPath = testInfo.outputPath(`nav-${locale.lang}-${width}.json`);
        await writeFile(metricsPath, `${JSON.stringify(alignment, null, 2)}\n`);
        await testInfo.attach(`nav-${locale.lang}-${width}-geometry`, { path: metricsPath, contentType: 'application/json' });
        const screenshotPath = testInfo.outputPath(`nav-${locale.lang}-${width}.png`);
        await page.locator('.site-header').screenshot({ path: screenshotPath });
        await testInfo.attach(`nav-${locale.lang}-${width}`, { path: screenshotPath, contentType: 'image/png' });
      }
      expect(alignment.viewport.width).toBe(width);
      expect(alignment.viewport.height).toBe(844);
      expect(alignment.items).toHaveLength(3);
      const columnWidth = alignment.row.width / 3;
      for (const [index, item] of alignment.items.entries()) {
        // Compare group centers, including About's arrow, rather than expecting
        // equal blank edge gaps between labels of different widths.
        expect(Math.abs(item.item.width - columnWidth)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(item.item.centerX - (alignment.row.x + columnWidth * (index + 0.5)))).toBeLessThanOrEqual(0.5);
        expect(Math.abs(item.group.centerX - item.item.centerX)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(item.group.centerY - alignment.items[0].group.centerY)).toBeLessThanOrEqual(0.5);
        expect(item.group.x).toBeGreaterThanOrEqual(0);
        expect(item.group.right).toBeLessThanOrEqual(width);
        expect(Number.isFinite(item.baseline)).toBe(true);
      }
      expect(alignment.baselineSpread).toBeLessThanOrEqual(0.5);
      expect(alignment.toggle.width).toBeGreaterThanOrEqual(44);
      expect(alignment.toggle.height).toBeGreaterThanOrEqual(44);
      expect(alignment.items[0].link.right).toBeLessThanOrEqual(alignment.toggle.x);
      expect(alignment.toggle.right).toBeLessThanOrEqual(alignment.items[1].link.x);
      expect(alignment.items[1].link.right).toBeLessThanOrEqual(alignment.items[2].link.x);
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

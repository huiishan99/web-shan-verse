import { expect, test, type Page } from '@playwright/test';

async function mockRuntimeServices(page: Page) {
  await page.route('https://**/*', async (route) => {
    const url = new URL(route.request().url());

    if (url.hostname === 'github-contributions-api.jogruber.de') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ contributions: [] }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
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

test.beforeEach(async ({ page }) => {
  await mockRuntimeServices(page);
});

test('home page loads its core landmarks without uncaught errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('Home | SHAN-VERSE');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('language switcher opens and navigates to the Chinese home page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const toggle = page.locator('[data-language-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.locator('[data-language-menu] a[lang="zh"]').click();

  await expect(page).toHaveURL(/\/zh\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
  await expect(page.locator('[data-language-toggle]')).toHaveText('中');
});

test('CLI keyboard shortcut can search the generated site index', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Control+K');
  const overlay = page.locator('[data-cli-overlay]');
  const input = page.locator('[data-cli-input]');
  await expect(overlay).toHaveAttribute('aria-hidden', 'false');
  await input.fill('search codex');
  await input.press('Enter');

  await expect(page.locator('[data-cli-output] .cli-result-link').first()).toContainText(/Codex/i);
});

test('music player can play, survive a client-side navigation, and pause', async ({ page }) => {
  await page.goto('/');

  const toggle = page.locator('[data-music-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-music-audio]')).toHaveJSProperty('paused', false);

  await page.locator('.nav-links a[href="/about"]').click();
  await expect(page).toHaveURL(/\/about\/?$/);
  await expect(page.locator('[data-music-audio]')).toHaveJSProperty('paused', false);

  await page.locator('[data-music-toggle]').click();
  await expect(page.locator('[data-music-toggle]')).toHaveAttribute('aria-pressed', 'false');
});

test('translated article exposes complete alternate links and keeps its slug', async ({ page }) => {
  await page.goto('/blog/codex-after-the-update');

  await expect(page.locator('h1')).toContainText('After the Codex Update');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="zh"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="ja"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

  await page.locator('[data-language-menu] a[lang="ja"]').click();
  await expect(page).toHaveURL(/\/ja\/blog\/codex-after-the-update\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('h1')).toContainText('Codex のアップデート後');
});

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

test('project cards open both text-only and image detail dialogs', async ({ page }) => {
  await page.goto('/projects');

  const vrCard = page.locator('.project-card').filter({ hasText: 'VR Car Scene Prototype' });
  const vrTrigger = vrCard.getByRole('button', { name: 'View Details' });
  const vrDialog = page.locator('#project-detail-vr-0');

  await vrTrigger.click();
  await expect(vrDialog).toBeVisible();
  await expect(vrDialog).toHaveClass(/project-detail-dialog--text-only/);
  await expect(vrDialog.locator('.project-detail-media')).toHaveCount(0);
  await expect(vrDialog.locator('.project-detail-description')).toContainText('Meta Quest hardware');

  await page.keyboard.press('Escape');
  await expect(vrDialog).not.toBeVisible();
  await expect(vrTrigger).toBeFocused();

  const siteCard = page.locator('.project-card').filter({ hasText: 'SHAN-VERSE' });
  const siteDialog = page.locator('#project-detail-web-0');

  await siteCard.getByRole('button', { name: 'View Details' }).click();
  await expect(siteDialog).toBeVisible();
  await expect(siteDialog).toHaveClass(/project-detail-dialog--with-image/);
  await expect(siteDialog.locator('.project-detail-media img')).toHaveAttribute('src', '/images/header_galaxy.jpg');

  await siteDialog.getByRole('button', { name: 'Close project details' }).click();
  await expect(siteDialog).not.toBeVisible();

  const mathBridgeCard = page.locator('.project-card').filter({ hasText: 'VR Math Bridge' });
  const mathBridgeDialog = page.locator('#project-detail-publications-0');

  await expect(mathBridgeCard.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/vr-math-bridge/'
  );
  await mathBridgeCard.getByRole('button', { name: 'View Details' }).click();
  await expect(mathBridgeDialog).toBeVisible();
  await expect(mathBridgeDialog.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/vr-math-bridge/'
  );
  await expect(mathBridgeDialog.locator('[data-project-gallery-slide]')).toHaveCount(5);
  await expect(mathBridgeDialog.locator('[data-project-gallery-slide]:visible')).toHaveCount(1);
  await expect(mathBridgeDialog.locator('[data-project-gallery-slide]:not([hidden]) img')).toHaveAttribute(
    'src',
    '/images/projects/vr-math-bridge-overview.webp'
  );
  const mathBridgeImageSources = await mathBridgeDialog.locator('[data-project-gallery-slide] img')
    .evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  expect(mathBridgeImageSources.some((source) => source?.endsWith('/background.png'))).toBe(false);

  await mathBridgeDialog.getByRole('button', { name: 'Close project details' }).click();
  await expect(mathBridgeDialog).not.toBeVisible();

  const vibeCodingCard = page.locator('.project-card').filter({ hasText: 'Assessing the Security of Vibe Coding' });
  const vibeCodingDialog = page.locator('#project-detail-publications-1');

  await vibeCodingCard.getByRole('button', { name: 'View Details' }).click();
  await expect(vibeCodingDialog).toBeVisible();
  await expect(vibeCodingDialog.locator('[data-project-gallery-slide]')).toHaveCount(7);
  await expect(vibeCodingDialog.locator('[data-project-gallery-slide]:visible')).toHaveCount(1);
  await expect(vibeCodingDialog.locator('[data-project-gallery-slide]:not([hidden]) img')).toHaveAttribute(
    'src',
    '/images/projects/ispec-2025-experiment-pipeline.jpg'
  );
  await expect(vibeCodingDialog.locator('[data-project-gallery-counter]')).toHaveText('1 / 7');

  await vibeCodingDialog.getByRole('button', { name: 'Next image' }).click();
  await expect(vibeCodingDialog.locator('[data-project-gallery-counter]')).toHaveText('2 / 7');
  await expect(vibeCodingDialog.locator('[data-project-gallery-slide]:visible')).toHaveCount(1);

  await vibeCodingDialog.getByRole('button', { name: 'Close project details' }).click();
  await expect(vibeCodingDialog).not.toBeVisible();

  const mandalaCard = page.locator('.project-card').filter({ hasText: 'Enhancing VR Mandala Drawing' });
  const mandalaDialog = page.locator('#project-detail-publications-2');

  await mandalaCard.getByRole('button', { name: 'View Details' }).click();
  await expect(mandalaDialog).toBeVisible();
  await expect(mandalaDialog).toHaveClass(/project-detail-dialog--image-contain/);
  await expect(mandalaDialog.locator('[data-project-gallery-slide]')).toHaveCount(4);
  await expect(mandalaDialog.locator('[data-project-gallery-slide]:visible')).toHaveCount(1);
  await expect(mandalaDialog.locator('[data-project-gallery-slide]:not([hidden]) img')).toHaveAttribute(
    'src',
    '/images/projects/ahs-2026-figure-1-system-architecture.jpg'
  );
  await expect(mandalaDialog.locator('[data-project-gallery-counter]')).toHaveText('1 / 4');

  await mandalaDialog.getByRole('button', { name: 'Next image' }).click();
  await expect(mandalaDialog.locator('[data-project-gallery-slide]:not([hidden]) img')).toHaveAttribute(
    'src',
    '/images/projects/ahs-2026-figure-3-vr-mandala-experience.jpg'
  );
  await expect(mandalaDialog.locator('[data-project-gallery-counter]')).toHaveText('2 / 4');
  await expect(mandalaDialog.locator('[data-project-gallery-slide]:visible')).toHaveCount(1);

  const galleryBox = await mandalaDialog.locator('[data-project-gallery]').boundingBox();
  const detailBodyBox = await mandalaDialog.locator('.project-detail-body').boundingBox();
  expect(galleryBox).not.toBeNull();
  expect(detailBodyBox).not.toBeNull();
  expect(galleryBox!.y + galleryBox!.height).toBeLessThanOrEqual(detailBodyBox!.y + 1);

  await page.keyboard.press('ArrowLeft');
  await expect(mandalaDialog.locator('[data-project-gallery-counter]')).toHaveText('1 / 4');
});

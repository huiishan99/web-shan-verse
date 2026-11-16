import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';

type Locale = 'en' | 'zh' | 'ja';
type LicensedMedia = {
  artwork: string; description: string; artworkTitle: string; artworkCredit: string;
  artworkUsageSource: string; artworkLicenseUrl: string; artworkLicenseName: string;
};
const media: Record<string, LicensedMedia> = JSON.parse(
  readFileSync(new URL('../../src/data/beyond-code-media.json', import.meta.url), 'utf8'),
);
const labels: Record<string, Record<Locale, string>> = {
  'foods-malaysian-cuisine': { en: 'Malaysian cuisine', zh: '马来西亚料理', ja: 'マレーシア料理' },
  'foods-hainanese-chicken-rice': { en: 'Hainanese chicken rice', zh: '海南鸡饭', ja: '海南チキンライス' },
  'foods-nasi-kandar': { en: 'Nasi kandar', zh: '扁担饭', ja: 'ナシカンダー' },
  'foods-roti-canai': { en: 'Roti canai', zh: '印度煎饼', ja: 'ロティチャナイ' },
  'foods-bak-kut-teh': { en: 'Bak kut teh', zh: '肉骨茶', ja: 'バクテー' },
  'foods-indian-cuisine': { en: 'Indian cuisine', zh: '印度料理', ja: 'インド料理' },
  'foods-chicken-biryani': { en: 'Chicken biryani', zh: '鸡肉比里亚尼饭', ja: 'チキンビリヤニ' },
};
const cuisineMembers = {
  'foods-malaysian-cuisine': [
    'foods-hainanese-chicken-rice', 'foods-nasi-kandar', 'foods-roti-canai', 'foods-bak-kut-teh',
  ],
  'foods-indian-cuisine': ['foods-chicken-biryani'],
};

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', async (route) => route.fulfill({
    contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'text/plain', body: '',
  }));
  await page.route('**/api/site-stats', async (route) => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ views: 128, visitors: 64, online: 3 }),
  }));
  // These are actual viewport, content and navigation checks; native touch and
  // moving-scene performance are outside this stable reduced-motion fixture.
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function expectSelected(root: Locator, id: string, lang: Locale) {
  await expect(root.locator('[data-beyond-detail]')).toBeVisible();
  await expect(root.locator('[data-node][aria-pressed="true"]')).toHaveCount(1);
  await expect(root.locator(`[data-node="${id}"]`)).toHaveAttribute('aria-pressed', 'true');
  await expect(root.locator('[data-detail-title]')).toHaveText(labels[id][lang]);
}

async function expectRelated(root: Locator, ids: readonly string[], relationship: string) {
  const links = root.locator('[data-detail-links] [data-related-node]');
  await expect(links).toHaveCount(ids.length);
  expect(await links.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-related-node')).sort()))
    .toEqual([...ids].sort());
  for (const id of ids) {
    await expect(root.locator(`[data-related-node="${id}"] small`)).toHaveText(relationship);
  }
}

async function expectLicensedPhoto(page: Page, root: Locator, id: string, resizeNote: RegExp) {
  const expected = media[id];
  expect(expected, `Missing licensed media record for ${id}`).toBeDefined();
  expect(expected.artwork).toBe(`/images/beyond-code/${id}.webp`);
  const image = root.locator('[data-detail-image] img');
  await expect(image).toHaveAttribute('src', expected.artwork);
  await expect.poll(() => image.evaluate((element) => {
    const photo = element as HTMLImageElement;
    return photo.complete && photo.naturalWidth > 0 && photo.naturalHeight > 0;
  })).toBe(true);
  await expect(root.locator('[data-detail-description]')).toHaveText(expected.description);

  const credit = root.locator('[data-detail-credit]');
  await expect(credit).toBeVisible();
  await credit.scrollIntoViewIfNeeded();
  expect(expected.artworkCredit.trim()).not.toBe('');
  await expect(credit).toContainText(expected.artworkCredit);
  await expect(credit).toContainText(resizeNote);
  await expect(credit).toContainText('WebP');
  const links = credit.locator('a');
  await expect(links).toHaveCount(2);
  await expect(links.nth(0)).toHaveText(expected.artworkTitle);
  await expect(links.nth(0)).toHaveAttribute('href', new URL(expected.artworkUsageSource).href);
  await expect(links.nth(1)).toHaveText(expected.artworkLicenseName);
  await expect(links.nth(1)).toHaveAttribute('href', new URL(expected.artworkLicenseUrl).href);
  await expect(links.nth(1)).toHaveText(/CC\s*BY|Creative Commons/i);
  for (const link of await links.all()) {
    const url = new URL((await link.getAttribute('href'))!);
    expect(url.protocol).toBe('https:');
    expect(url.username).toBe('');
    expect(url.password).toBe('');
  }
  expect(new URL(expected.artworkLicenseUrl).hostname).toBe('creativecommons.org');
  const response = await page.request.get(expected.artwork);
  expect(response.ok()).toBe(true);
  return { source: expected.artwork, hash: createHash('sha256').update(await response.body()).digest('hex') };
}

async function expectNoHorizontalOverflow(root: Locator) {
  const bounds = await root.locator('[data-beyond-detail]').evaluate((detail) => {
    const rectangle = (selector: string) => {
      const box = detail.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
      return { left: box.left, right: box.right };
    };
    return {
      image: rectangle('[data-detail-image]'), copy: rectangle('.beyond-detail-copy'),
      title: rectangle('[data-detail-title]'), credit: rectangle('[data-detail-credit]'),
      width: detail.clientWidth, scrollWidth: detail.scrollWidth,
      pageWidth: document.documentElement.clientWidth, pageScrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(bounds.title.left).toBeGreaterThanOrEqual(bounds.image.right - 1);
  expect(bounds.credit.left).toBeGreaterThanOrEqual(bounds.copy.left - 1);
  expect(bounds.credit.right).toBeLessThanOrEqual(bounds.copy.right + 1);
  expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1);
  expect(bounds.pageScrollWidth).toBeLessThanOrEqual(bounds.pageWidth + 1);
}

for (const locale of [
  { lang: 'en' as const, prefix: '', viewport: { width: 1280, height: 900 }, dish: 'Dish', cuisine: 'Cuisine', resize: /Resized/i },
  { lang: 'zh' as const, prefix: '/zh', viewport: { width: 390, height: 844 }, dish: '菜品', cuisine: '所属料理', resize: /缩略/ },
  { lang: 'ja' as const, prefix: '/ja', viewport: { width: 320, height: 844 }, dish: '料理', cuisine: '料理の分類', resize: /縮小/ },
]) {
  test(`${locale.lang} Malaysia and India labels, aliases, photos, cuisine links and Back work at ${locale.viewport.width}px`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize(locale.viewport);
    expect(page.viewportSize()).toEqual(locale.viewport);
    await page.goto(`${locale.prefix}/beyond-code/`, { waitUntil: 'domcontentloaded' });
    const root = page.locator('[data-beyond]');
    await expect(root).toHaveClass(/is-ready/);
    expect(await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))).toEqual(locale.viewport);
    const payload = JSON.parse((await root.locator('[data-beyond-data]').textContent())!) as { nodes: unknown[]; edges: unknown[] };
    expect(payload.nodes).toHaveLength(124);
    expect(payload.edges).toHaveLength(65);
    await root.locator('[data-beyond-category="foods"]').click();
    await root.locator('[data-beyond-view="index"]').click();
    const index = root.locator('[data-beyond-index]');
    const search = root.locator('[data-beyond-search]');
    const back = root.locator('[data-beyond-back]');
    const sources = new Set<string>();
    const hashes = new Set<string>();
    for (const id of Object.keys(labels)) {
      await expect(root.locator(`[data-index-node="${id}"]`)).toBeVisible();
      await expect(root.locator(`[data-index-node="${id}"]`)).toHaveText(labels[id][locale.lang]);
    }

    for (const id of Object.keys(labels)) {
      // Search another locale's name as well as the requested regional spelling.
      const query = id === 'foods-chicken-biryani' ? 'Chicken briyani'
        : labels[id][locale.lang === 'en' ? 'zh' : 'en'];
      const item = root.locator(`[data-index-node="${id}"]`);
      if (id === 'foods-chicken-biryani') {
        await search.fill('Chicken biryani');
        await expect(item).toBeVisible();
      }
      await search.fill(query);
      await expect(index.locator('[data-index-node]:visible')).toHaveCount(1);
      await expect(item).toBeVisible();
      await expect(item).toHaveText(labels[id][locale.lang]);
      await item.press('Enter');
      await expectSelected(root, id, locale.lang);
      const photo = await expectLicensedPhoto(page, root, id, locale.resize);
      sources.add(photo.source); hashes.add(photo.hash);
      if (locale.viewport.width < 640) await expectNoHorizontalOverflow(root);
      await back.click();
      await expect(index).toBeVisible();
      await expect(root.locator('[data-beyond-detail]')).toBeHidden();
      await expect(search).toHaveValue(query);
      await expect(root.locator('[data-beyond-category="foods"]')).toHaveAttribute('aria-pressed', 'true');
    }
    expect(sources.size).toBe(7);
    expect(hashes.size).toBe(7);

    await search.fill('');
    for (const [parent, dishes] of Object.entries(cuisineMembers)) {
      await root.locator(`[data-index-node="${parent}"]`).press('Enter');
      await expectSelected(root, parent, locale.lang);
      await expectRelated(root, dishes, locale.dish);
      for (const child of dishes) {
        const link = root.locator(`[data-related-node="${child}"]`);
        await expect(link.locator('strong')).toHaveText(labels[child][locale.lang]);
        await link.click();
        await expectSelected(root, child, locale.lang);
        await expectRelated(root, [parent], locale.cuisine);
        await back.click();
        await expectSelected(root, parent, locale.lang);
        await expectRelated(root, dishes, locale.dish);
      }
      await back.click();
      await expect(index).toBeVisible();
      await expect(search).toHaveValue('');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

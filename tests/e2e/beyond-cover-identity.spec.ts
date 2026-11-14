import { expect, test, type Locator, type Page } from '@playwright/test';

const pairs = [
  { parent: 'movies-indiana-jones-series', child: 'movies-raiders-of-the-lost-ark-1981' },
  { parent: 'movies-terminator-series', child: 'movies-the-terminator-1984' },
  { parent: 'topics-analytical-psychology', child: 'topics-carl-jung' },
];
const series = pairs.slice(0, 2);

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

async function expectLoaded(image: Locator) {
  await expect(image).toHaveCount(1);
  await expect.poll(() => image.evaluate((element) => {
    const image = element as HTMLImageElement;
    return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  })).toBe(true);
}

for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
  test(`related collection covers remain distinct and franchise logos stay complete at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    expect(page.viewportSize()).toEqual(viewport);
    await mockRuntimeServices(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/beyond-code/', { waitUntil: 'domcontentloaded' });
    const root = page.locator('[data-beyond]');
    await expect(root).toHaveClass(/is-ready/);
    expect(await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))).toEqual(viewport);

    const graphImage = (id: string) => root.locator(`[data-node="${id}"] .beyond-node-art img`);
    const graphSources = new Map<string, string>();
    // All six covers load even when compact All initially places another
    // category offscreen. The hash-level companion test rejects renamed copies.
    for (const { parent, child } of pairs) {
      for (const id of [parent, child]) {
        const image = graphImage(id);
        await expectLoaded(image);
        const src = (await image.getAttribute('src'))!;
        expect(src).toMatch(/^\/images\/beyond-code\/thumbnails\//);
        graphSources.set(id, src);
      }
      expect(graphSources.get(parent)).not.toBe(graphSources.get(child));
    }

    for (const { parent, child } of series) {
      await expect(graphImage(parent)).toHaveCSS('object-fit', 'contain');
      await root.locator(`[data-node="${child}"]`).press('Enter');
      const detail = root.locator('[data-beyond-detail]');
      await expect(detail).toBeVisible();
      await expect(root.locator(`[data-node="${child}"]`)).toHaveAttribute('aria-pressed', 'true');
      const relatedImage = detail.locator(`[data-related-node="${parent}"] img`);
      await relatedImage.scrollIntoViewIfNeeded();
      await expectLoaded(relatedImage);
      await expect(relatedImage).toHaveAttribute('src', graphSources.get(parent)!);
      await expect(relatedImage).toHaveCSS('object-fit', 'contain');
    }

    await root.locator('[data-beyond-view="index"]').click();
    const index = root.locator('[data-beyond-index]');
    await expect(index).toBeVisible();
    for (const { parent } of series) {
      const image = index.locator(`[data-index-node="${parent}"] img`);
      await image.scrollIntoViewIfNeeded();
      await expectLoaded(image);
      await expect(image).toHaveCSS('object-fit', 'contain');
    }
  });
}

import { expect, test, type Page } from '@playwright/test';

type Point = { x: number; y: number };
type CapturedLine = { from: Point; to: Point; matrix: number[] };
type LineCapture = { frame: number; lines: CapturedLine[] };
type CaptureWindow = typeof window & { __beyondLineCapture?: LineCapture };

async function instrumentActualLines(page: Page) {
  await page.addInitScript(() => {
    const state = window as CaptureWindow;
    state.__beyondLineCapture = { frame: 0, lines: [] };
    const paths = new WeakMap<CanvasRenderingContext2D, { cursor: Point | null; lines: { from: Point; to: Point }[] }>();
    const target = (context: CanvasRenderingContext2D) => context.canvas instanceof HTMLCanvasElement
      && context.canvas.hasAttribute('data-beyond-canvas');
    const prototype = CanvasRenderingContext2D.prototype;
    const clearRect = prototype.clearRect;
    const beginPath = prototype.beginPath;
    const moveTo = prototype.moveTo;
    const lineTo = prototype.lineTo;
    const stroke = prototype.stroke;

    prototype.clearRect = function (this: CanvasRenderingContext2D, ...args: Parameters<typeof clearRect>) {
      if (target(this)) {
        state.__beyondLineCapture!.frame++;
        state.__beyondLineCapture!.lines = [];
      }
      clearRect.apply(this, args);
    };
    prototype.beginPath = function (this: CanvasRenderingContext2D) {
      if (target(this)) paths.set(this, { cursor: null, lines: [] });
      beginPath.call(this);
    };
    prototype.moveTo = function (this: CanvasRenderingContext2D, x: number, y: number) {
      if (target(this)) {
        const path = paths.get(this) ?? { cursor: null, lines: [] };
        path.cursor = { x, y };
        paths.set(this, path);
      }
      moveTo.call(this, x, y);
    };
    prototype.lineTo = function (this: CanvasRenderingContext2D, x: number, y: number) {
      if (target(this)) {
        const path = paths.get(this);
        if (path?.cursor) {
          path.lines.push({ from: { ...path.cursor }, to: { x, y } });
          path.cursor = { x, y };
        }
      }
      lineTo.call(this, x, y);
    };
    prototype.stroke = function (this: CanvasRenderingContext2D, path?: Path2D) {
      if (target(this) && !path) {
        const transform = this.getTransform();
        const matrix = [transform.a, transform.b, transform.c, transform.d, transform.e, transform.f];
        for (const line of paths.get(this)?.lines ?? []) {
          state.__beyondLineCapture!.lines.push({ from: { ...line.from }, to: { ...line.to }, matrix });
        }
      }
      Reflect.apply(stroke, this, path ? [path] : []);
    };
  });
}

async function contactSample(page: Page) {
  return page.evaluate(() => {
    const capture = (window as CaptureWindow).__beyondLineCapture;
    const canvas = document.querySelector<HTMLCanvasElement>('[data-beyond-canvas]')!;
    const rect = canvas.getBoundingClientRect();
    const style = getComputedStyle(canvas);
    const inset = (name: string) => Number.parseFloat(style.getPropertyValue(name)) || 0;
    const left = inset('border-left-width') + inset('padding-left');
    const right = inset('border-right-width') + inset('padding-right');
    const top = inset('border-top-width') + inset('padding-top');
    const bottom = inset('border-bottom-width') + inset('padding-bottom');
    const scaleX = (rect.width - left - right) / canvas.width;
    const scaleY = (rect.height - top - bottom) / canvas.height;
    const circle = (id: string) => {
      const artwork = document.querySelector<HTMLElement>(`[data-node="${id}"] .beyond-node-art`)!;
      const box = artwork.getBoundingClientRect();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2,
        radius: box.width / 2, width: box.width, height: box.height,
        boxSizing: getComputedStyle(artwork).boxSizing };
    };
    const lines = (capture?.lines ?? []).map((line) => {
      const [a, b, c, d, e, f] = line.matrix;
      const project = (point: Point) => ({
        x: rect.x + left + (a * point.x + c * point.y + e) * scaleX,
        y: rect.y + top + (b * point.x + d * point.y + f) * scaleY,
      });
      return { from: project(line.from), to: project(line.to) };
    });
    return { frame: capture?.frame ?? 0, lines,
      source: circle('music-lemon'), target: circle('person-kenshi-yonezu') };
  });
}

async function expectArtworkContact(page: Page) {
  // With reduced motion, two animation frames allow the requested camera/size
  // update to paint. We inspect native drawing calls, not the clipping helper.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect.poll(async () => (await contactSample(page)).lines.length).toBe(1);
  const sample = await contactSample(page);
  expect(sample.frame).toBeGreaterThan(0);
  expect(sample.source.boxSizing).toBe('border-box');
  expect(sample.target.boxSizing).toBe('border-box');
  expect(Math.abs(sample.source.width - sample.source.height)).toBeLessThan(0.1);
  expect(Math.abs(sample.target.width - sample.target.height)).toBeLessThan(0.1);
  const line = sample.lines[0];
  const sourceGap = Math.hypot(line.from.x - sample.source.x, line.from.y - sample.source.y) - sample.source.radius;
  const targetGap = Math.hypot(line.to.x - sample.target.x, line.to.y - sample.target.y) - sample.target.radius;
  // Subpixel CSS/bitmap rounding may differ slightly. The removed invisible
  // orbit plus padding produced a roughly 9px gap, far beyond this 1px bound.
  expect(Math.abs(sourceGap), `Source endpoint gap: ${sourceGap}px`).toBeLessThan(1);
  expect(Math.abs(targetGap), `Target endpoint gap: ${targetGap}px`).toBeLessThan(1);
  const dx = sample.target.x - sample.source.x;
  const dy = sample.target.y - sample.source.y;
  const distance = Math.hypot(dx, dy);
  const perpendicular = (point: Point) => Math.abs((point.x - sample.source.x) * dy - (point.y - sample.source.y) * dx) / distance;
  expect(perpendicular(line.from)).toBeLessThan(1);
  expect(perpendicular(line.to)).toBeLessThan(1);
  expect((line.to.x - line.from.x) * dx + (line.to.y - line.from.y) * dy).toBeGreaterThan(0);
}

for (const fixture of [
  { name: 'desktop', viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
]) {
  test.describe(`${fixture.name} line-to-artwork contact`, () => {
    test.use({ viewport: fixture.viewport, deviceScaleFactor: fixture.deviceScaleFactor });
    test('native canvas endpoints meet real circles after filtering, selection and paused zoom', async ({ page }) => {
      await page.route('https://**/*', async (route) => route.fulfill({
        contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'text/plain', body: '',
      }));
      await page.route('**/api/site-stats', async (route) => route.fulfill({
        contentType: 'application/json', body: JSON.stringify({ views: 128, visitors: 64, online: 3 }),
      }));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await instrumentActualLines(page);
      await page.goto('/beyond-code/', { waitUntil: 'domcontentloaded' });
      const root = page.locator('[data-beyond]');
      await expect(root).toHaveClass(/is-ready/);
      await root.locator('[data-beyond-search]').fill('Lemon');
      await expect(root.locator('[data-node]:not([hidden])')).toHaveCount(2);
      await expectArtworkContact(page);

      await root.locator('[data-node="music-lemon"]').press('Enter');
      await expect(root.locator('[data-beyond-detail]')).toBeVisible();
      await expect(root.locator('[data-related-node="person-kenshi-yonezu"]')).toBeVisible();
      await expectArtworkContact(page);
      await root.locator('[data-beyond-zoom="in"]').click();
      await expectArtworkContact(page);
      await root.locator('[data-beyond-zoom="out"]').click();
      await expectArtworkContact(page);
      await root.locator('[data-beyond-zoom="out"]').click();
      await root.locator('[data-beyond-zoom="out"]').click();
      await expectArtworkContact(page);
      if (fixture.name === 'mobile') {
        const sample = await contactSample(page);
        expect(Math.min(sample.source.width, sample.target.width)).toBeLessThan(44);
      }
    });
  });
}

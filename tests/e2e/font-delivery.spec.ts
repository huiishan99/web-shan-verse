import { expect, test, type Page } from '@playwright/test';

type FontProbe = { family: string; weight: number; style?: string; text: string };

test('Chinese About copy renders Han glyphs without a second CJK typeface', async ({ page }) => {
  await page.goto('/zh/about/');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  try {
    const { root } = await session.send('DOM.getDocument');
    const selector = '.intro-text, .intro-text .highlight, .timeline-location, .timeline-desc, .language-level, .world-entry-description, .world-entry-link';
    const { nodeIds } = await session.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector });
    expect(nodeIds.length).toBeGreaterThan(10);
    for (const nodeId of nodeIds) {
      const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
      expect(fonts.length).toBeGreaterThan(0);
      // A computed family list cannot reveal per-character fallback. Inspect
      // Chromium's actual glyph providers, retaining the original Latin face.
      for (const font of fonts) {
        expect(font.isCustomFont, JSON.stringify(font)).toBe(true);
        expect(font.postScriptName, JSON.stringify(font)).toMatch(/^(ZhuqueFangsong|Crimson-?Pro)/);
      }
    }
  } finally {
    await session.detach();
  }
});

const latinProbes: FontProbe[] = [
  { family: 'Cinzel', weight: 400, text: 'BEYOND CODE' },
  { family: 'Cinzel', weight: 600, text: 'Signal Map' },
  { family: 'Cinzel', weight: 700, text: 'SHAN VERSE' },
  { family: 'Cormorant Garamond', weight: 500, text: 'Timeline' },
  { family: 'Cormorant Garamond', weight: 600, text: 'A personal collection' },
  { family: 'Cormorant Garamond', weight: 700, text: 'Projects' },
  { family: 'Crimson Pro', weight: 300, text: 'Curiosity fuels the journey.' },
  { family: 'Crimson Pro', weight: 400, text: 'Les Misérables — Queen’s music' },
  { family: 'Crimson Pro', weight: 500, text: 'About Me' },
  { family: 'Crimson Pro', weight: 600, text: 'Experience' },
  { family: 'Crimson Pro', weight: 400, style: 'italic', text: 'Curiosity fuels the journey.' },
  { family: 'JetBrains Mono', weight: 400, text: '2026 0123456789' },
  { family: 'JetBrains Mono', weight: 500, text: '2026 0123456789' },
];

async function observeActualFonts(page: Page) {
  const googleRequests: string[] = [];
  const failures: string[] = [];
  const fontResponses: Promise<{ url: string; status: number; signature: string; bytes: number }>[] = [];
  await page.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, async (route) => {
    googleRequests.push(route.request().url());
    await route.abort('blockedbyclient');
  });
  await page.route('**/api/site-stats', async (route) => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ views: 128, visitors: 64, online: 3 }),
  }));
  await page.addInitScript(() => {
    const state = window as typeof window & { __fontLoadingErrors?: number };
    state.__fontLoadingErrors = 0;
    document.fonts.addEventListener('loadingerror', () => state.__fontLoadingErrors!++);
  });
  page.on('requestfailed', (request) => {
    if (request.resourceType() === 'font') failures.push(request.url());
  });
  page.on('response', (response) => {
    if (response.request().resourceType() !== 'font') return;
    fontResponses.push(response.body().then((body) => ({
      url: response.url(), status: response.status(), signature: body.subarray(0, 4).toString('ascii'), bytes: body.byteLength,
    })));
  });
  return async () => {
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const responses = await Promise.all(fontResponses);
    expect(responses.length).toBeGreaterThan(0);
    for (const response of responses) {
      expect(new URL(response.url).origin).toBe(new URL(page.url()).origin);
      expect(new URL(response.url).pathname).toMatch(/^\/fonts\//);
      expect(response.status).toBe(200);
      expect(response.signature).toBe('wOF2');
      expect(response.bytes).toBeGreaterThan(48);
    }
    expect(googleRequests).toEqual([]);
    expect(failures).toEqual([]);
    expect(await page.evaluate(() => (window as typeof window & { __fontLoadingErrors?: number }).__fontLoadingErrors)).toBe(0);
    await expect(page.locator('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]')).toHaveCount(0);
  };
}

async function requireFaces(page: Page, probes: FontProbe[]) {
  const results = await page.evaluate(async (entries) => Promise.all(entries.map(async (probe) => {
    const faces = await document.fonts.load(`${probe.style ?? 'normal'} ${probe.weight} 18px "${probe.family}"`, probe.text);
    return { probe, faces: faces.map((face) => ({ family: face.family.replace(/^['"]|['"]$/g, ''),
      weight: face.weight, style: face.style, status: face.status })) };
  })), probes);
  for (const { probe, faces } of results) {
    expect(faces.length, `No real face selected for ${probe.family} ${probe.weight} ${probe.style ?? 'normal'}`).toBeGreaterThan(0);
    for (const face of faces) {
      expect(face.family).toBe(probe.family);
      expect(face.status).toBe('loaded');
      expect(face.style).toBe(probe.style ?? 'normal');
      expect(face.weight).toBe(String(probe.weight));
    }
  }
}

for (const locale of ['en', 'zh', 'ja']) {
  test(`${locale} typography loads real local faces with Google font services blocked`, async ({ page }) => {
    const assertDelivery = await observeActualFonts(page);
    await page.goto(locale === 'en' ? '/' : `/${locale}/`);
    await requireFaces(page, latinProbes);
    const cjkFamily = locale === 'ja' ? 'Shippori Mincho' : 'Noto Serif SC';
    await requireFaces(page, [400, 500, 600, 700].map((weight) => ({
      family: cjkFamily, weight, text: locale === 'ja' ? '日本語 仮名 カタカナ' : '中文 简体 繁體 漢字',
    })));
    const styles = await page.evaluate(() => Object.fromEntries([
      ['body', 'body'], ['navigation', '.nav-links a'], ['tagline', '.hero-tagline'], ['intro', '.hero-intro'],
    ].map(([name, selector]) => {
        const element = document.querySelector(selector)!;
        const style = getComputedStyle(element);
        return [name, { family: style.fontFamily, weight: style.fontWeight, style: style.fontStyle }];
      })));
    expect(styles.body.family).toContain('Crimson Pro');
    expect(styles.body.family).toContain(cjkFamily);
    expect(styles.tagline.style).toBe('italic');
    if (locale === 'zh') {
      expect(styles.navigation.family).toContain('Zhuque Fangsong Navigation');
      expect(styles.tagline.family).toContain('Zhuque Fangsong Home');
      expect(styles.intro.family).toContain('Zhuque Fangsong Home');
    } else expect(styles.navigation.family).not.toContain('Zhuque Fangsong');
    // Existing About dates ask for 700, while the delivered Mono family ends at
    // 500. Keep that nearest-face/synthetic-bold behavior instead of adding 700.
    const mono700 = await page.evaluate(async () => (await document.fonts.load('700 18px "JetBrains Mono"', '2026'))
      .map((face) => ({ weight: face.weight, status: face.status })));
    expect(mono700.length).toBeGreaterThan(0);
    expect(mono700.every((face) => face.weight === '500' && face.status === 'loaded')).toBe(true);
    const preloads = page.locator('link[rel="preload"][as="font"]');
    await expect(preloads).toHaveCount(2);
    for (const preload of await preloads.all()) {
      await expect(preload).toHaveAttribute('href', /^\/fonts\/google\/.+\.woff2$/);
      expect(await preload.getAttribute('crossorigin')).not.toBeNull();
    }
    await assertDelivery();
  });
}

test('local fonts and multilingual stacks survive SPA locale changes and unfamiliar reader text', async ({ page }) => {
  const assertDelivery = await observeActualFonts(page);
  await page.goto('/zh/');
  await page.evaluate(() => {
    (window as typeof window & { __fontDeliveryDocument?: string }).__fontDeliveryDocument = 'same-document';
  });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.locator('.nav-links a[href="/zh/about/"]').click();
  await expect(page).toHaveURL(/\/zh\/about\/$/);
  expect(await page.locator('.intro-text').first().evaluate((element) => getComputedStyle(element).fontFamily))
    .toContain('Zhuque Fangsong About Supplement');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.locator('.language-link[lang="ja"]').click();
  await expect(page).toHaveURL(/\/ja\/about\/$/);
  const japaneseAbout = await page.locator('.intro-text').first().evaluate((element) => getComputedStyle(element).fontFamily);
  expect(japaneseAbout).toContain('Zhuque Fangsong About');
  expect(japaneseAbout).toContain('Shippori Mincho');
  expect(japaneseAbout).not.toContain('Zhuque Fangsong About Supplement');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // The shared Explore disclosure also links here; this flow uses About's entry.
  await page.locator('.world-entry-link[href="/ja/beyond-code/"]').click();
  await expect(page).toHaveURL(/\/ja\/beyond-code\/$/);
  await expect(page.locator('[data-beyond]')).toHaveClass(/is-ready/);
  expect(await page.locator('.beyond-subtitle').evaluate((element) => getComputedStyle(element).fontFamily))
    .toContain('Zhuque Fangsong Page Subtitle');
  const readerText = '漢字 仮名 カタカナ 髙橋 𠮷 é œ Ω Ж 😊';
  await requireFaces(page, [
    { family: 'Crimson Pro', weight: 400, style: 'italic', text: 'Beyond Code' },
    { family: 'Shippori Mincho', weight: 400, text: '日本語 龘 髙 𠮷' },
    { family: 'Noto Serif SC', weight: 400, text: `龘 ${readerText}` },
  ]);
  // This is a dynamic-reader-text load probe, not a claim that every rare glyph
  // belongs to one web font. OS/emoji fallback remains an intentional boundary.
  expect(await page.evaluate(() => (window as typeof window & { __fontDeliveryDocument?: string }).__fontDeliveryDocument))
    .toBe('same-document');
  await assertDelivery();
});

test('a paused caption measures again when its real fonts arrive after first focus', async ({ page }) => {
  const assertDelivery = await observeActualFonts(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const title = '刺客信条系列';
  await page.addInitScript((targetTitle) => {
    const state = window as typeof window & { __captionMeasurements?: { count: number; fonts: string[] } };
    state.__captionMeasurements = { count: 0, fonts: [] };
    const measure = CanvasRenderingContext2D.prototype.measureText;
    CanvasRenderingContext2D.prototype.measureText = function (text) {
      if (text === targetTitle) {
        state.__captionMeasurements!.count++;
        state.__captionMeasurements!.fonts.push(this.font);
      }
      return measure.call(this, text);
    };
  }, title);
  let releaseFonts!: () => void;
  const fontGate = new Promise<void>((resolve) => { releaseFonts = resolve; });
  let heldFonts = 0;
  await page.route(/\/fonts\/.+\.woff2(?:\?.*)?$/, async (route) => {
    heldFonts++;
    await fontGate;
    await route.continue();
  });
  const measurements = () => page.evaluate(() => (
    window as typeof window & { __captionMeasurements?: { count: number; fonts: string[] } }
  ).__captionMeasurements!);
  try {
    // Fonts are deliberately slow, not mocked or replaced. The real page must
    // remain interactive before load and render this caption with swap fallback.
    await page.goto('/zh/beyond-code/', { waitUntil: 'domcontentloaded' });
    const root = page.locator('[data-beyond]');
    await expect(root).toHaveClass(/is-ready/);
    await expect.poll(() => heldFonts).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.readyState)).toBe('interactive');
    await root.locator('[data-beyond-category="games"]').press('Enter');
    const motion = root.locator('[data-beyond-motion]');
    await motion.press('Enter');
    await expect(motion).toHaveAttribute('aria-pressed', 'false');
    const node = root.locator('[data-node="games-assassins-creed-series"]');
    await node.focus();
    await expect.poll(async () => (await measurements()).count).toBeGreaterThan(0);
    const before = await measurements();
    releaseFonts();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    // A one-time cached fallback measurement would never increase here, even
    // though the displayed glyphs have switched to their requested web fonts.
    await expect.poll(async () => (await measurements()).count).toBeGreaterThan(before.count);
    const after = await measurements();
    const label = node.locator('.beyond-node-label');
    await expect(label).toBeVisible();
    await expect(label.locator('[data-node-label-title]')).toHaveText(title);
    const labelStyle = await label.evaluate((element) => {
      const style = getComputedStyle(element);
      return { family: style.fontFamily, fontSize: parseFloat(style.fontSize), visibility: style.visibility };
    });
    const normalizeFamilies = (value: string) => value.replace(/["']/g, '').split(',').map((family) => family.trim());
    const measuredFamilies = after.fonts.at(-1)!.replace(/^.*?px\s+/, '');
    expect(normalizeFamilies(measuredFamilies)).toEqual(normalizeFamilies(labelStyle.family));
    expect(labelStyle.family).toContain('Zhuque Fangsong About');
    expect(labelStyle.family).toContain('Noto Serif SC');
    expect(labelStyle.fontSize).toBeGreaterThanOrEqual(13);
    expect(labelStyle.visibility).toBe('visible');
    await assertDelivery();
  } finally {
    releaseFonts();
  }
});

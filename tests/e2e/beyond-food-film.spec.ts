import { createHash } from 'node:crypto';
import { expect, test, type Locator, type Page } from '@playwright/test';

const desktop = { width: 1280, height: 900 };
const mobile = { width: 390, height: 844 };
const newFoods = [
  { id: 'foods-japanese-cuisine', author: 'Strrouberry', file: 'Repas_traditionnel_japonais.jpg', license: '/licenses/by-sa/4.0' },
  { id: 'foods-kitakata-ramen', author: 'macyu', file: 'Kitakata_ramen_by_macyu_in_Yamagata.jpg', license: '/licenses/by/2.0' },
  { id: 'foods-hakata-ramen', author: 'Hykw-a4', file: 'Hakataramen222.jpg', license: '/licenses/by-sa/3.0' },
  { id: 'foods-natto', author: 'Gleam', file: 'Natto_mixed.jpg', license: '/licenses/by-sa/3.0' },
  { id: 'foods-chinese-cuisine', author: 'Uwe Aranas', file: 'Assortment-of-Chinese-Dishes-01.jpg', license: '/licenses/by-sa/3.0' },
  { id: 'foods-kaoyu', author: 'ZhengZhou', file: 'Grilled_Fish_with_Douhua.jpg', license: '/licenses/by-sa/4.0' },
  { id: 'foods-jianbing-guozi', author: 'Xrdtj', file: 'Jianbing_Guozi_20170610.jpg', license: '/licenses/by-sa/4.0' },
  { id: 'foods-tomato-and-egg', author: 'Huangdan2060', file: 'Hunan_cuisine,_stir-fried_tomato_with_eggs.jpg', license: '/licenses/by/3.0' },
  { id: 'foods-twice-cooked-pork', author: 'Alpha', file: 'Twice-cooked_Pork_回锅肉_(1648213963).jpg', license: '/licenses/by-sa/2.0' },
  { id: 'foods-kou-shui-ji', author: 'Liu Nan', file: 'Koushuiji.jpg', license: '/licenses/by-sa/4.0' },
];

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', async (route) => route.fulfill({
    contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'text/plain',
    body: '',
  }));
  await page.route('**/api/site-stats', async (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ views: 128, visitors: 64, online: 3 }),
  }));
  // Content and return-point checks use stable targets; these are not native
  // moving-scene or touchscreen gesture assertions.
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function openCollection(page: Page, viewport: typeof desktop, prefix = '/zh') {
  await page.setViewportSize(viewport);
  expect(page.viewportSize()).toEqual(viewport);
  await page.goto(`${prefix}/beyond-code/`, { waitUntil: 'domcontentloaded' });
  const root = page.locator('[data-beyond]');
  await expect(root).toHaveClass(/is-ready/);
  expect(await page.evaluate(() => ({ width: innerWidth, height: innerHeight }))).toEqual(viewport);
  return root;
}

async function expectLoaded(image: Locator) {
  await expect(image).toHaveCount(1);
  await expect.poll(() => image.evaluate((element) => {
    const image = element as HTMLImageElement;
    return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  })).toBe(true);
}

async function expectSelected(root: Locator, id: string) {
  await expect(root.locator('[data-beyond-detail]')).toBeVisible();
  await expect(root.locator('[data-node][aria-pressed="true"]')).toHaveCount(1);
  await expect(root.locator(`[data-node="${id}"]`)).toHaveAttribute('aria-pressed', 'true');
}

async function expectRelated(root: Locator, ids: string[]) {
  const related = root.locator('[data-detail-links] [data-related-node]');
  await expect(related).toHaveCount(ids.length);
  expect(await related.evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-related-node')).sort()))
    .toEqual([...ids].sort());
}

async function expectFoodCredit(root: Locator, food: typeof newFoods[number], resizeNote: RegExp) {
  const credit = root.locator('[data-detail-credit]');
  await expect(credit).toBeVisible();
  await credit.scrollIntoViewIfNeeded();
  await expect(credit).toContainText(food.author);
  await expect(credit).toContainText(resizeNote);
  await expect(credit).toContainText(/WebP/i);
  const source = credit.locator('a[href*="/wiki/File:"], a[href*="title=File"]');
  await expect(source).toHaveCount(1);
  await expect(source).toHaveText(/\S/);
  const sourceUrl = new URL((await source.getAttribute('href'))!);
  expect(sourceUrl.protocol).toBe('https:');
  expect(sourceUrl.hostname).toBe('commons.wikimedia.org');
  const fileTitle = sourceUrl.searchParams.get('title') ?? decodeURIComponent(sourceUrl.pathname.slice('/wiki/'.length));
  expect(fileTitle.replaceAll(' ', '_')).toBe(`File:${food.file}`);
  const license = credit.locator('a[href^="https://creativecommons.org/"]');
  await expect(license).toHaveCount(1);
  await expect(license).toHaveText(/CC\s*BY|Creative Commons/i);
  expect(new URL((await license.getAttribute('href'))!).pathname.replace(/\/$/, '')).toBe(food.license);
}

for (const locale of [
  { prefix: '', query: 'Source Code', title: 'Source Code', natto: 'Nattō', resize: /resiz|thumbnail/i },
  { prefix: '/zh', query: '源代码', title: '源代码', natto: '纳豆', resize: /缩放|缩小|缩略|调整尺寸|等比/ },
  { prefix: '/ja', query: 'ミッション：8ミニッツ', title: 'ミッション：8ミニッツ', natto: '納豆', resize: /縮小|リサイズ/ },
]) {
  test(`Source Code search, poster and localized food credit work for ${locale.prefix || 'English'}`, async ({ page }) => {
    const root = await openCollection(page, desktop, locale.prefix);
    const search = root.locator('[data-beyond-search]');
    const index = root.locator('[data-beyond-index]');
    const back = root.locator('[data-beyond-back]');
    await root.locator('[data-beyond-view="index"]').click();
    await search.fill(locale.query);
    const film = root.locator('[data-index-node="movies-source-code"]');
    await expect(film).toBeVisible();
    await expect(film).toContainText(locale.title);
    await expect(film).not.toContainText(/\b2011\b/);
    await film.press('Enter');
    await expectSelected(root, 'movies-source-code');
    await expect(root.locator('[data-detail-title]')).toHaveText(locale.title);
    await expect(root.locator('[data-node="movies-source-code"] [data-node-label-title]')).toHaveText(locale.title);
    const image = root.locator('[data-detail-image] img');
    await expect(image).toHaveAttribute('src', '/images/beyond-code/movies-source-code.webp');
    await expectLoaded(image);
    await expect(root.locator('[data-detail-credit]')).toBeHidden();
    const detail = root.locator('[data-beyond-detail]');
    await expect(detail.locator('textarea, [contenteditable="true"], [data-review], [data-review-editor], [data-review-rating]')).toHaveCount(0);
    await expect(detail.getByRole('button', { name: /review|影评|短评|评分|レビュー|評価/i })).toHaveCount(0);
    await expect(detail.getByText(/write (?:a |my )?review|影评|短评|レビューを書く|個人レビュー/i)).toHaveCount(0);

    await back.click();
    await expect(index).toBeVisible();
    await expect(search).toHaveValue(locale.query);
    await search.fill(locale.natto);
    await root.locator('[data-index-node="foods-natto"]').press('Enter');
    await expectSelected(root, 'foods-natto');
    await expectLoaded(root.locator('[data-detail-image] img'));
    await expectFoodCredit(root, newFoods.find((food) => food.id === 'foods-natto')!, locale.resize);
    await back.click();
    await expect(index).toBeVisible();
    await expect(search).toHaveValue(locale.natto);
    await search.fill(locale.query);
    await film.press('Enter');
    await expectSelected(root, 'movies-source-code');
    // A previous CC food selection must not leak its attribution onto a poster.
    await expect(root.locator('[data-detail-credit]')).toBeHidden();
  });
}

test('desktop cuisine details preserve Japanese ramen branches and the six Chinese dishes', async ({ page }) => {
  const root = await openCollection(page, desktop);
  const payload = JSON.parse((await root.locator('[data-beyond-data]').textContent())!) as {
    nodes: { id: string }[]; edges: { source: string; target: string }[];
  };
  expect(payload.nodes).toHaveLength(124);
  expect(payload.edges).toHaveLength(65);
  expect(payload.nodes.filter((node) => node.id === 'foods-hot-pot')).toHaveLength(1);
  await expect(root.locator('[data-node="foods-hot-pot"]')).toHaveCount(1);
  await expect(root.locator('[data-index-node="foods-hot-pot"]')).toHaveCount(1);
  await root.locator('[data-beyond-category="foods"]').click();
  await root.locator('[data-node="foods-japanese-cuisine"]').press('Enter');
  await expectSelected(root, 'foods-japanese-cuisine');
  await expectRelated(root, ['foods-ramen', 'foods-sushi', 'foods-natto']);
  const related = (id: string) => root.locator(`[data-detail-links] [data-related-node="${id}"]`);
  await related('foods-ramen').click();
  await expectSelected(root, 'foods-ramen');
  await expectRelated(root, ['foods-japanese-cuisine', 'foods-jiro-ramen', 'foods-kitakata-ramen', 'foods-hakata-ramen']);
  await expect(related('foods-japanese-cuisine').locator('small')).toHaveText('所属料理');
  for (const id of ['foods-jiro-ramen', 'foods-kitakata-ramen', 'foods-hakata-ramen']) {
    await expect(related(id).locator('small')).toHaveText('风格');
  }
  await related('foods-kitakata-ramen').click();
  await expectSelected(root, 'foods-kitakata-ramen');
  await expect(related('foods-ramen').locator('small')).toHaveText('所属风格');
  await root.locator('[data-beyond-back]').click();
  await expectSelected(root, 'foods-ramen');
  await root.locator('[data-beyond-back]').click();
  await expectSelected(root, 'foods-japanese-cuisine');
  await expect(root.locator('[data-beyond-category="foods"]')).toHaveAttribute('aria-pressed', 'true');

  await root.locator('[data-node="foods-chinese-cuisine"]').press('Enter');
  await expectSelected(root, 'foods-chinese-cuisine');
  const dishes = [
    { id: 'foods-kaoyu', title: '烤鱼' }, { id: 'foods-jianbing-guozi', title: '煎饼果子' },
    { id: 'foods-hot-pot', title: '火锅' }, { id: 'foods-tomato-and-egg', title: '番茄炒鸡蛋' },
    { id: 'foods-twice-cooked-pork', title: '回锅肉' }, { id: 'foods-kou-shui-ji', title: '口水鸡' },
  ];
  await expectRelated(root, dishes.map((dish) => dish.id));
  for (const dish of dishes) {
    await expect(related(dish.id).locator('strong')).toHaveText(dish.title);
    await expect(related(dish.id).locator('small')).toHaveText('菜品');
  }
  await related('foods-hot-pot').click();
  await expectSelected(root, 'foods-hot-pot');
  await expect(related('foods-chinese-cuisine').locator('small')).toHaveText('所属料理');
  await expect(root.locator('[data-detail-credit]')).toBeHidden();
  await root.locator('[data-beyond-back]').click();
  await expectSelected(root, 'foods-chinese-cuisine');
  await expectRelated(root, dishes.map((dish) => dish.id));
});

test('mobile Index opens ten distinct real food photos with credits and restores its return point', async ({ page }) => {
  const root = await openCollection(page, mobile);
  await root.locator('[data-beyond-category="foods"]').click();
  await root.locator('[data-beyond-view="index"]').click();
  const index = root.locator('[data-beyond-index]');
  const sources = new Set<string>();
  const hashes = new Set<string>();
  for (const food of newFoods) {
    await expect(index).toBeVisible();
    await root.locator(`[data-index-node="${food.id}"]`).press('Enter');
    await expectSelected(root, food.id);
    const image = root.locator('[data-detail-image] img');
    await expect(image).toHaveAttribute('src', `/images/beyond-code/${food.id}.webp`);
    await expectLoaded(image);
    const src = (await image.getAttribute('src'))!;
    sources.add(src);
    // Distinct filenames alone would allow renamed copies of the same cover.
    const response = await page.request.get(src);
    expect(response.ok()).toBe(true);
    hashes.add(createHash('sha256').update(await response.body()).digest('hex'));
    await expectFoodCredit(root, food, /缩放|缩小|缩略|调整尺寸|等比/);
    const bounds = await root.locator('[data-beyond-detail]').evaluate((detail) => {
      const rectangle = (selector: string) => {
        const box = detail.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width };
      };
      return {
        image: rectangle('[data-detail-image]'), copy: rectangle('.beyond-detail-copy'),
        title: rectangle('[data-detail-title]'), credit: rectangle('[data-detail-credit]'),
        detailWidth: detail.clientWidth, detailScrollWidth: detail.scrollWidth,
        pageWidth: document.documentElement.clientWidth,
        pageScrollWidth: document.documentElement.scrollWidth,
      };
    });
    // Credit belongs in the text column; an extra grid child must not push the
    // title into the narrow image column or make source links overflow the page.
    expect(bounds.copy.left).toBeGreaterThanOrEqual(bounds.image.right - 1);
    expect(bounds.title.left).toBeGreaterThanOrEqual(bounds.image.right - 1);
    expect(bounds.title.width).toBeGreaterThan(bounds.image.width);
    expect(bounds.title.right).toBeLessThanOrEqual(bounds.copy.right + 1);
    expect(bounds.credit.left).toBeGreaterThanOrEqual(bounds.copy.left - 1);
    expect(bounds.credit.right).toBeLessThanOrEqual(bounds.copy.right + 1);
    expect(bounds.detailScrollWidth).toBeLessThanOrEqual(bounds.detailWidth + 1);
    expect(bounds.pageScrollWidth).toBeLessThanOrEqual(bounds.pageWidth + 1);
    await root.locator('[data-beyond-back]').click();
    await expect(index).toBeVisible();
    await expect(root.locator('[data-beyond-detail]')).toBeHidden();
    await expect(root.locator('[data-beyond-search]')).toHaveValue('');
    await expect(root.locator('[data-beyond-category="foods"]')).toHaveAttribute('aria-pressed', 'true');
  }
  expect(sources.size).toBe(newFoods.length);
  expect(hashes.size).toBe(newFoods.length);
  await root.locator('[data-index-node="foods-ramen"]').press('Enter');
  await expectSelected(root, 'foods-ramen');
  await expectLoaded(root.locator('[data-detail-image] img'));
  // Description-level CC metadata on an old image is not artwork attribution.
  await expect(root.locator('[data-detail-credit]')).toBeHidden();
});

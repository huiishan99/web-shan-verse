import { expect, test, type Page } from '@playwright/test';

async function mockRuntimeServices(page: Page) {
  const comments = [{
    id: 'existing-comment',
    displayName: 'First Reader',
    body: 'A small signal from the test reader.',
    locale: 'en',
    createdAt: '2026-06-13T08:30:00.000Z',
  }];

  await page.route('https://**/*', async (route) => {
    const url = new URL(route.request().url());

    if (url.hostname === 'github-contributions-api.jogruber.de') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ contributions: [] }),
      });
      return;
    }

    if (url.hostname === 'challenges.cloudflare.com') {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `
          window.turnstile = {
            options: null,
            render(_container, options) {
              this.options = options;
              return 'mock-turnstile-widget';
            },
            execute() {
              queueMicrotask(() => this.options.callback('test-token'));
            },
            reset() {}
          };
        `,
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
  await page.route('**/api/comments**', async (route) => {
    if (route.request().method() === 'POST') {
      const payload = route.request().postDataJSON();
      comments.push({
        id: `comment-${comments.length + 1}`,
        displayName: String(payload.displayName),
        body: String(payload.body),
        locale: payload.locale,
        createdAt: '2026-06-13T09:00:00.000Z',
      });
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, comment: comments.at(-1) }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, comments }),
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
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main h1')).toBeVisible();
  const publicationsFeature = page.locator('.featured-grid .featured-card').first();
  await expect(publicationsFeature).toHaveAttribute('href', '/projects#publications');
  await expect(publicationsFeature.locator('h3')).toHaveText('Publications');
  expect(pageErrors).toEqual([]);
});

test('GitHub activity keeps the designed calendar while contribution data loads', async ({ page }) => {
  let releaseGithubResponse: () => void = () => {};
  const githubResponseGate = new Promise<void>((resolve) => {
    releaseGithubResponse = resolve;
  });

  await page.route('https://github-contributions-api.jogruber.de/v4/**', async (route) => {
    await githubResponseGate;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ contributions: [] }),
    });
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const githubActivity = page.locator('[data-github-activity]');

  await expect(githubActivity).toHaveClass(/is-loading/);
  await expect(githubActivity.locator('.github-calendar--full')).toBeVisible();
  await expect(githubActivity.locator('.github-activity-fallback')).toBeHidden();
  expect(await githubActivity.locator('.github-calendar--full .github-calendar-day').count()).toBeGreaterThan(300);

  releaseGithubResponse();
  await expect(githubActivity).toHaveClass(/is-enhanced/);
  await expect(githubActivity).toHaveAttribute('aria-busy', 'false');
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

test('about resume renders organization logos and keeps them aligned', async ({ page }) => {
  await page.goto('/zh/about');

  const education = page.locator('[data-resume-section="education"]');
  const experience = page.locator('[data-resume-section="experience"]');

  await expect(education.locator('.institution-mark')).toHaveCount(3);
  await expect(education.locator('.institution-mark img')).toHaveCount(3);
  await expect(education.locator('.timeline-organization-link')).toHaveCount(3);
  await expect(education.locator('.institution-mark img').first()).toHaveAttribute('src', '/images/logo-uoa.png');
  await expect(education.locator('.institution-mark img').nth(1)).toHaveAttribute('src', '/images/logo-abk.png');

  const universityLink = education.getByRole('link', { name: '会津大学' });
  await expect(universityLink).toHaveAttribute('href', 'https://u-aizu.ac.jp/en/');
  await expect(universityLink).toHaveAttribute('target', '_blank');
  await expect(universityLink).toHaveCSS('color', 'rgb(245, 245, 245)');
  await universityLink.hover();
  await expect(universityLink).toHaveCSS('color', 'rgb(212, 168, 75)');

  const abkMarkBox = await education.locator('.institution-mark').nth(1).boundingBox();
  const abkLogoBox = await education.locator('.institution-mark img').nth(1).boundingBox();
  expect(abkMarkBox).not.toBeNull();
  expect(abkLogoBox).not.toBeNull();
  expect(abkLogoBox!.height).toBeGreaterThan(40);
  expect(abkLogoBox!.x + abkLogoBox!.width / 2).toBe(abkMarkBox!.x + abkMarkBox!.width / 2);
  expect(abkLogoBox!.y + abkLogoBox!.height / 2).toBe(abkMarkBox!.y + abkMarkBox!.height / 2);

  await expect(experience.locator('.institution-mark')).toHaveCount(6);
  await expect(experience.locator('.institution-mark img')).toHaveCount(6);
  await expect(experience.locator('.timeline-organization-link')).toHaveCount(6);
  await expect(experience.locator('.institution-mark img').nth(4)).toHaveAttribute('src', '/images/logo-hamazushi.png');
  await expect(experience.locator('.institution-mark img').nth(5)).toHaveAttribute('src', '/images/logo-coco-ichibanya.png');

  const cocoMarkBox = await experience.locator('.institution-mark').nth(5).boundingBox();
  const cocoLogoBox = await experience.locator('.institution-mark img').nth(5).boundingBox();
  expect(cocoMarkBox).not.toBeNull();
  expect(cocoLogoBox).not.toBeNull();
  expect(
    cocoLogoBox!.x + cocoLogoBox!.width / 2 - (cocoMarkBox!.x + cocoMarkBox!.width / 2)
  ).toBe(1);

  const teachingAssistantEntry = experience.locator('.timeline-entry').nth(2);
  const markBox = await teachingAssistantEntry.locator('.institution-mark').boundingBox();
  const headingBox = await teachingAssistantEntry.locator('.timeline-entry-body').boundingBox();
  const descriptionBox = await teachingAssistantEntry.locator('.timeline-desc').boundingBox();

  expect(markBox).not.toBeNull();
  expect(headingBox).not.toBeNull();
  expect(descriptionBox).not.toBeNull();
  expect(descriptionBox!.x).toBe(markBox!.x);
  expect(
    Math.abs(markBox!.y + markBox!.height / 2 - (headingBox!.y + headingBox!.height / 2))
  ).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 411, height: 863 });

  const mobileEducationEntry = education.locator('.timeline-entry').nth(1);
  const mobileEducationMarkBox = await mobileEducationEntry.locator('.institution-mark').boundingBox();
  const mobileEducationHeaderBox = await mobileEducationEntry.locator('.timeline-header').boundingBox();
  const mobileEducationTitleBox = await mobileEducationEntry.locator('.timeline-header h3').boundingBox();
  const mobileEducationLocationBox = await mobileEducationEntry.locator('.timeline-location').boundingBox();
  const mobileEducationRoleBox = await mobileEducationEntry.locator('.timeline-role').boundingBox();
  expect(mobileEducationMarkBox).not.toBeNull();
  expect(mobileEducationHeaderBox).not.toBeNull();
  expect(mobileEducationTitleBox).not.toBeNull();
  expect(mobileEducationLocationBox).not.toBeNull();
  expect(mobileEducationRoleBox).not.toBeNull();
  expect(
    Math.abs(
      mobileEducationMarkBox!.y + mobileEducationMarkBox!.height / 2 -
        (mobileEducationHeaderBox!.y + mobileEducationHeaderBox!.height / 2)
    )
  ).toBeLessThanOrEqual(1);
  expect(mobileEducationLocationBox!.x).toBe(mobileEducationTitleBox!.x);
  expect(mobileEducationLocationBox!.y).toBeGreaterThan(mobileEducationTitleBox!.y);
  expect(mobileEducationRoleBox!.x).toBeLessThan(mobileEducationHeaderBox!.x);

  const mobileExperienceEntry = experience.locator('.timeline-entry').nth(5);
  const mobileExperienceHeaderBox = await mobileExperienceEntry.locator('.timeline-header').boundingBox();
  const mobileExperienceRoleBox = await mobileExperienceEntry.locator('.timeline-role').boundingBox();
  expect(mobileExperienceHeaderBox).not.toBeNull();
  expect(mobileExperienceRoleBox).not.toBeNull();
  expect(mobileExperienceRoleBox!.x).toBe(mobileExperienceHeaderBox!.x);
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

  await expect(page.locator('main h1')).toContainText('After the Codex Update');
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="zh"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="ja"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

  await page.locator('[data-language-menu] a[lang="ja"]').click();
  await expect(page).toHaveURL(/\/ja\/blog\/codex-after-the-update\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('main h1')).toContainText('Codex のアップデート後');
});

test('opt-in blog comments load and publish without affecting other posts', async ({ page }) => {
  await page.goto('/blog/happiness-is-not-the-end');

  const comments = page.locator('[data-blog-comments]');
  await expect(comments).toBeVisible();
  await expect(comments.locator('[data-comments-list] li')).toHaveCount(1);
  await expect(comments).toContainText('First Reader');

  await comments.getByLabel('Nickname').fill('New Reader');
  await comments.getByRole('textbox', { name: 'Comment', exact: true })
    .fill('This comment should appear immediately.');
  await comments.getByRole('button', { name: 'Send comment' }).click();

  await expect(comments.locator('[data-comments-list] li')).toHaveCount(2);
  await expect(comments).toContainText('New Reader');
  await expect(comments.locator('[data-comments-status]')).toHaveText('Your comment is now visible.');

  await page.goto('/blog/writing-for-myself');
  await expect(page.locator('[data-blog-comments]')).toHaveCount(0);
});

test('project category navigation wraps into two readable desktop rows', async ({ page }) => {
  await page.goto('/projects');

  const routeItems = page.locator('.category-route-item');
  await expect(routeItems).toHaveCount(8);

  const routeLayout = await routeItems.evaluateAll((items) => items.map((item) => {
    const bounds = item.getBoundingClientRect();
    const title = item.querySelector('.category-route-title');
    return {
      top: Math.round(bounds.top),
      titleFits: title instanceof HTMLElement && title.scrollWidth <= title.clientWidth,
    };
  }));
  const rowCounts = routeLayout.reduce<Record<number, number>>((counts, item) => {
    counts[item.top] = (counts[item.top] ?? 0) + 1;
    return counts;
  }, {});

  expect(Object.values(rowCounts)).toEqual([5, 3]);
  expect(routeLayout.every((item) => item.titleFits)).toBe(true);
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
  const mathBridgeAwardButton = mathBridgeCard.getByRole('button', { name: 'View Award' });

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
  await expect(mathBridgeDialog.locator('[data-project-gallery-slide]')).toHaveCount(6);
  await expect(mathBridgeDialog.locator('[data-project-gallery-slide]:visible')).toHaveCount(1);
  await expect(mathBridgeDialog.locator('[data-project-gallery-slide]:not([hidden]) img')).toHaveAttribute(
    'src',
    '/images/projects/vr-math-bridge-overview.webp'
  );
  const mathBridgeImageSources = await mathBridgeDialog.locator('[data-project-gallery-slide] img')
    .evaluateAll((images) => images.map((image) => image.getAttribute('src')));
  expect(mathBridgeImageSources.some((source) => source?.endsWith('/background.png'))).toBe(false);

  await mathBridgeDialog.locator('[data-project-gallery-next]').click({ clickCount: 4, delay: 25 });
  expect(await page.evaluate(() => window.getSelection()?.toString() ?? '')).toBe('');
  await expect(mathBridgeDialog.locator('[data-project-gallery-slide]:visible')).toHaveCount(1);

  await mathBridgeDialog.getByRole('button', { name: 'Close project details' }).click();
  await expect(mathBridgeDialog).not.toBeVisible();

  await mathBridgeAwardButton.click();
  await expect(mathBridgeDialog).toBeVisible();
  await expect(mathBridgeDialog.locator('[data-project-gallery-counter]')).toHaveText('6 / 6');
  await expect(mathBridgeDialog.locator('[data-project-gallery-slide]:not([hidden]) img')).toHaveAttribute(
    'src',
    '/images/projects/ieee-gem-2025-presentation-award.jpg'
  );
  await mathBridgeDialog.getByRole('button', { name: 'Close project details' }).click();
  await expect(mathBridgeAwardButton).toBeFocused();

  const vibeCodingCard = page.locator('.project-card').filter({ hasText: 'Assessing the Security of Vibe Coding' });
  const vibeCodingDialog = page.locator('#project-detail-publications-1');

  await expect(vibeCodingCard.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/assessing-security-vibe-coding/'
  );
  await vibeCodingCard.getByRole('button', { name: 'View Details' }).click();
  await expect(vibeCodingDialog).toBeVisible();
  await expect(vibeCodingDialog.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/assessing-security-vibe-coding/'
  );
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

  await expect(mandalaCard.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/bioadaptive-vr-attention-restoration/'
  );
  await mandalaCard.getByRole('button', { name: 'View Details' }).click();
  await expect(mandalaDialog).toBeVisible();
  await expect(mandalaDialog.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/bioadaptive-vr-attention-restoration/'
  );
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
  const detailPanelScrollbar = await mandalaDialog.locator('.project-detail-panel').evaluate((panel) => {
    const style = getComputedStyle(panel);
    return {
      thumbColor: style.getPropertyValue('--project-detail-scrollbar-thumb').trim(),
      thumbRadius: style.getPropertyValue('--project-detail-scrollbar-radius').trim(),
      width: style.getPropertyValue('--project-detail-scrollbar-size').trim(),
    };
  });
  expect(galleryBox).not.toBeNull();
  expect(detailBodyBox).not.toBeNull();
  expect(galleryBox!.y + galleryBox!.height).toBeLessThanOrEqual(detailBodyBox!.y + 1);
  expect(detailPanelScrollbar.width).toBe('8px');
  expect(detailPanelScrollbar.thumbColor).toBe('#c9a2276b');
  expect(detailPanelScrollbar.thumbRadius).toBe('999px');

  await page.keyboard.press('ArrowLeft');
  await expect(mandalaDialog.locator('[data-project-gallery-counter]')).toHaveText('1 / 4');

  await mandalaDialog.getByRole('button', { name: 'Close project details' }).click();
  await expect(mandalaDialog).not.toBeVisible();

  const thesisCard = page.locator('#theses .project-card').filter({
    hasText: 'The Role of Embodied Avatars and Generative AI in Self Learning VR Classroom',
  });
  const thesisDialog = page.locator('#project-detail-theses-0');

  await expect(thesisCard.locator('.project-status')).toHaveText("Master's Thesis");
  await expect(thesisCard.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/embodied-avatars-generative-ai-vr-thesis/'
  );
  await thesisCard.getByRole('button', { name: 'View Details' }).click();
  await expect(thesisDialog).toBeVisible();
  await expect(thesisDialog).toHaveClass(/project-detail-dialog--image-contain/);
  await expect(thesisDialog.locator('[data-project-gallery-slide]')).toHaveCount(1);
  await expect(thesisDialog.locator('[data-project-gallery-slide] img')).toHaveAttribute(
    'src',
    '/images/projects/embodied-ai-vr-thesis-cover.jpg'
  );
  await expect(thesisDialog.locator('.project-detail-kicker .project-status')).toHaveText("Master's Thesis");
  await expect(thesisDialog.getByRole('link', { name: 'View Paper' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/paper/embodied-avatars-generative-ai-vr-thesis.pdf'
  );
  await expect(thesisDialog.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/embodied-avatars-generative-ai-vr-thesis/'
  );

  await thesisDialog.getByRole('button', { name: 'Close project details' }).click();
  await expect(thesisDialog).not.toBeVisible();

  const bachelorThesisCard = page.locator('#theses .project-card').filter({
    hasText: 'Design and Implementation of a Digital Twin System for Quadrotor UAV Formation Flight',
  });
  const bachelorThesisDialog = page.locator('#project-detail-theses-1');

  await expect(bachelorThesisCard.locator('.project-status')).toHaveText("Bachelor's Thesis");
  await expect(bachelorThesisCard.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/quadrotor-uav-formation-digital-twin-thesis/'
  );
  await bachelorThesisCard.getByRole('button', { name: 'View Details' }).click();
  await expect(bachelorThesisDialog).toBeVisible();
  await expect(bachelorThesisDialog).toHaveClass(/project-detail-dialog--image-contain/);
  await expect(bachelorThesisDialog.locator('[data-project-gallery-slide]')).toHaveCount(5);
  await expect(bachelorThesisDialog.locator('[data-project-gallery-slide] img').first()).toHaveAttribute(
    'src',
    '/images/projects/nwpu-uav-digital-twin-cover.jpg'
  );
  await expect(bachelorThesisDialog.locator('.project-detail-kicker .project-status')).toHaveText("Bachelor's Thesis");
  await expect(bachelorThesisDialog.getByRole('link', { name: 'View Paper' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/paper/quadrotor-uav-formation-digital-twin-thesis.pdf'
  );
  await expect(bachelorThesisDialog.getByRole('link', { name: 'View Project Page' })).toHaveAttribute(
    'href',
    'https://web-publications.vercel.app/publications/quadrotor-uav-formation-digital-twin-thesis/'
  );
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { localizePath, normalizePath } from '../src/i18n/config.ts';

test('known page links address directory URLs without a redirect in every locale', () => {
  for (const locale of ['en', 'zh', 'ja']) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    assert.equal(localizePath('/', locale), prefix ? `${prefix}/` : '/');
    for (const path of ['/about', '/projects', '/blog', '/timeline', '/journey', '/beyond-code',
      '/projects/vr-math-bridge', '/blog/essay', '/blog/page/2', '/blog/category/生活']) {
      assert.equal(localizePath(path, locale), `${prefix}${path}/`);
      assert.equal(localizePath(`${path}/`, locale), `${prefix}${path}/`);
    }
  }
});

test('page localization preserves query and fragment bytes and can switch an existing locale', () => {
  assert.equal(localizePath('/projects#publications', 'en'), '/projects/#publications');
  assert.equal(localizePath('/zh/about/?from=home%2F#beyond-code', 'ja'), '/ja/about/?from=home%2F#beyond-code');
  assert.equal(localizePath('/ja/blog/essay?tag=a+b#part-2', 'en'), '/blog/essay/?tag=a+b#part-2');
  assert.equal(localizePath('/zh/?lang=zh#top', 'en'), '/?lang=zh#top');
});

test('assets, endpoints, external URLs and unknown routes are not rewritten as pages', () => {
  for (const path of ['/images/avatar.jpg', '/data/github-contributions.json', '/api/site-stats',
    '/cli-index.json', '/blog/feed.xml', '/projects/demo.png?size=2#x', '/zh/images/file.jpg',
    'https://example.com/about', '//example.com/about', '#education', 'about', '/other/']) {
    assert.equal(localizePath(path, 'zh'), path);
  }
});

test('route identity normalization remains independent of canonical page URL presentation', () => {
  assert.equal(normalizePath('/zh/projects/'), '/projects');
  assert.equal(normalizePath('/ja/'), '/');
  assert.equal(normalizePath('/about/'), '/about');
});

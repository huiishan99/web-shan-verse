import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { aboutDestinations, aboutMenuLabels } from '../src/data/site-navigation.ts';
import { locales, localizePath, normalizePath } from '../src/i18n/config.ts';

test('About lists the two public secondary destinations and leaves Timeline hidden', () => {
  assert.deepEqual(aboutDestinations.map(({ id, path }) => [id, path]), [
    ['beyond-code', '/beyond-code'], ['atlas', '/journey'],
  ]);
  assert.equal(new Set(aboutDestinations.map(({ path }) => path)).size, aboutDestinations.length);
  for (const destination of aboutDestinations) {
    assert.ok(existsSync(new URL(`../src/pages${destination.path}.astro`, import.meta.url)));
    assert.ok(existsSync(new URL(`../src/pages/[lang]${destination.path}.astro`, import.meta.url)));
    for (const locale of locales) {
      const prefix = locale === 'en' ? '' : `/${locale}`;
      const href = localizePath(destination.path, locale);
      assert.equal(href, `${prefix}${destination.path}/`);
      assert.equal(normalizePath(href), destination.path);
      assert.equal(typeof destination.label[locale], 'string');
      assert.ok(destination.label[locale].trim());
    }
  }
});

test('About supplies explicit disclosure and landmark text in all site locales', () => {
  for (const locale of locales) {
    assert.ok(aboutMenuLabels[locale].toggle.trim());
    assert.ok(aboutMenuLabels[locale].landmark.trim());
  }
  assert.equal(aboutMenuLabels.en.toggle, 'More about me');
  assert.equal(aboutMenuLabels.zh.toggle, '更多关于我的页面');
  assert.equal(aboutMenuLabels.ja.toggle, '自分についてのページ');
});

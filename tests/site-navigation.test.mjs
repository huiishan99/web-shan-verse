import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { exploreDestinations, exploreLabels } from '../src/data/site-navigation.ts';
import { locales, localizePath, normalizePath } from '../src/i18n/config.ts';

test('Explore registers only the three existing secondary destinations, with native canonical locale links', () => {
  assert.deepEqual(exploreDestinations.map(({ id, path }) => [id, path]), [
    ['beyond-code', '/beyond-code'], ['atlas', '/journey'], ['timeline', '/timeline'],
  ]);
  assert.equal(new Set(exploreDestinations.map(({ path }) => path)).size, exploreDestinations.length);
  for (const destination of exploreDestinations) {
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

test('Explore supplies explicit disclosure and landmark text in all site locales', () => {
  for (const locale of locales) {
    assert.ok(exploreLabels[locale].toggle.trim());
    assert.ok(exploreLabels[locale].landmark.trim());
  }
  assert.equal(exploreLabels.en.toggle, 'Explore');
  assert.equal(exploreLabels.zh.toggle, '探索');
  assert.equal(exploreLabels.ja.toggle, '探索');
});

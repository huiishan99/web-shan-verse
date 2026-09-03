import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBlogCommentThreadKey,
  getBlogPostAlternateLocales,
  isBlogCommentsEnabled,
  slugifyBlogTaxonomy,
  validateBlogContent,
} from '../src/utils/blog-content.ts';

function translatedPost(lang, overrides = {}) {
  return {
    id: `essay-${lang}`,
    data: {
      lang,
      postSlug: 'shared-essay',
      translationKey: 'shared-essay',
      ...overrides,
    },
  };
}

test('taxonomy slugs normalize punctuation, spacing, and accents', () => {
  assert.equal(slugifyBlogTaxonomy('  Déjà Vu / Notes  '), 'deja-vu-notes');
  assert.equal(slugifyBlogTaxonomy('生活 随笔'), '生活-随笔');
});

test('translated posts expose only locales that have a published entry', () => {
  const posts = [
    translatedPost('en'),
    translatedPost('zh'),
    translatedPost('ja', { draft: true }),
  ];

  assert.deepEqual(getBlogPostAlternateLocales(posts[0], posts), ['en', 'zh']);
});

test('content validation accepts a complete translation group', () => {
  assert.doesNotThrow(() => validateBlogContent([
    translatedPost('en'),
    translatedPost('zh'),
    translatedPost('ja'),
  ], { requireCompleteTranslations: true }));
});

test('comments default to enabled and translated posts share one thread', () => {
  const post = translatedPost('en');

  assert.equal(isBlogCommentsEnabled(post), true);
  assert.equal(getBlogCommentThreadKey(post), 'shared-essay');
  assert.doesNotThrow(() => validateBlogContent([
    translatedPost('en'),
    translatedPost('zh', { comments: true }),
    translatedPost('ja'),
  ]));
});

test('content validation rejects incomplete translations and route collisions', () => {
  assert.throws(
    () => validateBlogContent([
      translatedPost('en'),
      translatedPost('zh'),
      { id: 'duplicate', data: { lang: 'en', postSlug: 'shared-essay' } },
    ], { requireCompleteTranslations: true }),
    /missing locales ja[\s\S]*conflicts with essay-en|conflicts with essay-en[\s\S]*missing locales ja/
  );
});

test('content validation rejects taxonomy values that collapse to one slug', () => {
  assert.throws(
    () => validateBlogContent([
      { id: 'first', data: { tags: ['Déjà Vu'] } },
      { id: 'second', data: { tags: ['Deja-Vu'] } },
    ]),
    /resolve to the same slug/
  );
});

test('translated posts must share the comments setting', () => {
  assert.throws(
    () => validateBlogContent([
      translatedPost('en', { comments: true }),
      translatedPost('zh', { comments: false }),
      translatedPost('ja', { comments: true }),
    ]),
    /translations must share the comments setting/
  );
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { awards, education, experience } from '../src/data/about.ts';

const locales = ['en', 'zh', 'ja'];

function assertFullyLocalized(value, label) {
  assert.equal(typeof value, 'object', `${label} should define locale-specific values`);
  locales.forEach((locale) => {
    assert.equal(typeof value[locale], 'string', `${label}.${locale} should be a string`);
    assert.notEqual(value[locale].trim(), '', `${label}.${locale} should not be empty`);
  });
}

test('resume institution names are localized while ABK College stays in English', () => {
  education.forEach((item) => {
    if (item.school === 'ABK College') {
      assert.equal(item.school, 'ABK College');
    } else {
      assertFullyLocalized(item.school, 'education.school');
    }
    assertFullyLocalized(item.period, 'education.period');
  });

  experience.forEach((item) => {
    assertFullyLocalized(item.company, 'experience.company');
  });

  awards.forEach((item) => {
    assertFullyLocalized(item.title, 'awards.title');
    assertFullyLocalized(item.issuer, 'awards.issuer');
    assertFullyLocalized(item.period, 'awards.period');
  });
});

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
    if (item.description) {
      assertFullyLocalized(item.description, 'awards.description');
    }
  });
});

test('awards include the Sensory Design Thinking Workshop result and omit Dekad Bahasa', () => {
  const presentationAward = awards.find((item) => item.title.en === 'Presentation Award');
  const workshopAward = awards.find((item) => item.title.en === 'First Grade');

  assert.ok(presentationAward);
  assert.equal(presentationAward.title.zh, presentationAward.title.en);
  assert.equal(presentationAward.title.ja, presentationAward.title.en);
  assert.ok(workshopAward);
  assert.equal(workshopAward.title.zh, workshopAward.title.en);
  assert.equal(workshopAward.title.ja, workshopAward.title.en);
  assert.equal(workshopAward.issuer.en, 'ALPS ALPINE and University of Aizu');
  assert.equal(workshopAward.period.en, 'Aug 2024');
  assert.match(workshopAward.description.en, /one of four participants/);
  assert.equal(awards.some((item) => item.title.en.includes('Dekad Bahasa')), false);
});

test('ALPS internship describes the HMI prototype without VR framing', () => {
  const internship = experience.find((item) => item.role.en === 'Engineer Internship');

  assert.ok(internship);
  assert.match(internship.description.en, /^Developed a futuristic car HMI prototype using Unity\./);
  assert.doesNotMatch(internship.description.en, /VR-based/i);
  assert.doesNotMatch(internship.description.zh, /基于 VR/);
  assert.doesNotMatch(internship.description.ja, /VR ベース/);
});

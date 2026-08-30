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
    assert.match(item.website, /^https:\/\//, 'education.website should use HTTPS');
    assertFullyLocalized(item.period, 'education.period');
  });

  experience.forEach((item) => {
    assertFullyLocalized(item.company, 'experience.company');
    assert.match(item.website, /^https:\/\//, 'experience.website should use HTTPS');
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
  const workshopAward = awards.find(
    (item) => item.title.en === 'Sensory Design Thinking Workshop — Team First Grade'
  );

  assert.ok(presentationAward);
  assert.equal(presentationAward.title.zh, presentationAward.title.en);
  assert.equal(presentationAward.title.ja, presentationAward.title.en);
  assert.ok(workshopAward);
  assert.equal(workshopAward.title.zh, workshopAward.title.en);
  assert.equal(workshopAward.title.ja, workshopAward.title.en);
  assert.equal(workshopAward.issuer.en, 'ALPS ALPINE and University of Aizu');
  assert.equal(workshopAward.period.en, 'Aug 2024');
  assert.match(workshopAward.description.zh, /Sensory Design Thinking Workshop/);
  assert.match(workshopAward.description.ja, /Sensory Design Thinking Workshop/);
  assert.doesNotMatch(workshopAward.description.zh, /感性设计思维工作坊/);
  assert.doesNotMatch(workshopAward.description.ja, /感性デザイン思考ワークショップ/);
  assert.doesNotMatch(workshopAward.description.en, /first prize/i);
  assert.doesNotMatch(workshopAward.description.zh, /一等奖/);
  assert.doesNotMatch(workshopAward.description.ja, /一等賞/);
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

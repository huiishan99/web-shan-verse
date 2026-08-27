import assert from 'node:assert/strict';
import test from 'node:test';
import { collectLinks, formatResult } from '../scripts/check-project-links.mjs';

test('collectLinks returns only supported non-empty project URLs', () => {
  const categories = [
    {
      title: { en: 'Research', zh: '研究', ja: '研究' },
      items: [
        {
          title: { en: 'Project A', zh: '项目 A', ja: 'プロジェクト A' },
          github: ' https://github.com/example/project-a ',
          paper: '',
          website: 'https://example.com/project-a',
          unrelated: 'https://example.com/ignored',
        },
      ],
    },
  ];

  assert.deepEqual(collectLinks(categories), [
    {
      category: 'Research',
      field: 'github',
      title: 'Project A',
      url: 'https://github.com/example/project-a',
    },
    {
      category: 'Research',
      field: 'website',
      title: 'Project A',
      url: 'https://example.com/project-a',
    },
  ]);
});

test('formatResult includes the project, field, URL, and response status', () => {
  assert.equal(
    formatResult({
      title: 'Project A',
      field: 'website',
      url: 'https://example.com',
      status: 200,
      statusText: 'OK',
    }),
    'Project A [website] https://example.com -> 200 OK'
  );
});

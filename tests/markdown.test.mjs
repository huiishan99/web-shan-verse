import assert from 'node:assert/strict';
import test from 'node:test';
import { extractMarkdownPlainText } from '../src/utils/markdown.ts';

test('plain-text extraction follows the Markdown and MDX tree', () => {
  const source = `
import Callout from '../../components/Callout.astro';

# A linked [idea](https://example.com)

<Callout type="tip">Keep **this text**.</Callout>

![Decorative image](/image.jpg)

\`inline value\`

\`\`\`js
const implementationDetail = true;
\`\`\`

<SyncNote label="Sync" items={['Source']} />
`;

  assert.equal(
    extractMarkdownPlainText(source),
    'A linked idea Keep this text. inline value'
  );
});

test('plain-text extraction can preserve semantic block boundaries', () => {
  assert.equal(
    extractMarkdownPlainText('First paragraph.\n\nSecond paragraph.', true),
    'First paragraph.\nSecond paragraph.'
  );
});

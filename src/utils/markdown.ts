import { unified } from 'unified';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';

type MarkdownNode = {
  alt?: string;
  children?: MarkdownNode[];
  name?: string | null;
  type: string;
  value?: string;
};

const markdownParser = unified().use(remarkParse).use(remarkMdx);
const blockNodes = new Set([
  'blockquote',
  'definition',
  'heading',
  'list',
  'listItem',
  'paragraph',
  'table',
  'tableCell',
  'tableRow',
  'thematicBreak',
]);
const skippedNodes = new Set([
  'code',
  'image',
  'imageReference',
  'mdxFlowExpression',
  'mdxTextExpression',
  'mdxjsEsm',
  'yaml',
]);

function decodeInlineEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function collectNodeText(node: MarkdownNode, chunks: string[]): void {
  if (skippedNodes.has(node.type)) return;
  if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name === 'SyncNote') {
    return;
  }

  if (node.type === 'text' || node.type === 'inlineCode') {
    if (node.value) chunks.push(node.value);
    return;
  }
  if (node.type === 'html' && node.value) {
    chunks.push(decodeInlineEntities(node.value.replace(/<[^>]+>/g, ' ')));
    return;
  }
  if (node.type === 'break') {
    chunks.push('\n');
    return;
  }

  node.children?.forEach((child) => collectNodeText(child, chunks));
  if (blockNodes.has(node.type)) chunks.push('\n');
}

export function extractMarkdownPlainText(body: string, preserveLineBreaks = false): string {
  const tree = markdownParser.parse(body) as MarkdownNode;
  const chunks: string[] = [];
  collectNodeText(tree, chunks);

  const text = chunks.join('');
  if (!preserveLineBreaks) return text.replace(/\s+/g, ' ').trim();

  return text
    .replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

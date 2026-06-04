#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const targetLanguages = new Set(['en', 'ja']);

function showUsage() {
  console.error(`Usage: GOOGLE_TRANSLATE_API_KEY=... node scripts/google-translate-note.mjs <source-mdx> <en|ja>

Translates the body text of a Chinese-origin blog note through Google Cloud Translation Basic v2.
The script prints an MDX-ready body draft and does not modify files.`);
}

function extractBody(markdown) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/^import\s+.+?;\s*/gm, '')
    .replace(/<SyncNote[\s\S]*?\/>\s*/g, '')
    .replace(/<p>\s*/g, '')
    .replace(/\s*<\/p>/g, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeMdxText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatAsMdxParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const lines = paragraph
        .split('\n')
        .map((line) => escapeMdxText(line.trim()))
        .filter(Boolean);

      if (lines.length === 0) return '';

      return `<p>\n${lines.join('<br />\n')}\n</p>`;
    })
    .filter(Boolean)
    .join('\n\n');
}

async function translateText(text, target, apiKey) {
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: 'zh-CN',
      target,
      format: 'text',
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Translate request failed (${response.status}): ${message}`);
  }

  const data = await response.json();
  const translatedText = data?.data?.translations?.[0]?.translatedText;

  if (typeof translatedText !== 'string') {
    throw new Error('Google Translate response did not include translatedText.');
  }

  return translatedText;
}

const [, , sourceFile, target] = process.argv;
const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

if (!sourceFile || !target || !targetLanguages.has(target)) {
  showUsage();
  process.exitCode = 1;
} else if (!apiKey) {
  console.error('Missing GOOGLE_TRANSLATE_API_KEY.');
  process.exitCode = 1;
} else {
  const markdown = await readFile(sourceFile, 'utf8');
  const body = extractBody(markdown);

  if (!body) {
    throw new Error(`No translatable body text found in ${sourceFile}.`);
  }

  const translatedText = await translateText(body, target, apiKey);
  const mdxBody = formatAsMdxParagraphs(translatedText);

  console.log(`# Google Translate draft for ${basename(sourceFile)} -> ${target}`);
  console.log('');
  console.log(mdxBody);
}

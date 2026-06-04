# Blog Authoring Guide

This site supports two blog formats:

- `.md` for regular Markdown posts.
- `.mdx` for richer posts that need images, videos, embedded link cards, or callouts.

Existing `.md` posts do not need to change. Use `.mdx` only when a post needs components.

## Frontmatter

```yaml
---
title: "Post title"
date: 2026-05-16
description: "Short summary for blog cards and SEO."
kind: article
categories:
  - Blog
tags:
  - Astro
  - VR
draft: true
image: /images/blog/cover.jpg
---
```

Set `draft: true` while writing. Production builds hide draft posts.

Use `kind: article` for structured posts, tutorials, project write-ups, and longer retrospectives. This is the default, so old posts do not need to change.

Use `kind: note` for essays, prose, mood notes, life observations, and poems:

```yaml
---
title: "2026年6月1日随笔"
date: 2026-06-01
kind: note
categories:
  - Life
---
```

## Sync Notes for Republished Writing

When a note was originally written somewhere else, add a compact sync note at the end of every language version:

```mdx
import SyncNote from '../../components/blog/SyncNote.astro';

<SyncNote label="Sync" items={['Chinese original', 'WeChat Moments']} />
```

For Chinese originals, keep the Chinese post as the source text and use concise localized labels such as `同步`, `Sync`, or `同期`.

## Translation Workflow for Chinese-Origin Notes

For personal notes, the translation goal is fidelity, not polish. The translated post should feel like the same person speaking through another language, not like a rewritten essay.

When Google Translate output is available, use it as the baseline because it usually preserves sentence order, repetition, and the original shape better than a free AI rewrite. Strict Google Translate output requires either a real Google translation result pasted by the author or an approved Google Cloud Translation run. Do not claim a translation came from Google unless it actually did.

For Google Cloud Translation Basic v2, use:

```sh
GOOGLE_TRANSLATE_API_KEY=... node scripts/google-translate-note.mjs src/content/blog/2026-06-01-if-immortality-arrives.mdx en
GOOGLE_TRANSLATE_API_KEY=... node scripts/google-translate-note.mjs src/content/blog/2026-06-01-if-immortality-arrives.mdx ja
```

The script prints an MDX-ready draft body and does not edit files. Paste or apply the result manually, then do the minimal review pass below.

After the baseline translation, make only minimal edits:

- Preserve paragraph boundaries, line breaks, short standalone lines, and repeated sentence patterns.
- Preserve casual markers such as `哈哈`, `其实`, `但是又何必呢`, pauses, abrupt turns, and direct emotional phrasing.
- Preserve metaphors and odd-but-personal wording unless the target language becomes genuinely unreadable.
- Do not make the text more literary, more elegant, more logical, or more explanatory than the Chinese original.
- Do not soften sharp statements or add nuance that the original did not include.
- Do not invent a meaningful title for notes. Use date-based internal titles only; the UI hides note titles.
- Do not add tags just to make the post look categorized. Categories are for broad grouping; tags are only for recurring searchable topics.

English notes should stay plain, direct, and close to the Chinese syntax. A little awkwardness is acceptable when it carries the original rhythm.

Japanese notes should be natural enough to read, but still close to the Chinese order and emotional pressure. Avoid turning the text into polished Japanese essay prose.

Recommended process for future Codex runs:

1. Read the Chinese source first and identify whether it is an article or a note.
2. For notes, draft the target language by following Google Translate-style literal preservation.
3. Compare the translation paragraph by paragraph against the Chinese source.
4. Only adjust grammar and readability where the target language would otherwise sound broken.
5. Keep the final `SyncNote` at the end, using `同步`, `Sync`, or `同期` as appropriate.

## Markdown Images

The simple Markdown image syntax still works:

```md
![Alt text](/images/blog/photo.jpg)
```

You can add layout and captions through the image title:

```md
![Alt text](/images/blog/photo.jpg "wide: Caption text")
![Alt text](/images/blog/detail.jpg "small: Small detail caption")
![Alt text](/images/blog/panorama.jpg "full: Full width caption")
```

Supported image sizes are `small`, `normal`, `wide`, and `full`.

## MDX Components

For richer posts, create a `.mdx` file and import the components you need:

```mdx
import BlogImage from '../../components/blog/BlogImage.astro';
import VideoEmbed from '../../components/blog/VideoEmbed.astro';
import LinkCard from '../../components/blog/LinkCard.astro';
import Callout from '../../components/blog/Callout.astro';
```

### Image

```mdx
<BlogImage
  src="/images/blog/uoa-demo.jpg"
  alt="VR classroom prototype running on Quest 3"
  size="wide"
  caption="Prototype scene captured during testing."
/>
```

### Video

YouTube, youtu.be, Vimeo, and local video files are supported:

```mdx
<VideoEmbed
  src="https://www.youtube.com/watch?v=VIDEO_ID"
  title="Project demo video"
  caption="Short demo of the interaction flow."
/>
```

```mdx
<VideoEmbed
  src="/videos/blog/demo.mp4"
  title="Local demo video"
  poster="/images/blog/demo-poster.jpg"
/>
```

### Link Card

```mdx
<LinkCard
  href="https://doi.org/10.1109/GEM66882.2025.11155841"
  title="VR Math Bridge paper"
  description="Publication page for the IEEE GEM paper."
  site="IEEE"
/>
```

### Callout

```mdx
<Callout type="tip" title="Writing note">
  Keep technical posts easy to scan by adding one callout near the main takeaway.
</Callout>
```

Callout types are `note`, `tip`, `warning`, and `danger`.

## Asset Locations

Use stable public paths so posts stay easy to move:

- Blog images: `public/images/blog/`
- Blog videos: `public/videos/blog/`
- General site images: `public/images/`

In Markdown or MDX, reference them from the public root:

```md
![Alt text](/images/blog/example.jpg)
```

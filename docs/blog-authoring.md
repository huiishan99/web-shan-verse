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

Use `kind: reflection` for essays, prose, mood notes, life observations, and poems:

```yaml
---
title: "A quiet thought"
date: 2026-06-01
kind: reflection
categories:
  - Life
tags:
  - Growth
---
```

## Source Notes for Republished Writing

When a reflection was originally written somewhere else, add a short source note near the top of every language version. Use a `Callout` when the post is MDX:

```mdx
import Callout from '../../components/blog/Callout.astro';

<Callout type="note" title="Source note">
Originally written in Chinese and posted on WeChat Moments. This English version is a translation that keeps the tone and intent of the original.
</Callout>
```

For Chinese originals, keep the Chinese post as the source text and mark translated versions clearly in their own language.

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

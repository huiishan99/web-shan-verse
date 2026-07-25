# SHAN-VERSE

Personal multilingual Astro site for essays, projects, timelines, and interactive
experiments.

## Local development

Use Node.js 22.12 or newer. The repository's expected version is recorded in
`.nvmrc`.

```sh
npm ci
npm run dev
```

The development server normally starts at `http://localhost:4321`.

## Quality gate

Run the same gate used by CI and the GitHub Pages deployment:

```sh
npm run verify
```

It checks:

- Astro and TypeScript diagnostics
- ESLint
- unit tests for project-link extraction and the site-stats Worker
- live project links
- the production build
- generated HTML landmarks, headings, image alt text, IDs, and internal links
- production dependency vulnerabilities

## Content

Blog authoring conventions live in `docs/blog-authoring.md`. Development
workarounds and known Astro cache behavior live in `docs/dev-notes.md`.

## Site statistics

The Cloudflare Worker source and setup notes live in `workers/site-stats/`.
Local Astro development intentionally leaves the production statistics endpoint
disabled.

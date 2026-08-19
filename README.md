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

It checks only deterministic repository outputs:

- Astro and TypeScript diagnostics
- ESLint
- unit tests for content rules, shared domain logic, Markdown extraction, and the site-stats Worker
- the production build
- generated HTML landmarks, headings, image alt text, IDs, and internal links
- Playwright smoke tests for the main browser journeys

Install Chromium once before running the complete gate on a new machine:

```sh
npx playwright install chromium
```

Checks that require third-party network access run in the scheduled External
Health workflow and can also be invoked manually:

```sh
npm run verify:external
```

This checks live project links and production dependency vulnerabilities without
making a temporary external outage block a site deployment.

## Content

Blog authoring conventions live in `docs/blog-authoring.md`. Development
workarounds and known Astro cache behavior live in `docs/dev-notes.md`.

## Site statistics

The Cloudflare Worker source and setup notes live in `workers/site-stats/`.
Local Astro development intentionally leaves the production statistics endpoint
disabled.

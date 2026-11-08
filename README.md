# SHAN-VERSE

Personal multilingual Astro site for essays, projects, timelines, and interactive
experiments.

## Local development

Use Node.js 24 LTS. The repository's expected major version is recorded in
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

## GitHub contribution calendar

The original gold calendar renders data from the same-origin
`public/data/github-contributions.json` snapshot. Browsers do not depend on a
third-party API or chart image. Source and coverage dates remain in the snapshot
for maintenance. Days outside the snapshot are unknown, rather than zero contributions.

`npm run update:github` reads the public GitHub contribution page and validates
the daily counts and date coverage before atomically replacing the snapshot.
The Pages workflow refreshes it before each release and daily at 09:15 Japan
time. If GitHub is unavailable, an existing valid snapshot is retained with its
original dates; no valid snapshot means the refresh fails. No token is needed.
Normal local builds and the verification gate use the checked-in snapshot and
remain independent of external network availability.

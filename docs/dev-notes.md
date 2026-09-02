# Development Notes

## Astro content collection dev-server cache

Symptom:

- Local blog detail pages can show `UnknownContentCollectionError`.
- The error usually looks like `Unexpected error while rendering -> 2025-01-01-happy-new-year`.
- Blog index pages and production builds may still work.

Likely cause:

- Astro's dev server content-module cache can become stale after running `npm run build`, changing Astro/content config, or repeated hot updates while `npm run dev` is still running.
- This is usually a local dev-server state issue, not broken blog frontmatter or broken MDX content.

Recovery:

1. Stop the process listening on `127.0.0.1:4321`.
2. Restart the dev server with:

   ```sh
   npm run dev -- --host 127.0.0.1 --port 4321
   ```

3. Recheck the affected route, for example:

   ```sh
   curl -sS -o /tmp/blog-check.html -w "%{http_code}\n" http://127.0.0.1:4321/blog/2025-01-01-happy-new-year
   ```

Workflow reminder:

- If `npm run build` is run while the dev server is open, restart the dev server before handing the site back for browser testing.
- Treat this error as a dev-server cache issue first unless `npm run build` also fails.

## Cloudflare D1 blog comments

The comments pilot is opt-in per article with `comments: true`. The English,
Chinese, and Japanese versions of the same post share one stable translation
thread, so replies are not split by locale.

Architecture:

- The static Astro page renders the comment interface and Cloudflare Turnstile.
- `shan-verse-blog-comments` handles `/api/comments` on Cloudflare Workers.
- Published comments are inserted directly into the D1 database; there is no
  pending queue.
- The Worker validates origin, thread keys, Turnstile tokens, content limits,
  honeypot data, and per-IP rate limits before insertion.
- Private values live only in encrypted Worker secrets and must not be committed.

Operations and deletion queries are documented in
`workers/blog-comments/README.md`.

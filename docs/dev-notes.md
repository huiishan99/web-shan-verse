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

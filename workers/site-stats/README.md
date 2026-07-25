# SHAN-VERSE Site Stats Worker

This Cloudflare Worker powers the footer counters for:

- `Views`: total page views
- `Visitors`: unique visitor IP hashes
- `Online`: visitor hashes active in the last 5 minutes

It stores hashed visitor IDs in Cloudflare KV and does not store raw IP addresses.

## Cloudflare Setup

1. Create a KV namespace named `shan_verse_site_stats`.
2. Create a Worker named `shan-verse-site-stats`.
3. Add a KV binding:
   - Variable name: `SITE_STATS`
   - KV namespace: `shan_verse_site_stats`
4. Add an environment variable:
   - Name: `VISITOR_HASH_SALT`
   - Value: any long random phrase
5. Paste `worker.js` into the Worker editor and deploy it.
6. Add a Worker route:
   - Route: `shan-verse.com/api/site-stats*`
   - Worker: `shan-verse-site-stats`

After the route is active, the static site can call `/api/site-stats` without moving away from GitHub Pages.

The Astro dev server leaves the stats endpoint empty, so local development does not call the live Worker or spend KV quota. In production, the frontend sends a heartbeat every 4 minutes while the page is visible. Online counts are cached briefly, and active visitor keys are only refreshed when they are stale, keeping KV writes/list operations comfortably small for a personal site.

`GET /api/site-stats` is read-only. Counter and presence updates require a valid
`POST` event from an origin listed in `ALLOWED_ORIGINS`. The Worker fails closed
when `VISITOR_HASH_SALT` is missing.

Run the repository test suite after Worker changes:

```sh
npm test
```

Cloudflare KV does not provide an atomic increment primitive. The current
read-modify-write counters are appropriate as best-effort personal-site metrics,
but strict accounting under high concurrency would require migrating the
counters to a Durable Object or another transactional store.

`wrangler.toml.example` is included for a CLI deploy later, but the dashboard setup above is enough.

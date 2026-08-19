# SHAN-VERSE Site Stats Worker

This Cloudflare Worker powers the footer counters for:

- `Views`: total page views
- `Visitors`: unique visitor IP hashes
- `Online`: visitor hashes active in the last 5 minutes

It stores salted visitor hashes in one Cloudflare Durable Object and does not
store raw IP addresses. The single object serializes updates, so concurrent
pageviews cannot overwrite each other.

## Cloudflare Setup

1. Create a Worker named `shan-verse-site-stats`.
2. Add a Durable Object binding:
   - Variable name: `SITE_STATS_COUNTER`
   - Class name: `SiteStatsCounter`
3. If migrating existing counters, keep the old KV binding for the first deploy:
   - Variable name: `SITE_STATS`
   - KV namespace: `shan_verse_site_stats`
4. Add an environment variable:
   - Name: `VISITOR_HASH_SALT`
   - Value: any long random phrase
5. Deploy `worker.js` with the `v1` Durable Object migration from the example
   Wrangler configuration.
6. Add a Worker route:
   - Route: `shan-verse.com/api/site-stats*`
   - Worker: `shan-verse-site-stats`

After the route is active, the static site can call `/api/site-stats` without moving away from GitHub Pages.

The Astro dev server leaves the stats endpoint empty, so local development does
not call the live Worker. In production, the frontend sends a heartbeat every
4 minutes while the page is visible. Active timestamps are stored in the Durable
Object and entries older than 5 minutes are removed during the next request.

On its first request, a new Durable Object seeds its totals from the optional
legacy `SITE_STATS` KV namespace. Once the migrated totals have been verified,
the KV binding can be removed; it is not used for ongoing writes.

`GET /api/site-stats` is read-only. Counter and presence updates require a valid
`POST` event from an origin listed in `ALLOWED_ORIGINS`. The Worker fails closed
when `VISITOR_HASH_SALT` is missing.

Run the repository test suite after Worker changes:

```sh
npm test
```

Counter updates run inside Durable Object storage transactions. The repository
test suite includes a concurrent pageview test to guard against lost updates.

Use `wrangler.toml.example` as the deployment template so the binding and Durable
Object migration are versioned together.

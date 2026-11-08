# SHAN-VERSE Site Stats Worker

This Cloudflare Worker powers the footer counters for:

- `Views`: total page views
- `Visitors`: unique visitor IP hashes
- `Online`: anonymous browser IDs active in the last 5 minutes; older clients
  without a browser ID fall back to IP hashes

It stores salted IP and browser-ID hashes in one Cloudflare Durable Object,
without storing raw IP addresses or raw browser IDs. The single object serializes
updates, so concurrent pageviews cannot overwrite each other. Historical views
and IP-based visitor totals retain their existing keys and values.

## Cloudflare Setup

1. Create a Worker named `shan-verse-site-stats`.
2. Add a Durable Object binding:
   - Variable name: `SITE_STATS_COUNTER`
   - Class name: `SiteStatsCounter`
3. If migrating existing counters, retain the old KV binding as a read-only source:
   - Variable name: `SITE_STATS`
   - KV namespace: `shan_verse_site_stats`
4. Add an environment variable:
   - Name: `VISITOR_HASH_SALT`
   - Value: a long random phrase for a new installation; preserve the existing
     value exactly when migrating, so historical visitor hashes remain valid
5. Deploy `worker.js` with the `v1` Durable Object migration from the example
   Wrangler configuration.
6. Add a Worker route:
   - Route: `shan-verse.com/api/site-stats*`
   - Worker: `shan-verse-site-stats`

After the route is active, the static site can call `/api/site-stats` without moving away from GitHub Pages.

The Astro dev server leaves the stats endpoint empty, so local development does
not call the live Worker. In production, visible pages read the current counters
every 15 seconds with uncached `GET` requests. A separate heartbeat is sent every
4 minutes to refresh presence without adding page views. Read-only polling does
not renew presence. Active timestamps are stored in the Durable Object and
entries older than 5 minutes are removed during the next request.

New clients send an optional `clientId` containing a canonical UUID. The frontend
keeps this anonymous ID in local storage and coordinates creation across tabs
using Web Locks when available. Different browsers sharing a network count
separately; tabs in one browser share a count. When storage is blocked, the ID
lasts only for that page's lifetime. Invalid supplied IDs are rejected.

Online approximates active browsers rather than identifying people: one person
using two browsers can count as two. Legacy IP entries are counted only when that
IP has no active browser-ID entries, avoiding duplicate counts during rollout.
Failed or timed-out requests clear the displayed online value to `--` until a successful retry;
older in-flight responses cannot replace a newer result. Hidden pages skip both
polling and heartbeats, and refresh presence when they become visible again.

On its first request, a new Durable Object seeds its totals from the optional
legacy `SITE_STATS` KV namespace. For each IP not yet seen by the Durable Object,
one additional KV lookup preserves historical visitor deduplication. Subsequent
requests from that IP and read-only polls do not query KV. Keep the legacy binding
and records: removing them would recount returning IPs that have not yet visited
the new backend. KV failures fail the request rather than silently counting a
returning visitor as new. Ongoing writes and presence use the SQLite-backed
Durable Object; the legacy KV data is never modified.

## Free-tier budget

The current Workers Free and SQLite-backed Durable Objects plans each allow
100,000 requests per day. KV separately allows only 1,000 writes and 1,000 list
operations per day, which explains the historical heartbeat throttling. See
[Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
[Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/),
and [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/).

Ignoring pageviews, retries, visibility changes and other account workloads, one
continuously visible tab sends about 6,120 requests per day (5,760 reads and 360
heartbeats); two tabs send about 12,240. These are estimates, not an assurance of
remaining under all account quotas. Storage row reads, writes, and compute have
separate limits. Local development and automated tests do not call the live API.

Deploy the Worker update before publishing the new frontend. GitHub Pages pushes
update the static site but do not deploy `workers/site-stats/worker.js`. An old
Worker may still merge clients by IP or retain an old cached-online bug.

Before the first deployment, verify the existing salt and legacy KV binding,
and preserve deployed variables with Wrangler's `--keep-vars` option. Creating
the Durable Object class is a migration: Cloudflare cannot roll back to a version
from before that migration. Recovery must retain the class, namespace, binding
and stored data, using a compatible forward deployment or post-migration version.

`GET /api/site-stats` is read-only. Counter and presence updates require a valid
`POST` event from an origin listed in `ALLOWED_ORIGINS`. The Worker fails closed
when `VISITOR_HASH_SALT` is missing.

Run the repository test suite after Worker changes:

```sh
npm test
```

Counter updates run inside Durable Object storage transactions. The repository
test suite includes a concurrent pageview test to guard against lost updates.

The checked-in `wrangler.toml` targets the existing production Worker and retains
its legacy KV namespace, encrypted salt, compatibility date and logging settings.
Run `wrangler deploy --config workers/site-stats/wrangler.toml --keep-vars` only
when the production migration is authorized. Use `wrangler.toml.example` as the
template for a separate installation. The bindings and Durable Object migration
must be deployed together.

## Initial production migration: 2026-11-08

The retired deployment `b9991001-d4ae-4f8a-97a8-bd315638ff56` converted a missing
online cache value to zero, then clamped it to one without recounting presence.
Its GET handler also wrote presence and visitor records. The replacement removes
that cache and makes GET observational for counters and presence renewal.

The deployed source was inspected before migration: it used SHA-256 over
`salt:IP` and the same `visitor:<hash>` keys. The existing encrypted salt and KV
namespace were retained. Initial GETs preserved the baseline of **11,167 views
and 3,546 visitors**, returned zero online browsers before any new presence, and
did not increment either total.

- First SQLite migration version: `33a43e6a-8d55-4bd1-86f3-4547b4564693`
- Version with preview URLs explicitly disabled: `6f6c7275-2085-48ce-b38c-3d498e4d1201`
- Durable Object namespace: `fdf6d2fa3bf64271baaee69a673e0609`
- Stable identity: `SITE_STATS_COUNTER` / `SiteStatsCounter` / `idFromName('global')`

Local verification passed 56 unit tests, six focused browser tests, Astro checks,
lint, build and generated-HTML checks. Real local workerd testing with three
browser profiles and four tabs on one IP produced online counts `1, 2, 2, 3`.
Failure, stale-response, concurrent-update, legacy-visitor and expiry cases are
covered by the tests. Production browser behavior is verified separately after
the static-site release. Request and storage quotas remain operational limits;
the metric approximates browsers and does not establish a count of people.

If the frontend regresses, revert the static site while retaining this backend.
For backend recovery, use compatible code or a known-good post-migration version.
Do not delete the namespace, change the salt or object identity, reset counters,
or restore the retired KV writer, whose totals no longer receive new updates.

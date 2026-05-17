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

The frontend sends a heartbeat every 2 minutes. Online counts are cached briefly to keep KV list operations comfortably small for a personal site.

`wrangler.toml.example` is included for a CLI deploy later, but the dashboard setup above is enough.

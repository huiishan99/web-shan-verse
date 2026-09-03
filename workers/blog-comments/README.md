# SHAN-VERSE Blog Comments Worker

This Cloudflare Worker provides the comments API at `/api/comments`.
Comments are stored in D1 and published immediately after Turnstile and rate-limit
checks. There is no public delete endpoint; deletion remains an owner action in
the Cloudflare D1 dashboard.

## Cloudflare resources

- Worker: `shan-verse-blog-comments`
- D1 database: `shan-verse-blog-comments`
- D1 binding: `COMMENTS_DB`
- Route: `shan-verse.com/api/comments*`

The Worker requires two encrypted secrets:

- `TURNSTILE_SECRET_KEY`
- `COMMENT_HASH_SALT`

Apply migrations and deploy from the repository root:

```sh
npx wrangler d1 migrations apply shan-verse-blog-comments --remote --config workers/blog-comments/wrangler.toml
npx wrangler secret put TURNSTILE_SECRET_KEY --config workers/blog-comments/wrangler.toml
npx wrangler secret put COMMENT_HASH_SALT --config workers/blog-comments/wrangler.toml
npx wrangler deploy --config workers/blog-comments/wrangler.toml
```

## Comment availability

Comments are enabled for every published post by default. Set `comments: false`
in every locale variant to opt a post out. Translation variants share one
discussion because `BlogPostPage.astro` uses `translationKey` as the thread key.

The static site generates `/comment-threads.json` during every build. The Worker
uses that manifest to recognize current and future published posts, so adding a
post no longer requires changing or redeploying the Worker. `ALLOWED_COMMENT_THREADS`
remains available as an explicit fixed-list override for testing or emergencies.

## Deleting a comment

Open the D1 database in Cloudflare, use **Explore Data** to find the comment ID,
and delete that row. The equivalent SQL is:

```sql
DELETE FROM comments WHERE id = 'comment-id';
```

IP addresses are never stored. The Worker hashes the connecting IP with
`COMMENT_HASH_SALT` and retains only that hash for the three-comments-per-ten-
minutes rate limit.

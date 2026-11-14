# Loading and navigation performance

## Chinese About copy glyph coverage (active, 2026-11-14)

New ALPS work-experience text exposed missing Han glyphs in the existing
740-character Zhuque About subset. Those characters fell through to Noto Serif
SC inside otherwise Fangsong words. This is a coverage issue, independent of
the successful same-origin font-delivery migration below.

Keep the five existing subsets byte-identical. Add a small complementary subset
from the exact same Zhuque v0.212 source, with unchanged outlines and metrics.
Only the Chinese About layout inserts its distinct family alias between the
original About face and Noto. This narrowly supersedes the stack-parity invariant
below for that layout; English, Japanese, other pages and all Google faces retain
their existing stacks. The source hashes, included characters, tool options and
output identity live in `src/data/about-font-supplement.json`; the adjacent
existing OFL remains applicable. Regeneration uses the pinned release and the
manifest's standard `pyftsubset` options, without a new build/runtime dependency.

Verification must inspect Chromium's actual glyph providers for rendered Chinese
About copy, rather than just its computed family list or `document.fonts.check`.
The regression fails before the fix because Noto renders missing characters.
Future About additions outside the base and supplement should fail this check:
extend coverage from the pinned source, or explicitly review an unavailable
glyph, instead of silently accepting another mixture. This is bounded to current
About copy, not a claim of universal Unicode coverage.

Implemented coverage: 18 added glyphs / 7,260 bytes, covering the 394 unique Han
characters in the current affected Chinese copy together with the base subset.
All added outlines and horizontal metrics match the pinned source; repeated
subsetting produces identical bytes. Local checks pass: 131 Astro files with
zero diagnostics, ESLint, seven targeted unit tests, 294-page build/HTML validation
and three browser cases including actual glyph providers, SPA locale switching
and the responsive resume layout. The pre-fix counterexample reports 13 glyphs
rendered by Noto in one paragraph; the same check passes after coverage is added.
Screenshots and the failing log are retained in
`2026/11/14/about-font-consistency/`. Independent scope/coverage review found no
blocker. Rollback removes the additional face and local stack override without
rewriting any original font.

## Font delivery and security follow-up (active, 2026-11-14)

Owner outcome: optimize font loading and apply dependency security patches while
preserving the original website style. This supersedes the earlier deferral of
these two items below; other loading decisions remain active.

Design review: keep the existing six Google families and all five local Zhuque
subsets. Mirror the exact upstream WOFF2 bytes and CSS face declarations onto the
same origin. Preserve family names, face order, discrete weights, styles,
`font-display: swap`, Unicode ranges and all existing CSS stacks. A shared hashed
stylesheet URL persists across Astro locale/page navigation. Preload only the
primary Cinzel and Crimson Pro normal Latin files, not all CJK partitions.
Font files remain browser-demand-loaded. Preserve full upstream glyph partitions
for future content/comments; do not subset to today's text or add missing weights.

Alternatives considered: Astro's Fonts API is mature, but its default subset,
family/fallback generation and provider refresh need extra migration work for
exact existing-face parity. Async external CSS retains third-party availability
and swap behavior. Pinned same-origin assets preserve today's font matching,
support offline builds and avoid runtime Google font requests. Regeneration is
explicit against a pinned snapshot, with source/file hashes and upstream OFL
licenses. No source font is re-encoded. New font binaries and versions require
a deliberate refresh and visual review. This adds vendored assets to the repo;
on-demand browser loading and hash identity bound runtime/cache costs.

Dependency design: stay within current major versions, apply patched upstream
Astro/ESLint/transitive versions and retain exact Sharp 0.35.5 for derivative
reproducibility. A narrow `typescript-estree` minimatch override is necessary while
upstream still requests the vulnerable old major; retain its existing glob API,
verify compatibility and remove the override when upstream supports the fixed
major. No `audit fix --force`, lint downgrade or Worker redeployment is needed.

Acceptance: original face descriptors/coverage and five Zhuque hashes remain
identical; real same-origin font loads pass with Google blocked, including
Crimson italic, missing-weight matching and CJK fallback outside Zhuque subsets.
Compare font-ready text metrics/screenshots for EN/ZH/JA and SPA locale changes.
Keep colors, spacing, content, graph forces and existing UI unchanged. Require
full/omit-dev audit zero, a valid installed dependency graph, glob compatibility,
the full repository quality gate, production exclusion of diagnostics and an
independent review. Browser timings are device/cache observations, not a general
speed guarantee. Rollback is a normal Git revert; no persistent data is migrated.

Sources: [Astro fonts](https://docs.astro.build/en/guides/fonts/),
[Google CSS API](https://developers.google.com/fonts/docs/css2),
[Google browser-specific delivery](https://developers.google.com/fonts/docs/technical_considerations).
Current implementation/evidence is recorded after verification below.

### Font/security implementation and review packet

`src/data/google-fonts-upstream.css` is the reviewed provider snapshot; the
generated `google-fonts.json` records provenance, faces, local file hashes and
licenses. It is build-only data, not a browser payload. The shared stylesheet
keeps all 940 face declarations; 608 original WOFF2 files total 21,476,900 bytes
across the full catalog, with Unicode-driven on-demand loading. Only two Latin
files (25,904 and 48,200 bytes) are preloaded. The five existing Zhuque files and
their license remain byte-identical.

Maintenance: `npm run check:fonts` verifies pins offline without writing or
fetching; `npm run vendor:fonts` restores missing files from pinned sources with
hash checks. Neither runs network requests during build. Reinitializing/replacing
the provider snapshot requires a reviewed source hash/inventory change; there is
no automatic latest-font refresh. Pre-existing directory/file links and Windows
junctions are rejected before reads or writes, including manifest and snapshot
paths. These local checks do not claim atomic protection from a hostile concurrent
process. Content-hashed files are not overwritten or automatically pruned.

Dependencies: Astro 7.4.12 and ESLint 10.15.0 retain the existing major versions.
Patched transitive dependencies include Undici 8.12.4, Zod 4.6.7, fast-uri 3.1.9
and minimatch 11.0.8. Sharp stays exactly 0.35.5. The narrow
`@typescript-eslint/typescript-estree` override replaces its vulnerable minimatch
10 range while retaining the named function / `dot:true` API. A 608-case old/new
glob comparison, actual lint, type checks and full regression pass. Remove the
override when upstream adopts a patched range and the ordinary gate passes
without it; do not propagate it globally or downgrade lint rules.

| Item | Result and boundary |
| --- | --- |
| Goal / behavior | Same typography with no runtime Google font service dependency; security-maintenance findings addressed. |
| Architecture | Pinned same-origin fonts/CSS and two Latin preloads; no new runtime package, backend or persisted state. Existing discrete face matching is retained rather than broadened to variable ranges. |
| Invariants | Typeface bytes, weights/styles, Unicode ranges, font stacks, five Zhuque subsets, colors, spacing, personal content, 106 graph nodes/49 edges and force equations remain unchanged. |
| Caption correction | Canvas caption measurement now resolves the existing DOM font family once per mount. Font-ready/loading-done events invalidate only measurement caches and wake the existing renderer; alive/AbortSignal guards prevent teardown callbacks. No per-frame DOM reads. |
| Automated evidence | Full local gate: Astro 131 files with zero diagnostics, ESLint, 188 passed unit tests/zero failures plus one explicit Windows file-symlink privilege skip, 297-page build/HTML validation and 74 passed E2E cases. Directory-junction counterexamples actually run on Windows; Linux CI can exercise the file-symlink case. Both full and omit-dev npm audits report zero; installed dependency graph is valid. |
| Independent browser evidence | Same 1280x720/DPR1.75 browser compares EN/ZH/JA home, JA About, ZH Blog, EN Beyond and EN Projects after fonts.ready: all 44 typography samples have identical family/weight/style/size/line-height/letter-spacing/text rectangles. New samples make zero Google font requests. EN/ZH screenshots were visually compared; all seven before/after captures are retained. |
| Counterexamples | With Google explicitly blocked, real same-origin WOFF2 files load for all six families and CJK fallbacks/rare-character probes through SPA locale changes. A real-font delay test fails before the caption fix (measurement count stays one), then passes after cache invalidation. Isolated path tests reject traversal and escaping license/metadata junctions before I/O. |
| Regression / assumptions | Keep ordinary missing-weight matching (for example Mono700 selects existing500) and OS/emoji fallbacks. Full provider Unicode coverage means its original coverage, not every possible glyph. Both same-origin delivery and original Google reference were measured in the same browser; the initial mismatched-viewport sample was discarded as a comparison and retained separately. |
| Known limits | Catalog storage grows by about 22MB; browsers do not eagerly download all files. Cold/warm cache and network conditions differ, so no universal speed percentage is claimed. Audit zero means no current registry findings, not proof against unknown vulnerabilities. The existing lazy Journey vendor-chunk warning remains. |
| Trajectory / rollback | Continue with pinned static assets and explicit reviewed refreshes. Independent reviews found and closed the junction boundary gap; no blocker remains. A normal Git revert restores the old provider/dependency state without data migration. |

Evidence is retained in `2026/11/14/fonts-and-security/`, including the full gate
log, controlled typography JSON/screenshots and the before-fix caption failure.
Dependency/glob provenance is in `2026/11/14/site-loading-performance/dependency-security-refresh.json`.

## Previous loading milestone scope (2026-11-14)

Owner outcome: opening and switching pages should feel responsive, while keeping
the current typography, artwork, layout and graph interaction. This scope refines
the owner's initial general lag report; it does not retune graph physics.

The delivery pipeline is static Astro on GitHub Pages behind Cloudflare.
No backend, hosting migration, cache-rule change or runtime dependency is needed.
The original media manifest remains the source of artwork and attribution.

## Findings and design

1. Production `/about` and `/beyond-code` return 308 to their directory URLs.
   Sample redirect responses took 90-165ms from this workstation, before the final
   HTML request. Emit the canonical directory URL directly. `localizePath` is the
   page-URL contract; `normalizePath` remains route identity without a trailing
   slash. Preserve query/fragment bytes and leave assets, APIs and external URLs
   unchanged. Blog pagination/taxonomy/posts use the same page-URL contract.
2. The 106 graph images eagerly reference 103 unique original files totalling
   4,847,616 bytes. Use reproducible aspect-preserving WebP derivatives for tiny
   graph/related images, retaining original detail and lazy Index covers. Preserve
   object positioning, including Books' upper crop and Ghibli's contained logo.
   Originals, attribution, entity IDs and preference values remain unchanged.
   Do not simply lazy-load all initially hidden, overlapping graph buttons.
   The checked-in derivatives use a 256px short edge where the source allows it,
   no enlargement and WebP quality 70. Regenerate with
   `npm run generate:beyond-thumbnails` after adding/changing original artwork;
   unit tests reject missing, stale or corrupt derivatives. Generation never
   deletes old content-hashed files; unused derivatives can be reviewed separately.
3. Immediate module setup and Astro's first `astro:page-load` both initialize the
   same DOM. Each live graph root/star canvas should initialize once. Cleanup
   clears the identity guard; a replacement DOM must still initialize. Besides
   duplicate work, a late initial load must not erase an already active filter,
   query, pause preference, detail selection or navigation history.

Alternatives: Astro already prefetches hovered page HTML; adding hover attributes
would duplicate existing behavior. Its router awaits new CSS before swapping and
new scripts before `astro:page-load`. Original images are not explicitly awaited
by the graph. Public-folder images are copied unchanged by Astro, so derivative
generation is explicit and build-time, rather than pretending `<Image>` optimizes
these public URLs. The previous glow-sprite prototype did not establish a gain;
that historical rejection remains in force. No graph-library migration is
justified by the measured CPU cost.

Sources: [Astro image behavior](https://docs.astro.build/en/guides/images/),
[Astro lifecycle events](https://docs.astro.build/en/guides/view-transitions/#lifecycle-events),
and the installed `astro/dist/transitions/router.js` and prefetch implementation.
[MDN canvas guidance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
and [browser animation guidance](https://web.dev/articles/animations-guide) inform
future paint work, but are not measurements of this site.

## Verification and measurement boundaries

- Preserve all 106 nodes, 49 relationships, category geometry/contact gates,
  original artwork and hover/focus/Back/reset semantics.
- Test canonical page links and locale switching, including fragment/query and
  non-page counterexamples. Old slashless entry URLs remain reachable.
- Verify derivative coverage, source hashes, aspect ratio, decoding and a bounded
  total payload; stale/missing generated data should fail rather than silently
  request every original again.
- Reproduce delayed initial image loading while changing filters/query/pause/
  selection, then release load and verify state remains. Leave and reenter via
  Astro to prove the identity guard does not prevent legitimate mounting.
- Run the repository quality gate and inspect the actual browser. Exclude local
  opt-in diagnostics from all production bundles.

Local diagnostics: append `?site-profile=label` to an initial development URL.
It reports navigation/resource timings and long tasks to the console, for at most
eight page-load/transition reports or three minutes, with at most 128 long-task
entries and an explicit dropped-entry count, without telemetry or visible UI.
`?graph-profile=label` remains the bounded frame/JS sampler. Browser screenshots
and measurements for this change live in `2026/11/14/site-loading-performance/`.

The initial local warm-cache resource sample confirms 103 original image requests
and 4,847,616 encoded bytes, but only 30,900 transferred bytes due to revalidation.
Its 245.3ms load and 245.2ms About transition are development observations, not
production cold-cache guarantees. The graph's 106-body browser p95 was about
0.5-0.6ms for physics and 0.5-0.6ms for render JS at 1138x1039/DPR1.75. Neither
sampler measures compositor/GPU cost or proves performance on another device.
After delivery changes, the actual browser requested 103 thumbnails and zero
original covers before selection: 1,468,968 encoded bytes, a 69.7% reduction.
All 106 graph images decoded successfully. The new thumbnail URLs were uncached
(1,499,868 transferred bytes, 454.5ms development load), unlike the warm original
sample; those load durations are not a valid speed comparison. `readyMs` observes
Astro's page-load plus two animation frames, not all images or completed GPU paint.

## Remaining debt, ordered by evidence

- The font/provider and dependency findings that motivated this follow-up are
  resolved above. Initial audit was 14 affected package entries (2 high,
  12 moderate), including three omit-dev entries; this was not a count of distinct
  advisories. Primary reports remain useful history:
  [Astro](https://github.com/advisories/GHSA-r3h5-4585-7x3w),
  [Undici](https://github.com/advisories/GHSA-2m5v-pch6-74hx),
  [Zod](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
- The decorative starfield draws 300 gradients per frame at normal desktop
  refresh rates. Glass/backdrop paint and cursor DOM particles can contribute
  runtime cost; fresh isolated A/B evidence is required before changing the look.
- Audio writes playback position to synchronous storage on every `timeupdate`;
  it can later throttle saves with pause/pagehide flushing. It has no idle RAF.
- Homepage calendar has full and compact DOM representations. Measure startup
  tasks before refactoring its recently stabilized rendering contract.
- Asset caching can be improved only through actual hosting configuration.
  A `_headers` file does not configure this GitHub Pages deployment, and HTML
  cache changes must not cause stale content.

## Previous loading milestone review packet (font/dependency notes superseded above)

| Item | Result and boundary |
| --- | --- |
| Goal / behavior | Responsive opening/switching: remove the internal redirect hop, deliver lighter covers and mount each live scene once. |
| Architecture | Canonical page-URL presentation contract; checked-in, hashed media derivatives; per-DOM lifecycle guards. No backend, runtime dependency, persistence or security-boundary change. Sharp 0.35.5 was already installed via Astro; it is now an explicit pinned build/dev dependency for regeneration. |
| Invariants | All 106 entities/49 relationships, attribution, original detail covers, typography, crop rules, force equations and layout/contact gates remain unchanged. |
| Assumptions | The current host serves directory URLs. Original files remain authoritative. Browser media caching and cross-origin timing visibility vary. |
| Automated evidence | 181 unit tests, ESLint, 126-file Astro check with zero diagnostics, 297-page static build/HTML validation and 69 browser E2E cases pass. Production bundles contain neither site nor graph profiling. Existing large lazy Journey vendor-chunk warning remains unrelated to initial main-page JS. |
| Browser evidence | Actual browser confirms 106 decoded thumbnails, 103 thumbnail requests/zero originals before selection, original detail image after selection, Books' 50% 25% positioning and Ghibli contain. Canonical nav URLs are visible in EN/ZH/JA automated checks. |
| Regression surface | Locale/blog/project/CLI links, delayed first load, original cover on demand, Astro cleanup/reentry and recently stabilized stats/calendar. |
| Counterexamples | Gated image loading preserves an already selected detail/filter/query/pause state through the real initial Astro event. SPA leave/reentry initializes a fresh scene. Duplicate canvas events, replacement DOM, missing canvas/context retry, path traversal, stale hashes and corrupted pixels are covered. |
| Known risks / reversal | Lossy thumbnails are for small circles only. Old hashed derivatives are not auto-pruned. Fonts remain external. Revert is an ordinary Git revert with original artwork retained. No production cold-network speed guarantee is made. |
| Unresolved / trajectory | Device/GPU and external-font cold-load costs need separate measurement. Continue with the current static architecture, then isolate font delivery if first-load waiting persists; no evidence supports force retuning or a framework migration. Independent final review found no blocking counterexample. |

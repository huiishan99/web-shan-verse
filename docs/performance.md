# Loading and navigation performance

## Active scope (2026-11-14)

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

- First-load fonts depend on one external render-blocking stylesheet with six
  families. Used glyphs determine actual font requests. Font delivery deserves
  isolated cold-cache measurement and visual verification before changing it.
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

## Review packet

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

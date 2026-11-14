# Beyond Code local preview

## Goal and scope

Explore personal interests through a lively constellation: recognizable works,
clear categories, and meaningful connections between works and creators. Selecting
a node should bring it into focus and open its introduction and related items.

The user approved the constellation and revised About entry for commit and push
on 2026-11-12. The constellation checkpoint is `7045510`. Reuse the site's
near-black background, brass accents, serif typography, and existing interest
content. No new runtime dependency or backend is required.

Current owner requirements are in [Controls and game additions](#controls-and-game-additions-2026-11-14)
and [Category legibility](#category-legibility-2026-11-14),
which refines the [second approved expansion](#approved-expansion-2026-11-14-second-batch)
and [the first approved expansion](#approved-expansion-2026-11-14).
The motion prototype and older publication checkpoints below record the design
and evidence at those stages; their removed category hubs are historical.

## Controls and game additions (2026-11-14)

Owner requests: fix the pause button display and make returning to a default view
quick; verify English book names; add Assassin's Creed series with exactly II,
Brotherhood and Revelations, plus standalone Yakuza 0. Subsequent steering removes
Hobbies and its four generic Traveling/Reading/Gaming/Board gaming entities. This
supersedes historical Hobbies retention: the resulting collection has 106 nodes
(102 personal and four contextual), seven categories and 49 relations. No other
Assassin's Creed works, Ezio person node, Yakuza series or Director's Cut entity
is authorized. Preserve genuine original-game covers and neutral preference data.

Name evidence: English editions retain [Les Misérables](https://www.penguinrandomhouse.com/books/84269/les-miserables-by-victor-hugo/9780679643333/).
Replace the English display of the German Kinder- und Hausmärchen with
[Grimms' Fairy Tales](https://www.penguinrandomhouse.com/books/354653/grimms-fairy-tales-by-brothers-grimm/),
while retaining the existing stable ID, source page and artwork. Publisher/source
names do not authorize adding any new book, author or edition.

Control findings: the pause/play SVGs use `currentColor`, but their native button
had computed black text/stroke, unlike adjacent brass Icon components. Set the
navigation buttons' color explicitly; keep one visible glyph and matching action
label in each state. Reset previously changed targets only; live circles and the
camera still eased back slowly. An explicit reset now clears gesture, search and
temporary placements, restores graph/All, sets actual circles to canonical anchors
with zero velocity, snaps the camera and resolves contacts before painting. It
preserves running/paused preference. Back restores its existing snapshot and snaps
the actual camera, without clearing history or changing anchor semantics. Entering
nodes and ordinary category browsing can retain their existing smooth camera.

Verification: inspect actual SVG colors/visibility in both motion states. Verify
one-click reset from large pan/zoom, displaced bodies, paused/running state,
selection, empty search and Index. Repeating reset must not grow history; Back
must still restore the prior logical state. Keep all physics/image-size gates.
The new game component makes the former 715px desktop graph viewport fail its
40px category-orbit gate (35.98px), while compact also falls below 35px (33.48px).
Increase desktop stage minimum by 40px to 820 (755px graph viewport), and compact
category gutter from 640 to 680 world units. This presentation adjustment retains
the 40/35px gates, image minimum and force equations. The old 715px condition is
not claimed to pass for the expanded collection.

### Controls/content review packet

| Item | Result / evidence boundary |
| --- | --- |
| Goal / behavior | Pause/play icons now inherit brass instead of native black. Reset restores view and body placement immediately; Back snaps to the prior view. Added the requested five game entities and three AC series relations; removed Hobbies and four generic entries. English Grimm title is now Grimms' Fairy Tales. |
| Architecture | One local reset action restores actual positions/camera before painting. Back performs static contact projection before its immediate paint, including an interrupted-zoom edge case. Existing history snapshots and raw offsets are retained. No new dependency/backend/persistence. |
| Invariants | 106 nodes, 102 personal/four context, seven categories, 49 relations; exact AC II/Brotherhood/Revelations children and standalone original Yakuza 0. No extra works, Director's Cut, series or preference boosts. Physics equations and 40/35px layout gates remain unchanged. |
| Automated evidence | 169 unit tests and ESLint pass. Data tests preserve stable book/game identities, clarified editions and exact additions/deletions. Layout checks run 1,800 frames with actual camera inputs; default desktop outer-orbit gap is 47.34px, compact 39.88px, with no vertical clipping or caption overlap. |
| Browser evidence | Confirmed black-before / brass-after SVG stroke and exactly one visible pause/play glyph with matching action labels. Running drag + two zoom steps + pan + one Reset returns camera diameters within 0.00002px of baseline; moving bodies are within 2.37px while idle drift continues. Paused repeated Reset gives zero positional difference. Back restores Games. Empty-search Graph Reset restores all 106; Back retraces empty Graph then Index query. AC detail shows exactly its three game entries. |
| Independent state evidence | Eight real-client-code cases with lightweight DOM/RAF stubs cover running/paused/reduced-motion, gesture, selection, query, Index, repeated Reset and Back. These are state/geometry tests, not actual browser or hardware evidence. An interrupted zoom's instant Back contact residual was reduced from 5.231px to 0.0000103px by pre-paint contact solving; history/offset semantics stay intact. |
| Assumptions / regression | Explicit Reset intentionally discards transient placements and query but preserves motion preference; Back remains navigation history. The existing Index hides graph controls, so actual UI testing switches to Graph before Reset, then verifies both Back steps. New game media represent original works, with the Ezio Collection cover used only as the series' representative image. |
| Known limits / trajectory | Real touch and OS reduced-motion remain untested. Compact is still a horizontally pannable map. Dynamic idle drift resumes after a running Reset. Continue with the bounded renderer; no force retuning or graph-library migration is justified. Owner's standing authorization covers verified commit/push. |

Current control screenshots/measurements and independent model/media reports are
retained in `2026/11/14/beyond-controls-games/`. The expanded-collection geometry
report is `2026/11/14/beyond-category-layout/106-node-geometry-final.json`.

## Category legibility (2026-11-14)

Owner outcome: All must distinguish books, movies, games and other categories;
unknown favorites must not be silently ranked by the layout. Remove year suffixes
from work display names and connect Socionics with Carl Jung. The 105 approved
entities, clarified editions and artwork remain; the extra association makes 46
relations. Descriptions/source metadata can retain dates. This approval does not
identify any favorite for preference boosts or a central showcase.

Observed problem: the current All screenshot (`01-before-all.png`) shows one
unlabeled cloud. Source geometry allocates fixed centers for the older collection,
despite Movies now containing 53 nodes versus Games 16 and Hobbies four. Category
footprints overlap. Input-order spiral positions the first entries near category
centers, and cross-category relaxation further mixes geography. This is layout
order/physics, not evidence of the owner's preference. Search, category controls,
Index, real covers and reciprocal dragging already work and remain active.

Design: two-level, deterministic base anchors. Within each category, pack genuine
connected components as compact units and treat isolated works as equal units.
Use stable IDs rather than input order, degree or inferred popularity to choose
component placement. Series parents can center their own small component because
that communicates structure. Pack content-sized category footprints with gutters;
desktop uses a wide arrangement, mobile a horizontal strip of compact category
groups. Across-category edges
remain visible and physical but cannot collapse initial category regions.
Add small passive category names above actual regions in All, without a bubble,
click target, tab stop or force body. Hover/focus titles also identify category.
Keep the existing palette, artwork, quiet idle work names and degree-based sizes;
size still means connection count, never a claim about preference.
Remove the default desaturation of low-degree works so isolated favorites are
not visually treated as less important. Work captions use the category on a
separate small line; no extra explanatory copy is added to the canvas.

Source/alternatives: [D3 position forces](https://d3js.org/d3-force/position) and
[link forces](https://d3js.org/d3-force/link) document positional targets and link
springs separately. Apply that separation in the existing renderer without adding
D3. Fully mixed forces cannot communicate category; rigid cards or walls would
discard the requested floating, yielding interaction. Initial regions are soft
targets, not hard constraints on a user's deliberate drag.

Authority change: this owner feedback supersedes older *presentation* expectations
of cross-category distance <=550 / <65% of the old spiral, <=520 displacement
from that spiral, fixed-center centroid bounds and first-entry placement. Replace
them with non-overlapping content-sized regions, category gutters and compact
same-category components. Existing physics/collision thresholds, full entity
coverage, canonical spring references, filter/selection/Back semantics and cleanup
contracts remain active. This is a reversible base-layout change, with no new
runtime dependency, backend, persistence, favorite semantics or relationship type.

Responsive/camera decision: the larger map outgrows the old 0.22 minimum camera
scale, which would clip otherwise valid category footprints. Allow 0.16 minimum
zoom with one shared helper/client limit; keep the 24–82px image-size bounds and
all contact tolerances. All uses the region's own margin plus 28px viewport
padding. At widths <=1050px, use the compact horizontal arrangement, center it
with category tops aligned and start at Games on the left. Offset this compact
overview down by 12 screen pixels to keep dynamic captions inside its top edge;
horizontal dragging reaches later groups. Keep the existing `pan-y` touch-action
and horizontal-only touch canvas pan so vertical page scrolling stays available.
A vertical category strip was rejected because those existing gestures would not
reach its lower groups. Real touch remains a separate hardware evidence boundary.

Counterexample before freezing: a wide 2.2-aspect macro arrangement fit at about
0.16, where 220-world-unit neighbors project to 35px but need at least 40px for
circles/orbits/contact clearance. Collision solving then pushed works across
caption bands and clipped circles. Use a 1.55-aspect desktop macro arrangement,
matching the client's aspect adaptation, and verify settled bodies at the actual
camera scale; merely loosening camera bounds or counting anchors is insufficient.
Place each category caption above its actual current outermost orbit, with an
eight-pixel screen gap, so settled circles cannot pass through anchor-based text.
Compact groups receive a larger horizontal gutter to absorb the 24px image floor
at overview zoom. Disable text selection only within the graph to keep label text
from starting an accidental text-drag; retain vertical page scrolling.
The final compact gutter is 640 world units; desktop uses 220. The desktop stage
has a 780px minimum, providing a 715px unobscured graph viewport. The default
1028x715 regression gate requires at least 40px between category outer-orbit
envelopes; compact requires 35px. At other noncompact widths, require distinct
envelopes, visible circles and non-overlapping captions rather than claiming the
default pixel gap universally. Captions stay at least 8px above actual orbits.

Acceptance: initial/reset All separates real category bounds including image rings
and captions; array/edge reordering does not change placements; duplicate, invalid
and cross-category links cannot inflate or merge categories. Preserve all stable
IDs, exact source editions and approved relationships, with no assigned boost.
Socionics–Jung means association, not a claim that Jung founded Socionics. Verify
desktop/mobile category recognition, long-series traversal, pause/drag, Index and
search, Back across responsive changes, and leaving/re-entering the page. Observe
actual settled frames, not only initial anchor boxes. Stop/revise if collisions
erase gutters, labels obscure covers, reciprocal dragging regresses, or an unknown
favorite must be guessed to make the result work. Mobile All is an overview; direct
category and Index access remain necessary at high content counts.

### Category legibility review packet

| Item | Result / evidence boundary |
| --- | --- |
| Goal / behavior | All now has eight labeled, separated category groups. Same-category series/creator components stay compact; cross-category links remain. Forty-one work names lose year suffixes in all three languages. Socionics links to Jung. No favorites are ranked or added. |
| Architecture | Deterministic, ID-stable two-level anchor packing replaces the old overlapping fixed-center relaxation. Compact screens use a horizontal strip. Passive DOM category captions follow actual orbit tops; runtime still has only real content bodies and semantic springs. No dependency/backend/persistence change. |
| Invariants | 105 nodes: 101 personal and four contextual; 46 relationships, exactly one new association. Stable identities, original edition metadata and covers retained. All preference boosts remain unset. Physics/network/sizing helpers are unchanged. |
| Assumptions | Series/junction centers describe graph structure. Category area follows content volume, not personal importance. Identifying the owner's strongest favorites still requires explicit input; no automatic central showcase is inferred. |
| Automated evidence | 167 unit tests, ESLint and Astro checks pass (120 files, zero diagnostics). Layout tests include real region-corner camera inputs and 1,800 physics frames. Existing solver/contact tolerances are retained. |
| Independent geometry | At the 1028x715 reference view, the minimum category outer-orbit gap is 43.60px (40px gate); compact 39.03px (35px gate). The separate independent run also checked actual-stage dimensions, the 1051/1050 breakpoint and 320/390 compact views. Captions stay at least 8px from all category orbits, including foreign groups; no vertical circle/caption clipping or label-label overlap. Other noncompact widths require non-overlap rather than the reference pixel gap. |
| Browser evidence | Fresh 1124x1039 capture loaded all 105 images, eight category names and no clipped image. Native horizontal drag moved the mobile map by about 220px. Operated Movies browsing, Books filtering/detail/Back and returning from compact to wide All (105 bodies, eight labels, no stale selection). Socionics -> Jung -> Back works. A paused 70px RE2 drag moved its parent about 2.46px and unconnected Stardew 0px, without opening details. |
| Counterexamples closed | Fixed-size category overlap; input-order central placement; series with one child initially coincident; static caption/orbit collision after settling; compact category gutters erased by minimum image size; caption top clipping; native graph drag selecting label text; responsive Back geometry mismatch. Corrected an early test fixture's label-center camera to actual region-corner inputs before accepting its result. |
| Regression / known limits | Real hardware touch and OS reduced-motion are untested. Compact All intentionally pans horizontally; some artworks can cross the viewport's horizontal edge during browsing, while direct category/Index access remains. Cross-category lines can be long or cross other regions. Preview FPS samples are environment-dependent and are not a general smoothness guarantee. |
| Trajectory | Continue with the current renderer and explicit preference metadata only. The denser taxonomy requires responsive packing, not more force bodies or inferred favorite works. Owner's standing authorization covers verified commit/push. |

Current screenshots/DOM geometry are retained in
`2026/11/14/beyond-category-legibility/`; the exact-client model is in
`2026/11/14/beyond-category-layout/exact-client-geometry-final.json`.

## Approved expansion (2026-11-14 second batch)

Authority: the owner supplied a second explicit content list and confirmed
Nobunaga's Ambition: Sphere of Influence / 創造 (the 14th entry), the animated
How to Train Your Dragon (2010), and original Resident Evil 2 (1998). Standing
authorization permits commit/push after verification. No unlisted favorite,
actor, author, adaptation, or personal preference may be inferred.

Add six game entities: Resident Evil series, RE2 (1998), Village, Requiem,
Nobunaga 14, and original Taiko Risshiden V. The RE parent connects these three
new RE games and the existing RE4. Add eleven standalone movies: 3 Idiots,
The Pursuit of Happyness, How to Train Your Dragon (2010), Project Hail Mary
(2026 film), Titanic, A Beautiful Mind, Inception, Life of Pi, Gone with the
Wind, Léon: The Professional, and The Devil Wears Prada. Add ordinary series
parents with exactly Indiana Jones 1–5, The Mummy (1999/2001/2008), Terminator
1–5 by release order (through Genisys, excluding Dark Fate), and the eight main
Harry Potter films (excluding Fantastic Beasts). Expected delta: 42 nodes and
25 approved part-of edges; total 101 personal entries, four contextual entities,
and 45 relations. About remains the source of confirmed personal content.

Problem framing: the previous fixed 70px series treatment and custom LOTR
wordmark overstate a display role; the owner meant a normal covered collection
entity. Remove special series image fitting, ring styling and persistent labels.
Keep series semantics and exact child relationships. Use genuine covers for all
new items and a suitable actual LOTR collection cover. Hover, keyboard focus,
and selection reveal titles consistently for every entity kind.

Design: full unique graph degree determines a cached base diameter of
`min(76, 34 + 12 * log2(degree + 1))` pixels. This grows smoothly with diminishing
returns: a trilogy has about 58px and an eight-film collection about 72px before
zoom. Optional explicit owner preference levels 0–3 can add at most six pixels;
all current entries retain zero. Selection adds temporary emphasis, not stored
preference. The final zoomed diameter stays within 24–82px. Active visible degree
continues to control physical mass; filtering must not shrink visual hierarchy.

Alternatives and boundaries: raw linear growth makes large collections dominate;
fixed series sizes ignore actual connections. The bounded logarithmic rule is
local and reversible, needs no runtime dependency or persistence migration, and
keeps current reciprocal springs and Back state ownership. Dense overview
legibility and O(n²) contacts need real 105-node desktop/mobile observation;
category filters, search and the complete Index remain direct access routes.

Scaling observation: the first 105-body local sample spent 7.5–8.3ms p95 in
physics (45.08/46.79fps; media still incomplete), versus about 1ms at 63 bodies.
Before considering a spatial-index or renderer migration, add conservative
axis-distance rejection before exact pair geometry: circles whose horizontal or
vertical separation already exceeds the contact/repulsion range cannot interact.
Keep all existing force equations, substeps, projection iterations and tolerances.
Compare old/new seeded trajectories and diagnostics, retain collision tests and
measure the completed artwork scene again. This local reversible optimization
does not change the force contract or introduce a dependency.

Browser counterexample: at the previous 500px desktop stage height, five of the
105 image circles were partly clipped above the stage after collision settling.
The 650px prototype still clipped two circles; a 720px desktop minimum showed
all settled image circles inside the stage at the tested default viewport.
Retain the separate mobile sizing. Verify settled image bounds rather than
relying on target-anchor camera fits alone. No invisible nodes or content pruning
may be used to make the enlarged collection fit.

Verification: independently compare the exact approved entity and child sets;
verify artwork identity/decoding and source coverage; test monotonic bounded
size, neutral preferences and malformed numerical inputs. Retain physics and
navigation thresholds. Run lint/type/unit/build/HTML checks, then inspect
desktop/mobile selection, series traversal, search/Back, leaf-to-parent pulling,
idle labels and sampled frame cadence before publishing. Real hardware touch
and OS reduced-motion behavior remain separate evidence boundaries.

### Second batch review packet

| Item | Result / evidence boundary |
| --- | --- |
| Goal | Add only the requested works and series, with ordinary covers and explainable connection-based sizes. |
| Behavior delta | 42 approved entries, 25 part-of relations and genuine thumbnails added. LOTR uses a real trilogy cover and ordinary hover/focus/selection labels. Series sizes depend on degree, not entity kind. Desktop stage has more vertical room. |
| Architecture delta | Optional explicit external URL and neutral size-boost metadata extend the existing About-to-graph mapping. Base sizes are cached from the full unique graph. Conservative pair rejection avoids exact distance calculations for distant circles; force equations and state ownership are unchanged. No runtime dependency or persistence migration. |
| Invariants | Exactly 105 nodes (101 personal, four context) and 45 relations; approved installment sets only. No generic category bodies/springs, inferred favorites or assigned preference boosts. Filtering keeps full-graph visual hierarchy and active-graph inertia. |
| Assumptions | Series cover art represents a collection; Indy/Terminator use their approved first-film posters, explicitly documented as representative images. Taiko artwork is the original game's PSP-port packaging, not DX. Genuine artwork metadata records provenance, not a blanket reuse license. |
| Automated evidence | 157 unit tests pass with existing layout/collision thresholds retained; ESLint passes and Astro reports zero diagnostics across 120 files. The static site has 297 valid generated pages. 105/105 media references decode at <=500px; 41 new WebP files total 964,002 bytes. Independently inspected the exact content/child sets and all 43 new/replacement artwork entries. |
| Physics equivalence | Against HEAD `bf23a18`, 96 seeded scenarios / 2,304 frames and 123 tangent/diagonal/coincident/extreme-coordinate cases match trajectories and diagnostics exactly. The 105-body Node microbenchmark p95 changed from 3.10–3.66ms to 0.94–1.06ms; this is not browser FPS evidence. |
| Browser performance | Final 105-image scene at 1280×720 sampled 46.79/46.62fps across two 180-frame windows; physics p95 2.0ms and render p95 0.6ms. The earlier 105-body pre-rejection sample was 45.08/46.79fps with physics p95 7.5–8.3ms. These local observations include media/stage changes and do not isolate a compositor or device-independent FPS improvement. |
| Browser evidence | All 105 local images loaded. Tested each new series' 4/5/3/5/8 child scope; Harry Potter finale / Back, RE2 original / Back, mobile Nobunaga search and official outlet. Mobile long-series traversal resets detail scroll to zero. Astro About/back re-entry restores 105 images, no selection, no generic hubs and no idle labels. A paused 110px RE2 drag moved its parent 4.6px, its sibling 0.1px and unconnected Zelda <0.01px without opening details. |
| Counterexamples / regression surface | Exact version clarifications, excluded sequels, neutral boost, invalid sizing numbers, complete Index, hidden/duplicate physical endpoints, circle clipping, reciprocal drag and page teardown. Desktop 500/650px stage clipping was observed and corrected locally at 720px. |
| Known risks / unresolved | Mobile All is a dense overview that still requires pan/zoom or category/search/Index; all 105 entries remain reachable with no document overflow. Straight lines can cross other nodes. Actual touch hardware and OS reduced-motion settings remain untested; no universal 60fps claim. |
| Trajectory | Continue with the bounded renderer. Measured local rejection is justified; a new force library, spatial index or renderer migration is not required for this batch. Standing owner authorization covers verified commit/push. |

Raw scene checks, artwork contact sheet and media report live outside the repo in
`2026/11/14/beyond-second-batch/`; reproducible physics comparisons are in
`2026/11/14/beyond-physics-axis-audit/`.

## Motion implementation review (2026-11-14; category hubs superseded)

Authority: owner feedback after published `237af22` requests smoother motion,
small-to-large as well as large-to-small pulling, and connection-dependent
inertia. This initially superseded the earlier one-way membership-force rule
and full-component release translation. The subsequent expansion removes category
hubs entirely and authorizes publishing the completed combined revision.

Framing: the scene renders at a deliberate 30Hz cap, sometimes skipping an extra
RAF interval; membership links are excluded when dragging a content node. All
unpinned bodies currently have equal mass. Release then applies the source's
entire displacement to its factual component, replacing elastic deformation with
a rigid target shift. These are implementation choices, not missing source data.

Design: preserve the 49 content nodes, eight hubs, eight sourced factual links,
current straight-line style, stable browsing anchors and page-local Back. All
visible membership and factual connections participate in reciprocal physics.
Compute bounded inertia from the active, unique connection degree; hidden bodies
neither push nor make visible bodies artificially heavy. Store actual placements
after a completed gesture rather than translating an entire connected component
by the dragged node's delta. Cancel/lost capture must not commit placement.

Use every RAF with elapsed-time camera easing and bounded physics substeps;
cache DOM references and avoid rewriting unchanged presentation on every frame.
First measure the current JS solver, render work and real browser frame cadence.
Keep diagnostics development-only, bounded and outside visible product UI.

Alternatives: raising spring strength alone cannot repair missing reciprocal
edges or a frame cap. Replacing DOM/canvas and the entire solver with a library
would add migration risk before evidence of a CPU bottleneck. The current
57-body solver's Node benchmark p95 is about 0.66ms at 60Hz including all 57
layout links (not a browser/paint measurement), so first fix scheduling, cached
rendering and reciprocal weighted forces in the existing small architecture.

Source boundary: [Obsidian's official release repository](https://github.com/obsidianmd/obsidian-releases#about-this-repo)
explicitly says the application is not open source. [D3's public link implementation](https://github.com/d3/d3-force/blob/main/src/link.js)
provides a mature reference for degree-based strength and endpoint bias. Reuse
those principles with attribution, not a claim to use Obsidian's private engine.

Acceptance: measure comparable baseline/optimized cadence; leaf drags move hubs,
hub drags move leaves, and higher-degree hubs respond more slowly without being
fixed. Preserve attenuated multi-hop response and stable release. Verify cancel,
pause/reduced-motion source behavior, hidden-node exclusion, search/detail/hub
visibility, Back and Astro teardown. Do not trade away circle separation or data
semantics to claim smoother motion. Real touch/OS motion preferences remain
separate evidence boundaries unless exercised.

## Approved expansion (2026-11-14)

The owner subsequently authorized autonomous commit/push for completed changes,
removed all eight synthetic category bubbles, and supplied an explicit expansion
list. This supersedes the synthetic-hub/membership portions of the motion plan:
retain top category filters and grouped Index, but physics/rendering use only
confirmed content relationships. Keep the reciprocal, degree-weighted motion,
stable spring references and uncapped elapsed-time rendering improvements.

Confirmed additions: Fujii Kaze with Matsuri and Kirari; Carl Jung; Queen's
Another One Bites the Dust; Disney as an explicitly liked brand; Spider-Man
(the first Sony/Tobey Maguire film, verified as 2002 after the owner's tentative
1999 recollection); Ben-Hur (1959); Jiro ramen linked to ramen; otoro linked to
sushi; yakiniku linked to wagyu and beef tongue. The existing Lord of the Rings
entry becomes the explicitly requested series parent with its three film entries
(2001, 2002, 2003). No Hobbit films, Tolkien novels, additional artists, actors,
directors, or unlisted works are authorized by this list.

Remove the Howl source novel and Diana Wynne Jones nodes and all incident edges:
the owner has not read that book and requires confirmation for new personal
content. The existing Howl film remains. Existing other context creators/studios
remain clearly contextual rather than silently becoming personal favorites.
Do not infer that a related source work has been consumed or liked.

Small data extension: an interest may explicitly name its entity kind, including
person, studio and series. Personal/context status remains independent of that
kind. Source data in About continues to own confirmed interests. Food/series
relationships can cite this approval; production/brand/artist facts retain
traceable public sources. A series is a real approved entity, not a category hub.

Rendering uses full-graph degree for consistent visual hierarchy with a modest
series emphasis; current active unique edges determine physical inertia. All
content remains available on mobile without a first-three-per-category cut.
Do not use category membership as an invisible replacement spring.

Performance trajectory: a Beyond-only glow-sprite cache was prototyped but did
not establish a gain in this preview environment (pre-cache steady sample
45.79fps vs post-cache 42.56fps, star JS p95 about 1.8ms in both). Reject that
extra allocation/complexity and retain the original star renderer. Development
sampling remains opt-in; no visible status or production diagnostics are added.

### Combined release review packet

| Item | Result / evidence boundary |
| --- | --- |
| Goal | Smooth reciprocal motion with only owner-confirmed content and relationships. |
| Behavior delta | Removed generic category bubbles and membership springs; retained filters/Index. Added 16 approved entries, removed the unread novel/author and their images. LOTR is a larger real series node with three films. All 63 content nodes have local images and remain reachable on mobile. |
| Architecture delta | Visible unique factual links determine bounded mass (`1 + 0.18 * degree`). Inverse mass applies to springs and contacts. Canonical spring references stay separate from soft placement targets; completed drags save each body's actual displacement. Every RAF renders with elapsed-time camera easing and cached presentation references. No new dependency/backend. |
| Invariants | 59 confirmed personal entries and 4 explicitly contextual entities, 20 valid sourced/approved relations; no unseen books, unlisted people or hidden category forces. Current data lives in About and the normalized graph. Ordinary labels remain hover/focus/selection-only; the requested series title remains visible. |
| Assumptions | The bounded elastic network preserves base relative directions; it is inspired by public graph-force principles, not Obsidian's private engine. Only an explicit entity addition confirms a new personal interest. |
| Automated evidence | 151 unit tests pass (30 physics, 7 visible-network tests); prior thresholds retained. Astro checks 118 files with zero diagnostics and ESLint passes. Images cover 63/63 nodes, decode at <=500px, 62 unique used files total 3.99MB. The 297-page build and generated HTML validation pass; production bundles exclude opt-in development profiling and both removed images. CI gates publishing. |
| Performance evidence | In this in-app browser, the old 57-body scene sampled 23.85/24.90fps; the final expanded 63-node scene sampled 48.63/51.12fps across two 180-frame windows. Final JS p95: physics 0.9–1.0ms, render 0.4–0.5ms. These are local observational samples, not hardware-independent FPS or compositor benchmarks. |
| Browser evidence | Film drag 114.1px moved its series parent 43.3px and sibling 17.2px while unconnected sushi moved 0.3px, without selecting details. Series/three-film traversal, Fujii/two-song traversal, Jung association and yakiniku ingredients operated correctly. Paused drift measured zero. Mobile 390x844 showed all 63 nodes without horizontal document overflow, correct sushi/otoro detail and search/Index. About/back re-entry reset cleanly. |
| Counterexamples / regression surface | Hidden endpoints cannot add mass; duplicate edges cannot multiply springs. Cancel/lost capture do not retain placements. Back stores deformed positions separately and rejects geometry from an old responsive-layout epoch. Tested desktop-to-mobile Back. Detail navigation resets its scroll to the top. Matsuri/Otoro broken external titles were corrected and Kirari verified. |
| Known risks / trajectory | Actual touch hardware and OS reduced-motion settings remain untested; graph and star rendering share device/browser limits. Straight links can cross third nodes; no crossing-free optimum is claimed. Sprite caching was rejected without evidence of benefit. Continue with this bounded renderer and the owner's explicit authorization to commit/push after final verification. |

Runtime/browser evidence is retained outside the repository in
`2026/11/14/beyond-motion/` (profiles, geometry and screenshots).

## Approved refinement: coherent connections (2026-11-13)

Authority: owner feedback after published `e61fb81` requests more consistent,
Obsidian-like connections and less stretching around Cyberpunk. This scoped local
preview supersedes the earlier dashed membership/curved factual-line styling and
the category/selection-driven neighbor relocation described below. After reviewing
the local result, the owner explicitly approved commit and push of this revision.

Problem: the category-only base layout places the Cyberpunk fact endpoints 1355
world units apart. Filtering then relocates external neighbors onto a 340x250
ellipse; selection relocates them onto a different 195x165 ellipse. Browsing
therefore causes large target changes, while three line styles, captions and
moving points add visual noise. The data relation itself remains valid.

Design review: styling alone cannot repair target movement. A full unanchored
force-library migration would add dependencies and weaken category stability.
Use a single bounded, deterministic relation-aware pass for base anchors instead,
then retain those anchors across category/selection changes. Browsing changes
visibility, emphasis, camera and introduction; explicit drag owns scene placement.
Keep the existing category hubs, page-local Back, data and drag semantics.

All canvas edges use one thin, solid, straight stroke family, trimmed outside the
visible circle rings. Opacity highlights the hovered/focused/selected relationship;
category membership remains quieter. Remove canvas captions and moving particles;
the detail panel retains the actual relationship meanings. Preserve circular
artwork dimensions independently of flex layout. No factual edge is hidden just
because it is long, removed, or inferred from proximity.

References: [Obsidian Graph view](https://obsidian.md/help/plugins/graph) separates
link thickness from layout forces; [D3 link force](https://d3js.org/d3-force/link)
documents distance/strength as separate controls. This implementation keeps its
current bounded solver and renderer rather than introducing either product.

Acceptance: all 49 content nodes, eight sourced facts and eight hubs remain;
cross-category lengths shrink by a common rule without collapsing images; links
cannot reverse or enter rings when circles overlap; selecting Cyberpunk and
returning must not rewrite anchors. Verify desktop/mobile filtered selection,
Back, drag-following, pause, search/index and lifecycle. Tests must cover bounds,
determinism, invalid edges, finite coordinates and trimmed-segment geometry.
Retain explicit evidence limits for real touch hardware and OS reduced motion.

### Coherent-connection review packet

| Item | Result / boundary |
| --- | --- |
| Goal | A consistent, quiet connection layer without browsing-induced stretching. |
| Behavior delta | All links use trimmed 0.9px solid straight threads and opacity-only emphasis. Relationship explanations remain in details. Category/selection no longer rewrite neighbor targets. |
| Architecture delta | Optional semantic-edge input to the existing base-layout helper; one bounded deterministic relaxation. New pure circle-segment helper. No dependency, backend or persistence added. |
| Invariants | 43 favorites, 6 context entities, 8 factual relations and 8 layout hubs preserved; no Cyberpunk-specific exception. Ordinary titles remain quiet. Manual work/component and category/group dragging retain their existing semantics. |
| Assumptions | Category geography is a soft presentation constraint; linked works may sit near category borders. Screen collision avoidance can still adjust positions as zoom/visibility changes, but browsing never changes canonical anchors. |
| Automated evidence | 129 unit tests pass, including 8 layout and 6 line-geometry tests. ESLint passes; Astro checks 115 files with zero diagnostics. The 297-page build and generated HTML validation pass. |
| Layout evidence | In unstretched logical coordinates Cyberpunk shrinks 1355.20 to 356.10, Howl film/book 753.30 to 288.11. Maximum displacement 504.29 stays below 520; all base centers stay about 100 apart. Category collection means remain 12.4–79.6 from their original category centers. |
| Browser evidence / counterexamples | Paused Games to Cyberpunk selection changes normalized relative positions by less than 0.01; Back returns to the prior Games coordinates. A 105.5px game drag moved Edgerunners 97.0px after settling and Ramen 1.6px, with no accidental selection. At 390x844 both Cyberpunk covers measure 40.33px square; details, Back twice, search/index and About/back re-entry work without horizontal overflow. |
| Regression surface | Base anchors, line geometry, visibility/colliders, detail camera and history. Overlapping circles intentionally leave no drawable segment; hidden nodes cannot add strokes. Manual drag remains the only source of retained scene placement. |
| Known risks / trajectory | Initial relaxation is bounded, not an optimal crossing-free graph; a straight edge may still cross a third node and screen collisions can cause small local adjustments. Mobile category remapping does not guarantee the same lengths as the desktop base (Howl film/book remains about 597 world units). Actual touch hardware and OS reduced motion remain unverified. Independent final source review found no blocking issue. The owner accepted the local preview and authorized commit/push. |

Browser evidence and the mobile preview are saved outside the repository in
`2026/11/13/beyond-line-polish/browser-checks.json` and adjacent screenshots.

## Published checkpoint: clearer content and responsive bubbles

Authority: the four subsequent owner annotations define this revision. Published
checkpoint `478fdc4` was the preceding accepted version (Pages and CodeQL both
passed for that exact head). This revision was committed and pushed as `133250b`
before the next navigation refinements. The requirements below supersede the earlier simple
independent-drift behavior, while preserving collection data and relationship
meaning.

Goal: make the page read immediately as the owner's watched, read, heard, played,
and liked works and interests, with image bubbles that respond coherently to
direct manipulation.

### Design review

- Hide category-heading buttons inside the canvas while All is active; retain
  the top category filters and index so classification and navigation stay clear.
- Give food, hobbies and topics real, source-recorded images as well as works.
  Images illustrate existing entries and must not infer new favorites or facts.
- Replace the metaphorical subtitle with direct localized content wording; do
  not add ratings, completion claims, or invented personal explanations.
- Prefer a bounded, anchored 2D solver over an unconstrained force layout:
  semantic links pull related bubbles, circle contact pushes nearby bubbles,
  and damping returns the scene to a stable neighborhood. The dragged body is
  pinned to the pointer. Spatial proximity never creates a semantic edge.
- The client continues to own positions, velocity, visibility, drag state and
  lifecycle. A small DOM-independent math helper receives that state; no new
  backend, rendering framework, library, or persistence is needed.
- Reference behaviors are documented by D3's [link force](https://d3js.org/d3-force/link)
  and [collision force](https://d3js.org/d3-force/collide). Adding the library was
  considered; this 49-node scene already owns its DOM renderer and frame loop,
  so the bounded helper preserves that lifecycle and the no-new-dependency rule.
  Its target-relative displacement springs intentionally preserve long
  cross-category relationships instead of imposing one short link length.
- Image circle, outer orbit, old layout radius and accessible hit target are
  distinct sizes. The current collision margin deliberately reserves the image
  radius plus its 6px outer ring, with a further 4px gap. The caller passes that
  screen radius to `radiusFor`; the helper converts to world units exactly once.
- Pause/reduced motion stop idle drift and camera flight. Direct user drag may
  update followers and contacts synchronously; reset/filter/navigation clear
  transient state. Hidden nodes do not participate in forces or collisions.

### Acceptance and verification

| Observable behavior | Independent evidence |
| --- | --- |
| All has no canvas category headings; top filters remain usable. | Desktop/mobile browser inspection and actual category selection. |
| Every existing node has an intended image, including food/hobby/topic entries. | Manifest coverage against current data, file decoding, and representative browser images. |
| Dragging a linked work visibly pulls its related bubble more than a distant unconnected control. | A deterministic matched-horizon fixture plus actual linked-node drag; inspect displacement rather than solver-specific coefficients. |
| Dragged bubble stays on the pointer while a touching neighbor yields. | Pin/contact fixture with unequal radii; real drag must still suppress accidental click selection. |
| Contacts match visible circle sizes at low/high zoom; labels and hit targets remain separate. | Geometry checks at several camera scales and a browser collision check. |
| Release settles instead of exploding or oscillating indefinitely. | Bounded finite-state checks across normal and irregular time steps; browser release observation. |
| Hidden nodes cannot push visible nodes; pause/reset are stable. | Compare identical visible fixtures with/without hidden bodies, and test paused/reset transitions. |
| Category/index/search, keyboard closing, mobile details, and Astro re-entry still work. | Existing source/unit checks plus targeted browser regression. |

Main failure modes are stale collider sizes during zoom, drag sampling being
overridden by integration, hidden bodies exerting forces, long-frame impulses,
inertial state leaking across filters, and inaccessible moving targets. Stop and
revise if the solver needs semantic-data changes, cannot keep finite bounded
state, or makes classification and clicking less clear. Preserve the accepted
checkpoint and raw collection; do not tune tests to excuse an invisible or
unstable response. Automatic OS reduced-motion verification remains a separate
browser capability limit unless actually exercised.

Independent helper review exercised separate fixtures without changing the
implementation or its tests. Over 0.5 seconds a linked follower moved 54.23 world
units while a distant unrelated control stayed still; matched 30/60Hz horizons
gave the same result. Unequal 20/40px circles with an 8px gap preserved the drag
pin and respected screen separation across scales 0.22, 1 and 2.4. Repeating a
static solve left state unchanged. An excluded, co-located large hidden body
produced identical visible results, and repeated long time steps stayed finite.
This validates the math fixtures only; rendered-radius wiring, camera pinning,
gesture feel and browser regressions still require integration verification.

Read-only client integration review confirms shared render/solver sizing,
actual-visible-node filtering, suppression of hover/focus pins during drag,
camera freezing with pointer-offset preservation, seconds-based bounded time
steps, All-mode heading removal, and normal-sized image topics. Gesture cleanup
now clears captured drag state and all velocities for selection/detail, filters,
index, search, reset, responsive layout changes and teardown. Source re-review
confirmed that only a completed `pointerup` retains translated component targets;
cancelled or lost capture cleans up without creating a retained placement. These
two integration findings are resolved at source level. Browser checks still own
the transitions and movement quality. Paused manual steps are gesture-driven
rather than a guarantee of equal elapsed-time response at every pointer sampling
rate.

### Responsive-bubble checkpoint review

| Item | Evidence / boundary |
| --- | --- |
| Goal and behavior | All hides canvas category headings; all 49 nodes have local artwork; direct localized subtitle; linked dragging, contact separation and damped release. |
| Architecture | DOM-independent solver shares rendered circle sizes, uses per-scene placement offsets and cleans transient gestures on navigation. No new dependency, backend or persistence. |
| Invariants | 43 favorite entries, 6 context nodes and 8 sourced semantic edges remain unchanged. Topic illustrations do not claim personal photos or experiences. |
| Automated evidence | 109 unit tests, ESLint, Astro check (110 files, zero diagnostics), 297-page build and generated HTML checks pass. All 49 images decode. |
| Browser evidence | Dragging Queen 166.4px moved its songs 106.4/105.7px while unrelated controls moved under 1px. Dragging Ramen onto Sushi displaced Sushi 83.6px and preserved a 21.2px image-circle gap. No accidental selection. |
| Counterexamples | Pause drift and double-reset difference were both zero. Index search, Escape/focus recovery, 390x844 Traveling details without document overflow, and About/back lifecycle operated successfully. |
| Risks and assumptions | Damped graph interaction, not fluid simulation. Actual touch hardware and OS reduced-motion setting remain untested. Very fast unsampled pointer jumps can theoretically cross contacts. |
| Regression surface and decision | Rendering, gestures, category/search/index and Astro teardown. The owner accepted the local result and requested publishing it before the next refinements. |

Browser measurements are saved outside the repository in
`beyond-physics-browser-checks.json`, alongside desktop and mobile preview images.

## Published navigation checkpoint: quiet labels and local navigation (`e61fb81`)

Authority: the owner accepted the responsive-bubble checkpoint and explicitly
requested publishing these follow-up changes as well. Keep the same visual theme
and collection. Work labels appear only on hover, keyboard focus or selection;
remove the bottom instruction sentence. Motion controls name the actual action.

Design: introduce eight client-layout category hubs, separate from the 49 content
nodes and eight factual edges. Dashed membership links connect category hubs to
visible category members; stronger solid curves remain factual relationships.
Hubs share the collider/drag loop. Dragging a hub translates that category;
dragging a work retains its factual connected-component behavior. Hubs cannot
invent favorites or enter introduction/creator relationship lists.

Back is page-local bounded navigation, never browser history: snapshot category,
query, view, selected item, camera and temporary placements before discrete
navigation. Consecutive search edits coalesce. Returning restores the prior view
and focus without leaving Beyond Code. The explicit About link remains separate.

Verification targets: quiet idle labels and discoverable keyboard labels; visible
membership versus factual lines; category click and drag; search/index/detail
Back traversal, empty-stack safety, mobile category access and navigation cleanup.
Keep the existing size rule (first two favorites per category emphasized in All;
category/search/selected neighbors emphasized dynamically) and explain it to the
owner. No rating or popularity semantics are implied. Main risks are membership
springs overpowering factual edges, hidden colliders and accidental Back loops.

### Navigation refinement review packet

| Item | Result / boundary |
| --- | --- |
| Goal | Quiet idle canvas, clearer associations and a safe way to step back inside Beyond Code. |
| Behavior delta | Content labels appear on hover/focus/selection; eight category bubbles connect members with dashed spokes; factual curves are brighter. Back sits below filters; footer hint removed; motion control uses pause/play and localized action names. |
| Architecture delta | Eight synthetic layout bodies, no extra content nodes. Membership forces activate only during a hub drag. A cloned, 32-entry page-local history restores category/query/mode/selection/camera/placements. |
| Invariants | Collection remains 43 favorites plus 6 context nodes, with 8 sourced factual edges. Membership never enters detail relationship data. Hidden bodies cannot collide. Back never calls browser history. |
| Assumptions | Existing first-two-per-category emphasis is visual hierarchy, not a preference ranking. Hub captions remain readable while ordinary titles are quiet. |
| Evidence | 115 unit tests, ESLint, Astro check (112 files, zero diagnostics), 297-page static build and generated HTML validation pass. Independent source review found and resolved hub collider sizing and same-view/empty-reset history boundaries. |
| Browser evidence | A 116.6px Games-hub drag moved its ten members 66.9–151.4px after settling; distant Ramen moved 2.9px. No category activation or item selection after dragging. Idle labels absent; keyboard-focused Stardew name became visible. |
| Counterexamples tested | Games/detail/Back/category/Back/All; Index/search/detail/Back/search/Back/full Index/Back/All; paused Bohemian Rhapsody/Queen/Back/song/Back/Music/Back/All; empty All Reset leaves Back disabled. At 390x844 Hobbies/Traveling/Back/Hobbies/Back/All worked without horizontal overflow; hub and Back targets measure 44px. About/back re-entry resets to 49 content nodes, 8 hubs and empty history. |
| Regression surface | Canvas links, captions, hub contacts, gesture capture, search/index/detail state and Astro cleanup. The independent final source review found no material unresolved issue. |
| Known risks / trajectory | Actual touch hardware and OS reduced-motion remain outside browser evidence. This is bounded damped motion, not a fluid solver. Continue with this local renderer; no dependency or data-model migration is justified. Owner authorized commit/push of this revision. |

Measurements are preserved in `beyond-navigation-browser-checks.json` outside the
repository with the desktop/mobile preview images. An immediate scripted click
during the category camera flight did not select the moving song; the stable,
paused traversal above verified relationship Back behavior separately.

## Acceptance criteria and invariants

- Every existing interest remains reachable by name and category. A visible
  classification or index provides a direct route without requiring graph search.
- Names remain readable; drifting nodes do not become moving click targets.
  Dragging pans the scene, while an intentional click selects a node.
- Category hubs and dashed spokes describe membership. Work-to-work edges describe explicit facts such
  as performer, author, adaptation, production, or shared fictional universe;
  visual proximity alone must not generate an asserted relation.
- Existing interests remain the source of favorite content. Additional artists,
  authors, studios, and source works are context, explicitly marked in data;
  their appearance does not claim that the user likes everything they created.
- Each edge has traceable existing metadata or an official-source URL. Do not
  invent personal opinions, ratings, or new favorite works.
- Keyboard users can reach and select works, close details, and return to the
  scene. On mobile, details remain dismissible and controls remain reachable.
- Reduced-motion preferences stop automatic drift and camera-flight animation.
  Page navigation cleans up animation, observers, and event handlers.

## Verification and review

Node tests check content fidelity, localization, context semantics, valid graph
references, relationship provenance, camera inverses, pointer-anchored zoom,
feasible viewport fits, and finite empty/tiny-view behavior. The minimum zoom
limits mean that a full overview can extend beyond a small viewport; the category
and index controls must keep every work reachable. Browser verification must separately
exercise category changes, node selection, related-item navigation, drag versus
click, keyboard dismissal, mobile layout, reduced motion, and leaving/re-entering
the page. Static checks alone do not establish motion quality or usability.

Independent source and unit review: the 11 focused Node tests pass. Source review
confirmed that static/reduced-motion selection resets synchronize node positions,
and closing details returns focus to a visible node or the search field. It also
checked drag-click suppression, observer/listener cleanup, hidden-page animation
pausing, category/search/index transitions, and synchronous detail updates. These
are source-level findings; this review did not operate a browser or certify label
placement, visual collision handling, mobile gestures, or the feel of movement.

Review risks are label collisions, an unreadable dense graph, hidden nodes after
filtering, late image/detail responses showing the wrong selection, and duplicate
animation loops after Astro navigation. Real artwork may depend on source
availability; missing media must preserve names and navigation.

The owner accepted the visual direction and authorized publishing this version.
Further graph expansion is outside the release scope.

## Constellation checkpoint review packet

| Item | Observed result / boundary |
| --- | --- |
| Goal | Test a readable, lively interest constellation locally before choosing a final design. |
| Behavior delta | Separate `/beyond-code` route with category focus, draggable image nodes, related-item traversal, search, index, and mobile details. |
| Architecture delta | Existing About data feeds a normalized graph; local artwork/summary snapshots feed an accessible DOM scene with canvas edges. No backend or dependency added. |
| Invariants | 42 interests preserved, 6 context nodes distinguished, 8 factual edges sourced; About content unchanged. |
| Assumptions | This is a design experiment, not approval to publish. Introductions currently use English source descriptions, including in translated views. |
| Evidence | 92 unit tests pass (11 graph tests); Astro/ESLint and static build pass; 297 generated pages validate. All 34 local artwork files decode. |
| Browser evidence | Desktop category focus, movie → novel → author traversal, close/focus recovery, paused mode, empty search, index search, and Astro About/back recovery operated in the in-app browser. A real node drag did not open details. At 390×844, category selection, bottom details and index → search → selection worked without horizontal document overflow. |
| Regression surface | A new localized route registration; existing navigation and About rendering were inspected. No existing page content or backend was changed. |
| Known risks | Automatic reduced-motion behavior has source review, not OS preference testing. Caption placement remains heuristic; this first pass needs the owner's judgment on motion and visual density. Media attribution and final copy need review before publication. |
| Counterexamples / decision | Unknown search, cross-category hidden-focus recovery, paused-layout reset, and drag/click distinction checked. Saved as local commit `7045510` after user approval; no push or deployment performed. |

## Approved About entry

The user requested replacing the About interest grid with a harmonious invitation
into the constellation. The existing `#beyond-code` anchor remains stable. The
new section uses localized personal copy and a text link with a subtle brass
underline and arrow. Its destination follows the current locale. Following the
owner's feedback, the globe icon, boxed button styling and “Step into my world”
wording were replaced with “Explore my favorites” and equivalent Chinese/Japanese
labels; the link retains a 50px click target and visible keyboard focus.
Interest data stays in the existing About collection and remains accessible in
the constellation and its index. The graph itself is unchanged from its accepted
checkpoint. The owner approved this revised entry for commit and push.

Entry verification: Astro reports 0 errors/warnings/hints; targeted ESLint and
the static build pass, and all 297 generated pages validate. In-app browser
checks confirmed English, Chinese and Japanese entry links open their matching
constellation routes; the graph-to-About return preserves the section anchor.
The latest text-link visual pass checked the English desktop entry and the Chinese
entry at 390×844: the link remains 50px high with no horizontal document overflow.
The browser was restored to its normal viewport and left on
the English About invitation for review.

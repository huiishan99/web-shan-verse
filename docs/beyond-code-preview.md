# Beyond Code local preview

## Goal and scope

Explore personal interests through a lively constellation: recognizable works,
clear categories, and meaningful connections between works and creators. Selecting
a node should bring it into focus and open its introduction and related items.

The user approved the constellation and revised About entry for commit and push
on 2026-11-12. The constellation checkpoint is `7045510`. Reuse the site's
near-black background, brass accents, serif typography, and existing interest
content. No new runtime dependency or backend is required.

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

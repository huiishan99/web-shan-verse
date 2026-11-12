# Beyond Code local preview

## Goal and scope

Explore personal interests through a lively constellation: recognizable works,
clear categories, and meaningful connections between works and creators. Selecting
a node should bring it into focus and open its introduction and related items.

This is a reversible, local preview. Do not commit, push, deploy, or replace the
existing About section without the user's subsequent instruction. Reuse the
site's near-black background, brass accents, serif typography, and existing
interest content. No new runtime dependency or backend is required.

## Acceptance criteria and invariants

- Every existing interest remains reachable by name and category. A visible
  classification or index provides a direct route without requiring graph search.
- Names remain readable; drifting nodes do not become moving click targets.
  Dragging pans the scene, while an intentional click selects a node.
- Categories describe spatial organization. Edges describe explicit facts such
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

The first review decision is whether the classification, relationship exploration,
and movement feel coherent. A successful visual experiment does not authorize
publishing or expanding the graph automatically.

## Preview review packet

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
| Counterexamples / decision | Unknown search, cross-category hidden-focus recovery, paused-layout reset, and drag/click distinction checked. Continue by reviewing the local visual experiment; no commit, push, or deployment performed. |

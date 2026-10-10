# Project Media Evidence

Project images should be traceable to a real build, deployment, or repository
artifact. A screenshot demonstrates that a visible interface loaded at capture
time; it does not by itself prove that every backend, API, or interaction path
worked.

## Capture rules

- Prefer a running local build when the project is available locally and can be
  launched without proprietary dependencies.
- Otherwise, capture the project's public deployment and record the observed
  status.
- Do not substitute generated mockups for unavailable projects.
- Keep third-party UI, artwork, and trademark attribution in captions when a
  screenshot necessarily includes them.
- Store optimized public assets in `public/images/projects/` and keep their
  source evidence in this file.

## 2026-10-04 capture batch

The browser captures used a 1440 x 900 Chromium viewport. All accepted pages
returned HTTP 200 and visibly rendered project-specific content.

| Project | Evidence source | Public asset | Observed result |
| --- | --- | --- | --- |
| 2D Shooter Game | `https://huiishan99.itch.io/2d-shooter` | `2d-shooter-gameplay.webp`, `2d-shooter-menu.webp` | WebGL build opened; main menu and gameplay rendered. |
| Math-Note | `https://math-notes-clone.vercel.app/` | `math-note-live.webp` | Drawing canvas and equation controls rendered. |
| Weather App | `https://js-weather-app-nine-wine.vercel.app` | `weather-app-live.webp` | Location-search interface rendered; weather-data lookup was not exercised. |
| Falling Sand | `https://huiishan99.github.io/web-falling-sand/` | `falling-sand-live.webp` | Hourglass simulation, particles, controls, and statistics rendered. |
| Dark Light Toggle | `https://huiishan99.github.io/web-dark-light-toggle/` | `dark-light-toggle-live.webp` | Animated desert toggle interface rendered. |
| DreamLight | `https://web-dreamlight.vercel.app/` | `dreamlight-live.webp` | BitSummit promotional landing page rendered. |
| Silver Game | `https://web-ai-in-action-frontend.vercel.app` | `silver-game-live.webp` | Dashboard rendered; the deployment still reports the generic HTML title `Create Next App`. |

Furigana for Spotify uses the real media already maintained in
`C:/dev/spotify-furigana/assets/`: the social preview and Spotify Desktop lyrics
view were optimized as `spotify-furigana-social-preview.webp` and
`spotify-furigana-lyrics.webp`. `npm run check` passed in the source repository
on 2026-10-04 (lint, TypeScript compile, 19 test files / 88 tests, build, and
generated-app syntax check). The screenshot contains third-party Spotify UI,
music artwork, and lyrics solely to demonstrate the extension; those materials
remain the property of their respective rights holders.

## 2026-10-10 Math-Note capture

`math-note-live.webp` was captured from `https://math-notes-clone.vercel.app/`
with a 1180 x 757 Chromium viewport, preserving the previous asset dimensions
and gallery layout. The page returned HTTP 200; pen input rendered the example
`1 + 1 =` without the previous configuration banner. Calculation requests were
blocked during capture and none were attempted. The public read-only
`/api/calculate/status` endpoint reported `gemini-2.5-flash`, with Gemini and
human verification configured. Successful real AI solving was confirmed by the
user; this capture verifies the visible canvas only.

## Deferred captures

The following public pages were checked but deliberately not added as project
media:

- Notion Next Chinese Blog returned HTTP 200 but rendered almost no project
  content, consistent with a missing or unavailable Notion content source.
- Yumemi Test returned HTTP 200 but displayed its data-loading failure state.
- Hexo Page returned HTTP 404 (`DEPLOYMENT_NOT_FOUND`).

Projects that require Unity editors, VR hardware, private assets, research
environments, or unavailable repositories remain without images until a real
run or an existing attributable artifact can be verified.

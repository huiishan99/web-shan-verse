# Selected project content and media sources

Checked on 8 October 2026. Source and media provenance for the targeted
project entries documented below. Category order and stable project slugs
are preserved.

## Furigana for Spotify

- Source: [v0.6.3 / `0c063cd`](https://github.com/huiishan99/extension-Furigana-for-Spotify/tree/0c063cd6eb9f355b0476e08946127bdf70d4ff5f)
- Core: TypeScript, Spicetify, Kuroshiro/Kuromoji. Windows overlay:
  PowerShell/WPF. macOS overlay: Swift/AppKit. Windows launcher: C#.
  esbuild and Vitest are development tooling.
- `spotify-furigana-lyrics.webp` is the existing conversion of the repository's
  [real lyric screenshot](https://github.com/huiishan99/extension-Furigana-for-Spotify/blob/0c063cd6eb9f355b0476e08946127bdf70d4ff5f/assets/screenshots/lyrics-view.png).
  Its [provenance](https://github.com/huiishan99/extension-Furigana-for-Spotify/blob/0c063cd6eb9f355b0476e08946127bdf70d4ff5f/assets/marketing/PROVENANCE.md)
  identifies a v0.5.1 Windows 11 capture with Spotify 1.2.97.270 and Spicetify
  2.44.0. It is not a new v0.6.3 runtime capture.
- `spotify-furigana-social-preview.webp` is the existing repository promotional
  composite using that same real capture. It is labeled as a composite in all
  three languages, and follows the runtime screenshot in the gallery.
- Spotify Desktop and Spicetify are prerequisites. The extension does not
  request Spotify credentials. Spotify UI, music artwork, and lyrics retain
  their respective rights holders.

## Tetris Clone

- Source: [`c9e4a79`](https://github.com/huiishan99/game-cpp-tetris/tree/c9e4a7911e1f01a1827048b7a301c70477180925)
- Implementation: C++17 with Win32/GDI; CMake is build tooling. Portable core
  tests are distinct from the Windows-only game window.
- `tetris-gameplay.webp` and `tetris-settings.webp` are lossless format
  conversions of the repository's 600 × 700 PNG files. No UI was generated,
  composited, retouched, or cropped.
- [Source screenshots and provenance](https://github.com/huiishan99/game-cpp-tetris/tree/c9e4a7911e1f01a1827048b7a301c70477180925/docs/screenshots)
  identify real captures of the packaged Windows x64 game in
  [CI run 37738403601](https://github.com/huiishan99/game-cpp-tetris/actions/runs/37738403601),
  on 8 October 2026.
- At this check, downloadable Windows builds are expiring GitHub Actions
  artifacts requiring sign-in. No standalone GitHub Release is claimed.

## Math-Note

- Source: [`26573f0`](https://github.com/huiishan99/web-math-note/tree/26573f02e4829b3269afd57d512ebe5ab17a93ec)
- Product: React/TypeScript canvas, Tailwind CSS and Mantine interface,
  MathJax result rendering, Python/FastAPI API and Google Gen AI SDK.
  Vite is build tooling; Vercel hosts the frontend and API.
- `math-note-live.webp` replaces the older preview with a fresh screenshot of
  the [public deployment](https://math-notes-clone.vercel.app/) captured on
  8 October 2026 at approximately 07:47 UTC. It is a WebP conversion of the
  1180 × 757 browser capture, with no crop or UI alteration.
- The existing handwritten input was preserved. No AI request was submitted
  and no generated answer was added. The visible banner states that AI
  solving is waiting for bot-protection setup and drawing/export remain
  available. The entry is explicitly marked as a prototype and records the
  pending Turnstile configuration rather than claiming successful AI solving.

All source and converted images were visually inspected before selection.
The existing gallery `contain` behavior keeps the full screenshots visible
on detail pages. Explicit card images use the existing edge-to-edge `cover`
preview behavior.

## Research Archive (formerly displayed as Hexo Page)

- Public site: [HuiShan Lai · Research](https://web-publications.vercel.app/),
  already linked from SHAN-VERSE's publication and thesis entries.
- Verified the public research index and the
  [VR Math Bridge project page](https://web-publications.vercel.app/publications/vr-math-bridge/),
  including the visible figures, manuscript/publisher links, citation, and
  BibTeX. This update describes the website implementation only; paper
  records, scientific descriptions, and results are unchanged.
- The live page identifies Hexo as its generator and loads CSS and JavaScript
  assets. The authoring setup uses Markdown and EJS templates; Vercel hosts the
  generated static site.
- `research-archive-index.webp` is a WebP conversion of a genuine 1165 × 747
  cloud-browser homepage capture taken on 8 October 2026, around 23:35 UTC.
  No UI was generated, composited, retouched, or cropped.
- The visible project name and destination were corrected while retaining the
  existing `hexo-page` slug in EN/ZH/JA. The card keeps its full-bleed preview,
  and the detail gallery shows the complete capture.
- Only the already-public website and public-facing information are linked;
  no private source repository URL or private research material is published.

## Yumemi Test

- Source: [`c16451d`](https://github.com/huiishan99/web-yumemi-test/tree/c16451de149c4d55254bcfc96433cdfd75507467).
  Inspected the React/TypeScript application, population chart, Axios API
  integration, ordinary CSS, component tests, and Vite configuration.
- Application stack: React, TypeScript, Highcharts, Axios, and CSS.
  Vite is build tooling; Vitest and React Testing Library are test tooling.
  Installed packages alone are not treated as proof of implementation.
- `yumemi-test-live.webp` is a WebP conversion of the genuine 1165 × 747
  screenshot of the [public deployment](https://web-yumemi-test.vercel.app/)
  captured on 8 October 2026 at 23:35:23 UTC.
- The capture preserves the visible data-loading error, population-category
  controls, and empty chart. No mock population data, DOM alteration, or image
  compositing was used. The original API could not supply data in the observed
  public UI; the cause was not independently diagnosed.
- The entry uses an explicit prototype status and localized availability
  wording. API replacement and changes to the application remain deferred.

## Alps Alpine Digital Cabin reference

- `alps-alpine-digital-cabin-reference.jpg` is the unmodified 1460 × 973 JPEG
  of the same user-selected cabin photograph, replacing the 579 × 388 preview.
  The higher-resolution source is published in the `srcset` of
  [webCG's Digital Cabin gallery](https://www.webcg.net/articles/gallery/43538)
  ([image file](https://webcg.ismcdn.jp/mwimgs/0/5/1460wm/img_050ae7e6826cc717bab36c71f938b477303245.jpg)).
  It is a source photograph, not an AI-generated or upscaled image.
- The caption identifies it as a reference image and links to webCG. It is not
  presented as a screenshot of the internship prototype or as a CES 2025 image.
- The internship entry describes the assigned Unity HMI work, without claiming
  authorship of the complete Digital Cabin. Card previews use `cover`; the
  detail gallery preserves the full image with `contain`.

## Solar System project preview

- `solar-system-preview.webp` is an optimized 1197 × 746 copy of the actual
  project screenshot embedded in the
  [Solar System README](https://github.com/huiishan99/unity-solar-system/blob/main/README.md).
- [Original PNG attachment](https://github.com/huiishan99/Unity_SolarSystem/assets/61934115/742ed8dc-9e79-4390-81a6-3ba95d920547)
  shows the Earth and Moon in the Unity simulation, including its lower-left inset.
- The full composition is preserved in the asset and contained detail view;
  card previews retain the site's full-bleed cover treatment. No generated image
  or external stock illustration is used.

## C# Snake Game

- Source: [`57a8b99`](https://github.com/huiishan99/game-csharp-snake/tree/57a8b99f495503ae554204af4755b7a98d1022b4).
  Inspected the project file, game presets, engine, settings, leaderboards, and
  custom rendering: C#, .NET Framework 4.7.2, Windows Forms, and System.Drawing.
  MSBuild and GitHub Actions are build/test tooling.
- `snake-gameplay.webp` and `snake-menu.webp` are lossless, pixel-identical RGB
  conversions of 704 × 524 client-area PNG captures from the real Windows app
  in [Windows CI run 37881084539](https://github.com/huiishan99/game-csharp-snake/actions/runs/37881084539),
  on 9 October 2026. The run includes the startup board-size initialization fix.
- [Original PNG files and provenance](https://github.com/huiishan99/game-csharp-snake/tree/c45d05a9a357da1d18d33758c725fd6c3d02b965/docs/screenshots)
  preserve the captured gameplay and Maze menu at an immutable source commit.
- The gameplay capture shows Maze mode with the Neon theme, obstacles, solid
  walls, and a score of 120 reached through the game's actual movement and
  tick handlers. The second capture shows the corresponding setup menu.
  No game state was injected to manufacture the score, and no UI was generated,
  composited, retouched, or cropped after capture.
- Both source images and lossless conversions were visually inspected. Cards
  retain the existing full-bleed `cover` treatment; detail galleries preserve
  the full captures with `contain`. Other project cards and shared layout are
  unchanged.

## Notion Next Chinese Blog

- Verified the existing [public destination](https://notion-next-huiishan99.vercel.app/)
  identifies the user's Chinese blog: the page title, Hui Shan sidebar, linked
  `huiishan99` GitHub profile, and personal UAV thesis article agree. It is not
  a screenshot of the generic NotionNext demonstration site.
- `notion-chinese-blog-homepage.webp` is a WebP conversion of a genuine
  1165 × 747 cloud-browser homepage capture taken on 9 October 2026 at
  03:52:48 UTC. The full viewport composition is preserved; no UI was generated,
  composited, retouched, or cropped.
- Existing NotionNext example posts and the blank-title entry remain visible
  as they appeared on the live site. The existing description and technology
  tags are unchanged; this is a media update, not an application migration.
- The card uses the site's existing `cover` treatment, and the localized detail
  gallery uses `contain` to show the full original composition.

The Snake and Notion card previews align their original images to the top so
the short mobile crop retains the snake/HUD and blog title. The optional image
focus field leaves all other cards at their existing position and does not
change any card dimensions, spacing, or detail-gallery composition.

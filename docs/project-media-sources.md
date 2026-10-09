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

- `alps-alpine-digital-cabin-reference.png` is the user-selected, unmodified
  579 × 388 PNG reference image, sourced from
  [webCG's Digital Cabin coverage](https://www.webcg.net/articles/-/43538).
- The caption identifies it as a reference image and links to webCG. It is not
  presented as a screenshot of the internship prototype or as a CES 2025 image.
- The internship entry describes the assigned Unity HMI work, without claiming
  authorship of the complete Digital Cabin. Card previews use `cover`; the
  detail gallery preserves the full image with `contain`.

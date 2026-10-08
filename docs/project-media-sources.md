# Selected project content and media sources

Checked on 8 October 2026. This refresh changes only the existing Furigana for
Spotify, Math-Note, and Tetris Clone entries. Category order, project slugs,
components, and layout are unchanged.

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
on both project cards and detail pages without changing the components.

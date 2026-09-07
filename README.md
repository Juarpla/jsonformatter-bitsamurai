# JSON Formatter Bit SamurAI

Free client-side JSON formatter and editor. Format, validate and explore JSON as
text, tree or table — in a two-panel workspace, visually inspired by
jsoneditoronline.org.

**100% client-side.** Parsing, formatting and validation run in your browser.
There is no backend, no database, no accounts — your data never leaves the
client.

## Features

- Two independent editor panels (text / tree / table modes) with a draggable
  splitter and Copy ←/→ between panels
- New · Open from disk · Save to disk · Full screen
- Copy variants: formatted, smart formatted, compacted, escaped, as-is
- Light / Dark / Browser-default theme + selectable accent color (persisted)
- Keyboard shortcuts: `Ctrl/⌘+F` search, `Ctrl/⌘+Shift+F` format
- JSON diff (Compare), JMESPath transform, Open from URL and CSV import are
  planned (see [ARCHITECTURE.md](./ARCHITECTURE.md) roadmap)

## Stack

Astro 7 (static) + TypeScript strict + [`vanilla-jsoneditor`](https://github.com/josdejong/svelte-jsoneditor)
3.x, styled with plain CSS custom properties (no framework). Deployed to
Cloudflare as static assets.

## Development

Package manager: **pnpm only**. Node `>= 22.12.0`.

```sh
pnpm install          # install dependencies
pnpm dev              # dev server (must run in background: astro dev --background)
pnpm astro check      # TypeScript/Astro diagnostics (strict mode)
pnpm build            # production build to ./dist/
pnpm preview          # preview the production build
npx @google/design.md lint DESIGN.md   # validate the design system file
```

Deploy: `wrangler deploy` (Cloudflare Workers static assets; see
`wrangler.jsonc`). Copy `.env.example` to `.env` and set
`PUBLIC_ADSENSE_CLIENT` to enable real ad slots — without it, labeled
placeholders render and no external request is made.

## Docs

- [AGENTS.md](./AGENTS.md) — agent entry point (read first)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — stack, structure, data flow, roadmap
- [DESIGN.md](./DESIGN.md) — design tokens + rationale (normative for UI)

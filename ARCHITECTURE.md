# Architecture

Architecture of **jsonformatter-bitsamurai** (product: **JSON Formatter bit-samurAI**), a client-side JSON formatter and editor. Agents: read [AGENTS.md](./AGENTS.md) first; keep this document updated in the same PR as any architecture change.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro 7 (static output) | Static shell + client-only islands; zero server code |
| Language | TypeScript (strict) | Type safety across markup and client modules |
| JSON editor | `vanilla-jsoneditor` 3.x | Precompiled vanilla bundle of `svelte-jsoneditor` (Apache-2.0); text/tree/table modes; handles huge documents; no Svelte compiler setup needed in Astro |
| Styling | Plain CSS custom properties | Design tokens in `src/styles/global.css`; no CSS framework |
| Package manager | pnpm | Only pnpm; Node ≥ 22.12 |
| Hosting | Cloudflare static assets (Wrangler) | `pnpm build` → `dist/`; config in `wrangler.jsonc` |

## Principles

1. **100% client-side.** Parsing, formatting, validation and transforms run in the browser. There is no backend, no database, no accounts.
2. **Privacy.** User JSON is never transmitted anywhere. The only external requests allowed are Google AdSense via `AdSlot.astro` (see [Advertising](#advertising)).
3. **Static-first.** The whole site is prerendered static HTML; interactivity is added client-side.

## Project structure

```
/
├── public/                  # Static assets served as-is (favicon, …)
├── src/
│   ├── components/          # UI building blocks (.astro, minimal markup)
│   │   ├── Navbar.astro     # Brand + Settings (theme/accent) + Help
│   │   ├── Menu.astro       # Accessible dropdown primitive
│   │   ├── EditorPanel.astro# One editor panel (toolbar, tabs, editor, status bar)
│   │   ├── Workspace.astro  # Two panels + splitter + middle column; editor wiring
│   │   └── AdSlot.astro     # Google AdSense slots (variants)
│   ├── config/
│   │   └── ads.ts           # Ad placements toggles + AdSense client id
│   ├── layouts/
│   │   └── Layout.astro     # HTML shell, theme bootstrap (anti-FOUC), head
│   ├── pages/
│   │   └── index.astro      # Root page (the only route today)
│   ├── scripts/             # Client-side modules (framework-agnostic TS)
│   │   ├── appearance.ts    # Theme/accent state helpers
│   │   ├── workspace.ts     # Workspace orchestration (editors, actions, splitter)
│   │   ├── shortcuts.ts     # App keyboard shortcuts (format/search)
│   │   ├── json.ts          # Pure JSON toolkit (parse/format/compact/repair)
│   │   ├── clipboard.ts     # Clipboard write helper
│   │   └── toast.ts         # Transient feedback message
│   └── styles/
│       └── global.css       # Design tokens (light/dark, accents) + base styles
├── wrangler.jsonc           # Cloudflare deploy config (assets → ./dist)
├── DESIGN.md                # Design system (tokens + rationale) — normative for UI
└── AGENTS.md                # Agent entry point
```

Conventions when growing the project:

- Components in `src/components` (one concern per file); complex client logic lives in `src/scripts` imported by component `<script>` tags — never inline in markup.
- Routes: add files under `src/pages` (static, no SSR). Keep the root page the primary editor.
- No CSS framework: use tokens from `global.css`; component-specific styles stay in the component's `<style>` (scoped).

## Rendering model

- Astro prerenders static HTML at build time. There is no server runtime.
- The two JSON editors are **client-only islands**: markup renders an empty container; `Workspace.astro` loads `src/scripts/workspace.ts`, which instantiates `vanilla-jsoneditor` via `createJSONEditor({ target, props })` on page load.
- JavaScript is required for editing features; the shell renders without it.

## Data flow

```
file / clipboard / typing
   └─▶ EditorPanel (vanilla-jsoneditor)
          ├─ text mode   ── CodeMirror-backed text editing
          ├─ tree mode   ── structural editing
          └─ table mode  ── flat view
        parse/format/validate ── all in-browser (jsonrepair, ajv inside the lib)
    └─▶ actions: New · Open(file) · Save(download) · Format in place (Ctrl/⌘+Shift+F; `src/scripts/shortcuts.ts`) · Copy(formatted/smart/compacted/escaped/as-is)
        Full screen; Copy ←/→ between panels (middle column)
```

Panels are independent editor instances; the middle column moves content between them (`Copy ←/→`). Nothing is ever sent to a server.

## Component inventory

| Component | Responsibility |
| --- | --- |
| `Layout.astro` | HTML shell; anti-FOUC theme bootstrap; loads `global.css` |
| `Navbar.astro` | Brand; Settings menu (Theme: Browser default/Light/Dark; Theme color: Green/Blue/Red); Help |
| `Workspace.astro` | Grid with two `EditorPanel`s + middle column; splitter; markup + styles only — behavior lives in `src/scripts/workspace.ts` |
| `EditorPanel.astro` | Document bar (name), app toolbar (New/Open/Save/Copy▾/Full screen), mode tabs (text/tree/table), editor host, status bar (Line/Column + size) |
| `Menu.astro` | Generic accessible dropdown (click outside + Esc close, `aria-haspopup`/`aria-expanded`) |
| `AdSlot.astro` | Reserved-space ad containers; placeholders until AdSense client id is set |

## Theme system

- Appearance: `data-theme="light|dark"` on `<html>`; absent = follow `prefers-color-scheme` ("Browser default"). Set before first paint by an inline script in `Layout.astro`.
- Accent: `data-accent="green|blue|red"` on `<html>` (default `green`); maps to `--accent`/`--accent-contrast` tokens.
- Editor appearance: the container gets the `jse-theme-dark` class (library dark theme) + `editor.refresh()`; colors are bridged to tokens via `--jse-*` custom properties in `global.css`.
- Persistence: `localStorage` keys `app.theme`, `app.accent`, `app.splitter` (left panel percentage).

## Advertising

- Single component: `AdSlot.astro` with variants `middle` (300×600, center column), `top-leaderboard` (728×90/320×100), `footer` (728×90), `sidebar` (160×600, ≥1600px viewports only). Each reserves exact space to avoid CLS.
- Enabled placements and the AdSense client id live in `src/config/ads.ts` (`PUBLIC_ADSENSE_CLIENT` env var; see `.env.example`).
- Without a client id, labeled placeholders render (useful for layout checks).
- **Auto Ads stay off**; only manual `<ins class="adsbygoogle">` slots. Ads live in the app chrome, never inside editor panels.
- GDPR/consent management (CMP) is postponed; until then only non-personalized ad settings may be assumed.

## Deployment

1. `pnpm build` → static output in `./dist/`.
2. Deploy via `wrangler deploy` (Cloudflare Workers static assets; `wrangler.jsonc` points `assets.directory` to `./dist`).

## Roadmap (postponed features)

- **Transform** — JMESPath query transform (middle column buttons; lib supports `editor.transform()` + `jmespathQueryLanguage`).
- **Compare** — JSON diff between panels.
- **Open from URL** / **Import CSV**.
- Consent management platform for personalized ads.
- i18n (UI copy currently English only).

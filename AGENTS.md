# AGENTS.md

Guidance for AI coding agents working on this repository. Keep this file concise and always up to date — it is the entry point; specialized details live in the docs linked below.

## Project overview

**jsonformatter-bitsamurai** is a client-side JSON formatter and editor web tool (two-panel workspace with text/tree/table modes), visually inspired by jsoneditoronline.org. All JSON processing happens in the user's browser — there is no backend, no database, and user data never leaves the client. Built with Astro and deployed to Cloudflare as static assets.

## Commands

| Command | Action |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Dev server — **must** run in background mode: `astro dev --background` |
| `astro dev stop` / `status` / `logs` | Manage the background dev server |
| `pnpm build` | Production build to `./dist/` |
| `pnpm astro check` | TypeScript/Astro diagnostics (strict mode) |
| `pnpm preview` | Preview the production build |
| `npx @google/design.md lint DESIGN.md` | Validate the design system file |

## Environment

- Node `>= 22.12.0`, package manager **pnpm only** (never npm/yarn)
- Astro 7, TypeScript strict mode
- JSON editing: `vanilla-jsoneditor` (precompiled vanilla bundle of svelte-jsoneditor, Apache-2.0)

## Critical rules

1. **100% client-side.** Never add server-side processing, telemetry, or requests carrying user JSON. The only permitted external request is Google AdSense, exclusively through `AdSlot.astro`.
2. **Follow the design system.** Every UI change must follow [DESIGN.md](./DESIGN.md). If you change a token, update DESIGN.md in the same change (it follows the Google DESIGN.md spec; validate with `npx @google/design.md lint DESIGN.md`).
3. **Ads only via `src/components/AdSlot.astro` + `src/config/ads.ts`.** Never inline ad code or scripts; Auto Ads stay off.
4. **TypeScript strict**: avoid `any`; no non-null assertions unless justified.
5. **Docs are deliverables.** Update [ARCHITECTURE.md](./ARCHITECTURE.md) and [DESIGN.md](./DESIGN.md) in the same PR whenever architecture or visual design changes.
6. Concise, imperative commit messages (matches existing repo style).

## Documentation index

- [ARCHITECTURE.md](./ARCHITECTURE.md) — stack, structure, rendering model, data flow, component inventory, advertising, deploy, roadmap. **Read before adding features or pages.**
- [DESIGN.md](./DESIGN.md) — design tokens + rationale (Google DESIGN.md format). **Read before any UI change.**
- Astro docs: https://docs.astro.build — consult [routing](https://docs.astro.build/en/guides/routing/), [components](https://docs.astro.build/en/basics/astro-components/), [framework components](https://docs.astro.build/en/guides/framework-components/), and [styling](https://docs.astro.build/en/guides/styling/) as relevant to the task.

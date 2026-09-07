---
version: alpha
name: HIG JSON Formatter
description: Apple Human Interface Guidelines-based design system for a client-side JSON formatter web tool. Light and dark appearance follows the operating system; the accent color is user-selectable (Blue by default, Green, or Red).
colors:
  primary: "#007AFF"
  primary-chrome: "#1E6EF4"
  on-primary: "#FFFFFF"
  background: "#F2F2F7"
  surface: "#FFFFFF"
  surface-secondary: "#F2F2F7"
  on-surface: "#000000"
  on-surface-secondary: "rgba(60, 60, 67, 0.60)"
  on-surface-tertiary: "rgba(60, 60, 67, 0.30)"
  separator: "rgba(60, 60, 67, 0.29)"
  link: "#007AFF"
  success: "#34C759"
  warning: "#FF9500"
  error: "#FF3B30"
typography:
  large-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 34px
    fontWeight: 400
    lineHeight: 41px
  title-2:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 22px
    fontWeight: 400
    lineHeight: 28px
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 22px
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 22px
  callout:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 21px
  subhead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 20px
  footnote:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 18px
  caption-1:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  mono-body:
    fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  mono-caption:
    fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  tap-target: 44px
components:
  navbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.title-2}"
    height: 52px
  toolbar:
    backgroundColor: "{colors.primary-chrome}"
    textColor: "{colors.on-primary}"
    height: 44px
  button-primary:
    backgroundColor: "{colors.primary-chrome}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 12px
    typography: "{typography.subhead}"
  button-ghost:
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 10px
    typography: "{typography.subhead}"
  link-text:
    textColor: "{colors.link}"
    typography: "{typography.subhead}"
  divider:
    backgroundColor: "{colors.separator}"
    height: 1px
  dropdown-menu:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 8px
  editor:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.mono-body}"
  status-bar:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.on-surface-secondary}"
    typography: "{typography.footnote}"
    height: 24px
  ad-slot:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-tertiary}"
    rounded: "{rounded.md}"
    padding: 8px
  page-footer:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface-secondary}"
    typography: "{typography.footnote}"
---

## Overview

Apple Human Interface Guidelines adapted to a developer web tool. The design follows the three HIG themes: **Clarity** (text is legible at every size, icons precise), **Deference** (chrome helps but never competes with the JSON content — the editor is the screen), and **Depth** (hierarchy through tonal layers, not heavy decoration).

The personality is that of a professional instrument: calm, dense, keyboard-friendly. The accent color appears almost exclusively in the toolbar chrome (like a well-worn mat around the work area) and in primary actions. Everything else is neutral. The UI ships in light and dark appearance; dark is the reference experience shown in product mockups.

## Colors

The system is built on Apple's semantic color names. **Tokens are normative for light appearance**; dark-appearance values below are applied through CSS custom properties at runtime and must stay in sync with this table.

| Token | Light (canonical) | Dark | Source |
| --- | --- | --- | --- |
| `background` | #F2F2F7 | #000000 | systemGroupedBackground |
| `surface` | #FFFFFF | #1C1C1E | secondarySystemGroupedBackground |
| `surface-secondary` | #F2F2F7 | #2C2C2E | tertiary backgrounds |
| `on-surface` | #000000 | #FFFFFF | label |
| `on-surface-secondary` | rgba(60,60,67,0.60) | rgba(235,235,245,0.60) | secondaryLabel |
| `on-surface-tertiary` | rgba(60,60,67,0.30) | rgba(235,235,245,0.30) | tertiaryLabel |
| `separator` | rgba(60,60,67,0.29) | rgba(84,84,88,0.60) | separator |
| `link` | #007AFF | #0984FF | link |
| `success` | #34C759 | #30D158 | systemGreen |
| `warning` | #FF9500 | #FF9F0A | systemOrange |
| `error` | #FF3B30 | #FF453A | systemRed |

**Accent variants** (user-selectable; the accent fills the toolbar chrome and primary actions). `primary` in the front matter is the default (Blue). The **chrome rule:** any accent fill that carries white text (toolbar chrome, primary buttons, the editor menu bar) uses the *chrome* variant — Apple's "Increase Contrast" counterpart of the accent — so white labels meet WCAG AA for text everywhere. Identity uses of the accent (brand mark, soft tints) keep the plain accent:

| Accent | Accent light | Accent dark | Chrome light | Chrome dark | White on chrome |
| --- | --- | --- | --- | --- | --- |
| Blue (default) | #007AFF | #0A84FF | #1E6EF4 | #0A6ED1 | 4.57 / 5.04 — AA for text |
| Green | #5C7A1E | #5C7A1E | #5C7A1E | #5C7A1E | 4.93 — AA for text |
| Red | #FF3B30 | #FF453A | #E9152D | #C93A30 | 4.56 / 5.08 — AA for text |

- **Primary (#007AFF):** Apple systemBlue; the default accent. Blue/red fail AA for small white text (~4:1), which is why those accents are restricted to identity uses and never carry text — text-bearing fills use `primary-chrome`.
- **Primary-chrome (#1E6EF4):** Apple's increased-contrast systemBlue; the accessible fill for the toolbar chrome and primary actions (see the chrome rule above). `--accent-chrome` in CSS.
- **On-primary (#FFFFFF):** white content sitting on primary/toolbar chrome.
- **Link (#007AFF):** Apple systemBlue; matches the default accent.

## Typography

The type system is the iOS **Dynamic Type** scale mapped to web pixels, rendered through the SF Pro system font stack (`-apple-system, BlinkMacSystemFont, 'SF Pro Text'…`) so the tool adopts the platform font everywhere with zero network cost.

| Level | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| large-title | 34px / 41px | 400 | (reserved) empty states |
| title-2 | 22px / 28px | 400 | Navbar brand |
| headline | 17px / 22px | 600 | Section titles |
| body | 17px / 22px | 400 | Default text |
| callout | 16px / 21px | 400 | Menu item labels |
| subhead | 15px / 20px | 400 | Toolbar button labels |
| footnote | 13px / 18px | 400 | Status bar, helper text |
| caption-1 | 12px / 16px | 400 | Ad placeholder, minor metadata |
| mono-body | 14px / 20px | 400 | JSON text, editor contents |
| mono-caption | 12px / 16px | 400 | Document size in status bar |

- **JSON is always monospace** (`ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas`…). Never set editor content in the sans stack.
- Labels inside the accent chrome are white; the chrome fill uses the accessible accent variant (see Colors — the chrome rule), so regular subhead (15px) weight 400 is the default everywhere — no special weight is required on any accent.

## Layout

The app is a **full-viewport instrument**: `html, body { height: 100% }`, a fixed-height navbar (72px), a flexible workspace, and panel status bars (24px) pinned to the bottom of each panel.

- **Spacing scale:** strict 8pt rhythm with a 4px half-step (`xs 4, sm 8, md 16, lg 24, xl 32`).
- **Tap targets:** interactive controls are at least **44px** tall (HIG touch minimum) — menu items, middle-column buttons. Dense toolbar buttons inside the accent chrome may be 36px on pointer-first desktop layouts; they grow to 44px on touch-sized viewports.
- **Workspace grid:** `[left panel] [middle column] [right panel]`. The middle column is 200px wide by default and widens to 234px whenever the middle ad slots are enabled (two 200×200 cards + card padding). The middle column stacks: document controls (Copy ←/→, Transform ←/→, Compare), a **Sponsored** group (two 200×200 ad cards stacked; the second hides on viewports shorter than ~864px), then a draggable splitter zone below.
- **Splitter:** dragging the middle column's lower zone changes panel widths (15%–85% clamp); the ratio persists in localStorage.
- **Breakpoints:**
  - ≥ 1280px — toolbar buttons show icon + text label; the header ad renders at 468×60.
  - 1024–1279px — toolbar buttons collapse to icon-only; the header ad renders at 300×50.
  - < 1024px — panels stack vertically; the middle column becomes a horizontal control strip between them; the header and middle ad slots are hidden.

## Elevation & Depth

Depth is conveyed with **tonal layers**, HIG-style: `background → surface → surface-secondary` create hierarchy instead of shadows. Hairline separators (`separator` token) split regions. Real shadows are reserved for floating elements only — dropdown menus, popovers, and modal overlays (`0 4px 16px rgba(0,0,0,0.12)` in light, a deeper variant on dark). The editor canvas stays perfectly flat: no border-radius, no shadow, full bleed inside its panel.

## Shapes

- **Corner radii:** `sm 4px` (buttons, inputs), `md 8px` (menus, cards, ad slots), `lg 12px` (floating panels).
- Panels and toolbars are **square-edged** (0 radius): chrome meets the viewport edge flush, instrument-like. Soft radii live inside the chrome (buttons, menus, ads).

## Components

- **navbar:** brand at left (inline squircle mark in the accent color + title-2 weight 600 for the product name "JSON Formatter", secondary color for the "Bit SamurAI" suffix), actions at right: Settings menu and Help. Height 72px, surface background, hairline bottom separator. The optional header ad pill sits centered between brand and actions (surface-secondary, radius md, hairline border, "Ad" badge on its top-right hairline).
- **toolbar:** the accent chrome strip atop each editor panel, height 44px, white icons/labels on the accessible chrome fill (`primary-chrome`). Contains New, Open▾, Save▾, Copy▾, Full screen; the document name chip lives in the same strip.
- **button-primary:** primary-chrome-filled, white text (rounded sm). Used for Compare and any future primary action.
- **button-ghost:** transparent background (omit the fill), on-surface text; hover tints with `surface-secondary`. Used for menu items and neutral actions.
- **link-text:** links inside menus and help content; link color, no underline until hover.
- **dropdown-menu:** surface background, radius md, shadow (see Elevation), 8px internal padding; items are 44px min-height callout text; destructive items use the `error` color. Variants are expressed as related entries (hover: surface-secondary background).
- **editor:** flat surface, mono-body typography, no radius. The library's internal menu bar inherits the accent via `--jse-theme-color`; its colors are bridged to these tokens through CSS custom properties.
- **status-bar:** footnote text on surface-secondary, 24px tall; left side shows caret position ("Line: n Column: m"), right side shows document size.
- **ad-slot:** ads are chrome, not content: surface background (never a contrasting color), 8px padding, radius md, caption-1 placeholder label in on-surface-tertiary. Every variant reserves its exact final size up front — fixed CSS sizes that never change with ad state — so enabling ads never shifts layout. Placements: `header` (468×60 pill inside the navbar between brand and actions; 300×50 at 1024–1279px; hidden < 1024px; "Ad" badge riding its top-right hairline), `middle` (two 200×200 cards stacked under a "Sponsored" label styled like the control-group labels; the second card hides below ~864px viewport height; hidden < 1024px), `footer` (728×90 under the workspace). Ads must never be placed inside the editor area or disguised as content.
- **page-footer:** invisible zero-height block under the workspace; hosts the visually hidden `h1` and product description (`sr-only`) for search engines and screen readers. No visual footprint, non-interactive.

## Do's and Don'ts

- Do keep 100% of JSON content in the mono stack; don't set editor text in SF Pro.
- Do use tokens (`--surface`, `--accent`…) in CSS; don't hardcode hex values outside `global.css`.
- Do reserve ad space with fixed dimensions; don't let ads push or resize editor content (CLS is a bug).
- Don't place ads or promotional UI inside the editor panels.
- Do keep every interactive element reachable by keyboard; honor the 44px touch minimum (36px allowed for dense desktop toolbar buttons).
- Don't rely on color alone to convey state — pair accent fills with weight, icons, or text.
- Do respect the user's appearance choice: absent a manual override, follow `prefers-color-scheme` ("Browser default").
- Don't add heavy shadows or gradients to flat chrome; depth comes from tonal layers and hairlines.
- Do run `pnpm visual` after any change to toolbar or menu styling — the six appearance screenshots (light/dark × blue/green/red) document every accent combo. Chrome fills always use the accessible accent variant, so white-on-chrome meets WCAG AA for text in all six.

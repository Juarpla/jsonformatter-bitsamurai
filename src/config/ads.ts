/**
 * Google AdSense placement toggles.
 *
 * - `client`: AdSense publisher id (PUBLIC_ADSENSE_CLIENT, e.g. "ca-pub-…").
 *   When absent, AdSlot.astro renders labeled placeholders instead of real ads
 *   and no external request is made.
 * - `slotIds`: AdSense ad-unit ids (`data-ad-slot`, one per size, created in
 *   the AdSense dashboard; PUBLIC_ADSENSE_SLOT_* env vars). When absent the
 *   <ins> renders without `data-ad-slot`.
 * - `placements`: enable exactly the slots that fit the layout. Reserved space
 *   never changes size, so enabling a slot must not cause layout shift.
 *
 * Sizes (see DESIGN.md → Components): `header` 468×60 ≥1280px / 300×50 below
 * (hidden <360px); `middle` 250×250; `footer` 970×90 ≥1024px / 300×50 below.
 *
 * Rules (AGENTS.md): ads may only be rendered through AdSlot.astro; Auto Ads
 * stay off; never place ads inside the editor panels.
 */

export type AdVariant = 'header' | 'middle' | 'footer';

/** Ad units: `header` and `footer` render two size-specific units; `middle` is single. */
export type AdUnit = 'header-468' | 'header-300' | 'middle' | 'footer-970' | 'footer-300';

export interface AdsConfig {
  client: string | undefined;
  slotIds: Record<AdUnit, string | undefined>;
  placements: Record<AdVariant, boolean>;
}

export const ads: AdsConfig = {
  client: import.meta.env.PUBLIC_ADSENSE_CLIENT,
  slotIds: {
    'header-468': import.meta.env.PUBLIC_ADSENSE_SLOT_HEADER_468,
    'header-300': import.meta.env.PUBLIC_ADSENSE_SLOT_HEADER_300,
    middle: import.meta.env.PUBLIC_ADSENSE_SLOT_MIDDLE,
    'footer-970': import.meta.env.PUBLIC_ADSENSE_SLOT_FOOTER_970,
    'footer-300': import.meta.env.PUBLIC_ADSENSE_SLOT_FOOTER_300,
  },
  placements: {
    header: true,
    middle: true,
    footer: true,
  },
};

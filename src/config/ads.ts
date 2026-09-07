/**
 * Google AdSense placement toggles.
 *
 * - `client`: AdSense publisher id (PUBLIC_ADSENSE_CLIENT, e.g. "ca-pub-…").
 *   When absent, AdSlot.astro renders labeled placeholders instead of real ads
 *   and no external request is made.
 * - `slotIds`: optional AdSense ad-unit ids (`data-ad-slot`, one per unit,
 *   created in the AdSense dashboard; PUBLIC_ADSENSE_SLOT_* env vars). When
 *   absent the <ins> renders without `data-ad-slot`.
 * - `placements`: enable exactly the slots that fit the layout. Reserved space
 *   never changes size, so enabling a slot must not cause layout shift.
 *
 * Rules (AGENTS.md): ads may only be rendered through AdSlot.astro; Auto Ads
 * stay off; never place ads inside the editor panels.
 */

export type AdVariant = 'header' | 'middle' | 'footer';

/** Ad units: `middle` renders two stacked units; the rest are single units. */
export type AdUnit = 'header' | 'middle-a' | 'middle-b' | 'footer';

export interface AdsConfig {
  client: string | undefined;
  slotIds: Record<AdUnit, string | undefined>;
  placements: Record<AdVariant, boolean>;
}

export const ads: AdsConfig = {
  client: import.meta.env.PUBLIC_ADSENSE_CLIENT,
  slotIds: {
    header: import.meta.env.PUBLIC_ADSENSE_SLOT_HEADER,
    'middle-a': import.meta.env.PUBLIC_ADSENSE_SLOT_MIDDLE_A,
    'middle-b': import.meta.env.PUBLIC_ADSENSE_SLOT_MIDDLE_B,
    footer: undefined,
  },
  placements: {
    header: true,
    middle: true,
    footer: true,
  },
};

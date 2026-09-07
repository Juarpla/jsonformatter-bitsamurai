/**
 * Google AdSense placement toggles.
 *
 * - `client`: AdSense publisher id (PUBLIC_ADSENSE_CLIENT, e.g. "ca-pub-…").
 *   When absent, AdSlot.astro renders labeled placeholders instead of real ads
 *   and no external request is made.
 * - `placements`: enable exactly the slots that fit the layout. Reserved space
 *   never changes size, so enabling a slot must not cause layout shift.
 *
 * Rules (AGENTS.md): ads may only be rendered through AdSlot.astro; Auto Ads
 * stay off; never place ads inside the editor panels.
 */

export type AdVariant = 'middle' | 'top-leaderboard' | 'footer' | 'sidebar';

export interface AdsConfig {
  client: string | undefined;
  placements: Record<AdVariant, boolean>;
}

export const ads: AdsConfig = {
  client: import.meta.env.PUBLIC_ADSENSE_CLIENT,
  placements: {
    middle: true,
    'top-leaderboard': false,
    footer: false,
    sidebar: false,
  },
};

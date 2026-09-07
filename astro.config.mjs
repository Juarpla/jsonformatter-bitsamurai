// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical origin of the deployed site. Every absolute URL — canonical link,
// og:url, JSON-LD, sitemap entries — derives from this. Override with
// PUBLIC_SITE_URL (see .env.example) when moving to a custom domain.
const site = (process.env.PUBLIC_SITE_URL ?? 'https://jsonformatter-bitsamurai.juarpla.workers.dev').replace(/\/+$/, '');

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap()],
});

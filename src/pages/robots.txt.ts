import type { APIRoute } from 'astro';

/**
 * robots.txt — derived from `Astro.site` (astro.config.mjs `site`) so it
 * survives a domain change without edits. Prerendered to dist/robots.txt.
 */
export const GET: APIRoute = ({ site }) => {
  const lines = ['User-agent: *', 'Allow: /'];
  if (site) {
    lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);
  }
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};

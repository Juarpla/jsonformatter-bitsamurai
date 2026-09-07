#!/usr/bin/env node
/**
 * og-image — renders public/og-image.png (the 1200×630 Open Graph / Twitter
 * card) with real Safari via safaridriver, reusing the zero-dependency
 * WebDriver pattern of scripts/visual-walkthrough.mjs.
 *
 * One-time enable (admin, interactive): sudo safaridriver --enable
 * Run: pnpm og
 *
 * The card (brand mark + wordmark on the light surface, DESIGN.md light
 * tokens) is written to a temp HTML file; the exact 1200×630 region is
 * captured with an element screenshot and verified against the PNG IHDR
 * header. Re-run any time the brand artwork changes.
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = join(ROOT, 'public', 'og-image.png');

/** safaridriver WebDriver endpoint port (distinct from pnpm visual's). */
const DRIVER_PORT = process.env.OG_DRIVER_PORT ?? '7801';
const DRIVER_URL = `http://127.0.0.1:${DRIVER_PORT}`;
/** Local HTTP port serving the card (file:// is unreliable in safaridriver). */
const HTTP_PORT = process.env.OG_HTTP_PORT ?? '4399';

const WIDTH = 1200;
const HEIGHT = 630;
/** Window big enough for Safari's chrome + the 1200×630 element, no scrolling. */
const WINDOW = { width: 1280, height: 800 };
/** Wait after load so system fonts finish rendering before capture. */
const SETTLE_MS = 600;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(ready, { timeoutMs, intervalMs = 300, label }) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (await ready()) return;
    } catch {
      /* not ready yet — keep polling */
    }
    await sleep(intervalMs);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

/** WebDriver request; returns the `value` member, throwing on protocol errors. */
async function wd(method, path, body) {
  const res = await fetch(`${DRIVER_URL}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (data.value && typeof data.value === 'object' && data.value.error) {
    throw new Error(`WebDriver ${method} ${path}: ${data.value.error} — ${data.value.message ?? ''}`);
  }
  return data.value;
}

/**
 * The card. Colors are DESIGN.md light tokens (background #F2F2F7,
 * on-surface #000, on-surface-secondary rgba(60,60,67,0.60), accent #007AFF,
 * error #FF3B30); the mark is the brand squircle from Navbar.astro.
 */
const CARD_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; }
  #og {
    box-sizing: border-box;
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    padding: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 56px;
    background: #f2f2f7;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  .mark { width: 224px; height: 224px; flex: none; }
  .text { display: flex; flex-direction: column; gap: 12px; }
  .name {
    font-size: 76px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.5px;
    color: #000;
  }
  .suffix { font-weight: 400; color: rgba(60, 60, 67, 0.6); }
  .suffix-line { font-size: 46px; line-height: 1.2; color: rgba(60, 60, 67, 0.6); }
  .tagline { font-size: 27px; line-height: 1.3; color: rgba(60, 60, 67, 0.6); }
</style>
</head>
<body>
<div id="og">
  <svg class="mark" viewBox="0 0 128 128" aria-hidden="true">
    <path fill="#007aff" d="M128.00 64.00L127.96 83.67L127.86 89.93L127.68 94.47L127.44 98.15L127.12 101.27L126.73 104.01L126.26 106.45L125.73 108.66L125.11 110.67L124.42 112.50L123.65 114.19L122.80 115.74L121.86 117.18L120.83 118.50L119.72 119.72L118.50 120.83L117.18 121.86L115.74 122.80L114.19 123.65L112.50 124.42L110.67 125.11L108.66 125.73L106.45 126.26L104.01 126.73L101.27 127.12L98.15 127.44L94.47 127.68L89.93 127.86L83.67 127.96L64.00 128.00L44.33 127.96L38.07 127.86L33.53 127.68L29.85 127.44L26.73 127.12L23.99 126.73L21.55 126.26L19.34 125.73L17.33 125.11L15.50 124.42L13.81 123.65L12.26 122.80L10.82 121.86L9.50 120.83L8.28 119.72L7.17 118.50L6.14 117.18L5.20 115.74L4.35 114.19L3.58 112.50L2.89 110.67L2.27 108.66L1.74 106.45L1.27 104.01L0.88 101.27L0.56 98.15L0.32 94.47L0.14 89.93L0.04 83.67L0.00 64.00L0.04 44.33L0.14 38.07L0.32 33.53L0.56 29.85L0.88 26.73L1.27 23.99L1.74 21.55L2.27 19.34L2.89 17.33L3.58 15.50L4.35 13.81L5.20 12.26L6.14 10.82L7.17 9.50L8.28 8.28L9.50 7.17L10.82 6.14L12.26 5.20L13.81 4.35L15.50 3.58L17.33 2.89L19.34 2.27L21.55 1.74L23.99 1.27L26.73 0.88L29.85 0.56L33.53 0.32L38.07 0.14L44.33 0.04L64.00 0.00L83.67 0.04L89.93 0.14L94.47 0.32L98.15 0.56L101.27 0.88L104.01 1.27L106.45 1.74L108.66 2.27L110.67 2.89L112.50 3.58L114.19 4.35L115.74 5.20L117.18 6.14L118.50 7.17L119.72 8.28L120.83 9.50L121.86 10.82L122.80 12.26L123.65 13.81L124.42 15.50L125.11 17.33L125.73 19.34L126.26 21.55L126.73 23.99L127.12 26.73L127.44 29.85L127.68 33.53L127.86 38.07L127.96 44.33Z"></path>
    <path d="M48 36 C41 36 41 46 41 52 C41 59 38 62 32 64 C38 66 41 69 41 76 C41 82 41 92 48 92" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M80 36 C87 36 87 46 87 52 C87 59 90 62 96 64 C90 66 87 69 87 76 C87 82 87 92 80 92" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path>
    <circle cx="64" cy="64" r="12" fill="#ff3b30" stroke="#ffffff" stroke-width="4"></circle>
  </svg>
  <div class="text">
    <div class="name">JSON Formatter</div>
    <div class="suffix-line"><span class="suffix">bit-samurAI</span></div>
    <div class="tagline">Format, validate and view JSON — right in your browser</div>
  </div>
</div>
</body>
</html>
`;

/** Serve the card HTML over loopback HTTP; resolves when the server is up. */
function serveCard() {
  return new Promise((resolve, reject) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(CARD_HTML);
    });
    server.on('error', reject);
    server.listen(HTTP_PORT, '127.0.0.1', () => resolve(server));
  });
}

/** Find the card element, polling briefly in case the load is still settling. */
async function findCard(sessionId) {
  let el;
  await waitFor(
    async () => {
      el = await wd('POST', `/session/${sessionId}/element`, {
        using: 'css selector',
        value: '#og',
      });
      return Boolean(el);
    },
    { timeoutMs: 10_000, intervalMs: 500, label: 'the #og element' },
  );
  return el;
}

async function main() {
  const server = await serveCard();

  const driver = spawn('safaridriver', ['--port', DRIVER_PORT], { stdio: 'ignore' });
  driver.on('error', (err) => {
    throw new Error(`Could not start safaridriver: ${err.message}`);
  });
  let sessionId;
  try {
    await waitFor(async () => (await fetch(`${DRIVER_URL}/status`)).json(), {
      timeoutMs: 10_000,
      label: 'safaridriver /status',
    });

    const session = await wd('POST', '/session', {
      capabilities: { alwaysMatch: { browserName: 'safari' } },
    });
    sessionId = session.sessionId;

    await wd('POST', `/session/${sessionId}/url`, { url: `http://127.0.0.1:${HTTP_PORT}/` });
    await wd('POST', `/session/${sessionId}/window/rect`, WINDOW);
    await sleep(SETTLE_MS);

    const el = await findCard(sessionId);
    const elementId = el['element-6066-11e4-a52e-4f735466cecf'];
    const png = Buffer.from(
      await wd('GET', `/session/${sessionId}/element/${elementId}/screenshot`),
      'base64',
    );

    // Verify the exact size via the PNG IHDR header (bytes 16–23).
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    if (w !== WIDTH || h !== HEIGHT) {
      throw new Error(`Captured ${w}×${h}, expected ${WIDTH}×${HEIGHT}`);
    }
    writeFileSync(OUT_FILE, png);
    console.log(`Wrote ${OUT_FILE} (${w}×${h})`);
  } catch (err) {
    if (String(err.message).toLowerCase().includes('insecure')) {
      console.error('\nIf this is the first run, enable Safari automation once:');
      console.error('  sudo safaridriver --enable\n');
    }
    throw err;
  } finally {
    if (sessionId) await wd('DELETE', `/session/${sessionId}`).catch(() => {});
    driver.kill();
    server.close();
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exitCode = 1;
});

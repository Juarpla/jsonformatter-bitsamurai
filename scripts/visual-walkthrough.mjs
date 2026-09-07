#!/usr/bin/env node
/**
 * Visual walkthrough — captures the six appearance combos
 * (light/dark × blue/green/red accents) with real Safari via safaridriver,
 * using the WebDriver HTTP API. Zero dependencies (Node ≥ 22 built-in fetch).
 *
 * One-time enable (admin, interactive): sudo safaridriver --enable
 * Run: pnpm visual
 *
 * Output: screenshots/{light,dark}-{blue,green,red}.png (gitignored local
 * evidence for DESIGN.md → Do's and Don'ts; regenerate any time).
 */

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'screenshots');

/** URL of the app under test; reuse the documented dev server by default. */
const BASE_URL = process.env.VISUAL_BASE_URL ?? 'http://localhost:4321';
/** safaridriver WebDriver endpoint port. */
const DRIVER_PORT = process.env.VISUAL_DRIVER_PORT ?? '7799';
const DRIVER_URL = `http://127.0.0.1:${DRIVER_PORT}`;

const VIEWPORT = { width: 1280, height: 800 };
/** Wait after each load so the editors finish hydrating before capture. */
const SETTLE_MS = 1500;

const COMBOS = [
  ['light', 'blue'],
  ['light', 'green'],
  ['light', 'red'],
  ['dark', 'blue'],
  ['dark', 'green'],
  ['dark', 'red'],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(ready, { timeoutMs, intervalMs = 500, label }) {
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

async function isUp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false; // unreachable / connection refused — not up
  }
}

/** Reuse the running dev server, or start `astro dev --background` (repo convention). */
async function ensureServer() {
  if (await isUp(BASE_URL)) {
    console.log(`Reusing dev server at ${BASE_URL}`);
    return;
  }
  console.log('Starting dev server: pnpm dev --background …');
  const child = spawn('pnpm', ['dev', '--background'], { cwd: ROOT, stdio: 'ignore' });
  child.on('error', (err) => {
    throw new Error(`Could not start the dev server (pnpm): ${err.message}`);
  });
  await waitFor(() => isUp(BASE_URL), { timeoutMs: 30_000, label: `dev server at ${BASE_URL}` });
  console.log('Dev server is up.');
}

async function startDriver() {
  const driver = spawn('safaridriver', ['--port', DRIVER_PORT], { stdio: 'ignore' });
  driver.on('error', (err) => {
    throw new Error(`Could not start safaridriver: ${err.message}`);
  });
  try {
    await waitFor(async () => (await fetch(`${DRIVER_URL}/status`)).json(), {
      timeoutMs: 10_000,
      label: 'safaridriver /status',
    });
  } catch (err) {
    driver.kill();
    throw err;
  }
  return driver;
}

/** Set the window size and verify Safari honored it; Safari may clamp or delay it. */
async function setViewport(sessionId) {
  for (let attempt = 0; attempt < 5; attempt++) {
    await wd('POST', `/session/${sessionId}/window/rect`, VIEWPORT);
    const rect = await wd('GET', `/session/${sessionId}/window/rect`);
    if (rect.width === VIEWPORT.width && rect.height === VIEWPORT.height) return;
    await sleep(300);
  }
  console.warn('Warning: could not confirm the exact window size; screenshots may vary in size.');
}

async function main() {
  await ensureServer();

  const driver = await startDriver();
  let sessionId;
  try {
    const session = await wd('POST', '/session', {
      capabilities: { alwaysMatch: { browserName: 'safari' } },
    });
    sessionId = session.sessionId;
    console.log(`Safari session ${sessionId}`);

    // First load establishes the origin so localStorage is writable.
    await wd('POST', `/session/${sessionId}/url`, { url: `${BASE_URL}/` });
    await setViewport(sessionId);

    mkdirSync(OUT_DIR, { recursive: true });
    for (const [theme, accent] of COMBOS) {
      // Persist the combo and reload: Layout.astro's anti-FOUC bootstrap applies
      // it before first paint, exercising the exact path a user takes.
      await wd('POST', `/session/${sessionId}/execute/sync`, {
        script: `localStorage.setItem('app.theme', arguments[0]); localStorage.setItem('app.accent', arguments[1]); return true;`,
        args: [theme, accent],
      });
      await wd('POST', `/session/${sessionId}/url`, { url: `${BASE_URL}/` });
      await sleep(SETTLE_MS);

      const png = await wd('GET', `/session/${sessionId}/screenshot`);
      const file = join(OUT_DIR, `${theme}-${accent}.png`);
      writeFileSync(file, Buffer.from(png, 'base64'));
      console.log(`Captured ${theme}-${accent}.png`);
    }
  } catch (err) {
    if (String(err.message).toLowerCase().includes('session')) {
      console.error('\nIf this is the first run, enable Safari automation once:');
      console.error('  sudo safaridriver --enable\n');
    }
    throw err;
  } finally {
    if (sessionId) await wd('DELETE', `/session/${sessionId}`).catch(() => {});
    driver.kill();
  }

  console.log(`\nDone — ${COMBOS.length} screenshots in screenshots/.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exitCode = 1;
});

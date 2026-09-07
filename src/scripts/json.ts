/**
 * Small JSON toolkit: parse/format/compact/repair plain text.
 * All functions are pure — errors are thrown, never toasted here.
 */

import { jsonrepair } from 'jsonrepair';

export function parseJson(raw: string): unknown {
  return JSON.parse(raw);
}

/** Two-space pretty print (no trailing newline; callers add it if wanted). */
export function formatJsonValue(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function compactJsonValue(value: unknown): string {
  return JSON.stringify(value);
}

/** Repair malformed JSON text (trailing commas, comments, …) into a value. */
export function repairJson(raw: string): unknown {
  return JSON.parse(jsonrepair(raw));
}

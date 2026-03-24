/**
 * splitter.ts
 *
 * Core text-splitting engine. Pure functions — no I/O, no side-effects.
 * Every export here is independently unit-testable.
 *
 * Two split modes:
 *
 *  "exact"  — Slice at exactly `charLimit` code-points per chunk.
 *             Every file except the last has exactly charLimit characters.
 *             Predictable and deterministic.
 *
 *  "smart"  — Prefer paragraph breaks (\n\n) or newlines (\n) nearest to the
 *             limit, falling back to spaces then a hard cut.
 *             A chunk NEVER exceeds charLimit characters.
 */

import { countCharacters } from "./textCounter";

export type SplitMode = "exact" | "smart";

export interface SplitResult {
  chunks: string[];
  totalChars: number;
  charLimit: number;
  mode: SplitMode;
  /** True when the final chunk is shorter than charLimit */
  hasShortTail: boolean;
}

// ---------------------------------------------------------------------------
// Exact split
// ---------------------------------------------------------------------------

/**
 * Split `text` into chunks of exactly `charLimit` code-points.
 * The final chunk may be shorter than `charLimit`.
 *
 * Uses Array.from so multi-code-unit characters (emoji etc.)
 * each count as 1 — matching countCharacters().
 */
export function splitExact(text: string, charLimit: number): string[] {
  if (!text) return [];
  if (charLimit <= 0) throw new RangeError("charLimit must be > 0");

  const codePoints = Array.from(text);
  const chunks: string[] = [];

  for (let i = 0; i < codePoints.length; i += charLimit) {
    chunks.push(codePoints.slice(i, i + charLimit).join(""));
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Smart split helpers
// ---------------------------------------------------------------------------

/**
 * Find the best split point (exclusive end) within `codePoints[startIdx..startIdx+charLimit]`.
 *
 * Priority (highest to lowest):
 *  1. Last double-newline  (\n\n) at or before the limit
 *  2. Last single newline  (\n)   at or before the limit
 *  3. Last space                  at or before the limit
 *  4. Hard cut at charLimit       (no natural break found)
 *
 * The returned index is an absolute position into `codePoints`.
 */
function findSmartBreak(
  codePoints: string[],
  startIdx: number,
  charLimit: number
): number {
  const hardEnd = Math.min(startIdx + charLimit, codePoints.length);

  // Already at or past the end — nothing to search
  if (hardEnd >= codePoints.length) return codePoints.length;

  let lastDoubleNewline = -1;
  let lastNewline = -1;
  let lastSpace = -1;

  // Walk backwards from hardEnd - 1, looking for break points
  for (let i = hardEnd - 1; i > startIdx; i--) {
    const ch = codePoints[i];

    if (ch === "\n") {
      // Check for double newline: current char is \n and previous is also \n
      if (i > startIdx && codePoints[i - 1] === "\n" && lastDoubleNewline === -1) {
        lastDoubleNewline = i + 1; // split after the second \n
      }
      if (lastNewline === -1) {
        lastNewline = i + 1; // split after the \n
      }
    }

    if (ch === " " && lastSpace === -1) {
      lastSpace = i + 1; // split after the space
    }
  }

  if (lastDoubleNewline > startIdx) return lastDoubleNewline;
  if (lastNewline > startIdx) return lastNewline;
  if (lastSpace > startIdx) return lastSpace;

  // No natural break found — hard cut at the limit
  return hardEnd;
}

// ---------------------------------------------------------------------------
// Smart split
// ---------------------------------------------------------------------------

/**
 * Split `text` preferring paragraph/line boundaries, never exceeding `charLimit`.
 */
export function splitSmart(text: string, charLimit: number): string[] {
  if (!text) return [];
  if (charLimit <= 0) throw new RangeError("charLimit must be > 0");

  const codePoints = Array.from(text);
  const chunks: string[] = [];
  let i = 0;

  while (i < codePoints.length) {
    const breakAt = findSmartBreak(codePoints, i, charLimit);
    chunks.push(codePoints.slice(i, breakAt).join(""));
    i = breakAt;
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Unified entry point
// ---------------------------------------------------------------------------

/**
 * Split text according to the chosen mode and return a rich result object.
 *
 * This is the single entry point the UI layer should call.
 *
 * @param text      Raw input text — never mutated, never trimmed automatically
 * @param charLimit Maximum characters per chunk (must be ≥ 1)
 * @param mode      "exact" for fixed-length splits, "smart" for boundary-aware splits
 */
export function splitText(text: string, charLimit: number, mode: SplitMode): SplitResult {
  if (charLimit <= 0) throw new RangeError("charLimit must be > 0");

  const totalChars = countCharacters(text);

  const chunks: string[] = mode === "smart" ? splitSmart(text, charLimit) : splitExact(text, charLimit);

  return {
    chunks,
    totalChars,
    charLimit,
    mode,
    hasShortTail:
      chunks.length > 0 && countCharacters(chunks[chunks.length - 1]) < charLimit,
  };
}

// ---------------------------------------------------------------------------
// Preview helper
// ---------------------------------------------------------------------------

/**
 * Return a preview of the first `maxChunks` chunks without running the full split.
 * Useful for showing a live preview before the user commits to an export.
 */
export function previewChunks(
  text: string,
  charLimit: number,
  mode: SplitMode,
  maxChunks = 3
): string[] {
  if (!text || charLimit <= 0) return [];

  const codePoints = Array.from(text);
  const preview: string[] = [];
  let i = 0;

  while (i < codePoints.length && preview.length < maxChunks) {
    if (mode === "smart") {
      const breakAt = findSmartBreak(codePoints, i, charLimit);
      preview.push(codePoints.slice(i, breakAt).join(""));
      i = breakAt;
    } else {
      preview.push(codePoints.slice(i, i + charLimit).join(""));
      i += charLimit;
    }
  }

  return preview;
}

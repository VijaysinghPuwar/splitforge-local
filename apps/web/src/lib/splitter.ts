/**
 * splitter.ts — Pure, side-effect-free text splitting.
 * Used directly in the main thread (for preview) and duplicated in the worker.
 */

export type SplitMode = "exact" | "smart";

export interface SplitResult {
  chunks: string[];
  totalChars: number;
  charLimit: number;
  mode: SplitMode;
}

function findSmartBreak(cp: string[], start: number, limit: number): number {
  const hardEnd = Math.min(start + limit, cp.length);
  if (hardEnd >= cp.length) return cp.length;

  let lastDoubleNl = -1;
  let lastNl = -1;
  let lastSpace = -1;

  for (let i = hardEnd - 1; i > start; i--) {
    const ch = cp[i];
    if (ch === "\n") {
      if (i > start && cp[i - 1] === "\n" && lastDoubleNl === -1) lastDoubleNl = i + 1;
      if (lastNl === -1) lastNl = i + 1;
    }
    if (ch === " " && lastSpace === -1) lastSpace = i + 1;
  }

  if (lastDoubleNl > start) return lastDoubleNl;
  if (lastNl > start) return lastNl;
  if (lastSpace > start) return lastSpace;
  return hardEnd;
}

export function splitExact(text: string, charLimit: number): string[] {
  if (!text) return [];
  const cp = Array.from(text);
  const chunks: string[] = [];
  for (let i = 0; i < cp.length; i += charLimit) {
    chunks.push(cp.slice(i, i + charLimit).join(""));
  }
  return chunks;
}

export function splitSmart(text: string, charLimit: number): string[] {
  if (!text) return [];
  const cp = Array.from(text);
  const chunks: string[] = [];
  let i = 0;
  while (i < cp.length) {
    const end = findSmartBreak(cp, i, charLimit);
    chunks.push(cp.slice(i, end).join(""));
    i = end;
  }
  return chunks;
}

export function previewChunks(text: string, charLimit: number, mode: SplitMode, max = 3): string[] {
  if (!text || charLimit <= 0) return [];
  const cp = Array.from(text);
  const result: string[] = [];
  let i = 0;
  while (i < cp.length && result.length < max) {
    if (mode === "smart") {
      const end = findSmartBreak(cp, i, charLimit);
      result.push(cp.slice(i, end).join(""));
      i = end;
    } else {
      result.push(cp.slice(i, i + charLimit).join(""));
      i += charLimit;
    }
  }
  return result;
}

/**
 * textCounter.ts — Unicode-safe character counting.
 *
 * Array.from() iterates Unicode code-points, so emoji and supplementary-plane
 * characters each count as 1, matching human intuition and word-processor counts.
 */

export function countCharacters(text: string): number {
  if (!text) return 0;
  return Array.from(text).length;
}

export function estimateFileCount(text: string, charLimit: number): number {
  if (!text || charLimit <= 0) return 0;
  const total = countCharacters(text);
  if (total === 0) return 0;
  return Math.ceil(total / charLimit);
}

export function validateCharLimit(value: number): string | null {
  if (!Number.isInteger(value)) return "Must be a whole number.";
  if (value < 1) return "Must be at least 1.";
  if (value > 10_000_000) return "Cannot exceed 10,000,000.";
  return null;
}

export function humanSize(text: string): string {
  const bytes = new TextEncoder().encode(text).length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Warn threshold — Array.from on very large text is slow */
export const LARGE_TEXT_THRESHOLD = 2_000_000; // 2M code points

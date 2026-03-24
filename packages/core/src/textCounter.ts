/**
 * textCounter.ts
 *
 * Unicode-safe character counting utilities.
 *
 * JavaScript's built-in String.length uses UTF-16 code units, so supplementary-
 * plane characters (emoji, certain CJK, etc.) count as 2. By using Array.from()
 * we iterate over Unicode code points — every visible character counts as 1,
 * matching how humans and word processors count text.
 *
 * This makes counting deterministic, consistent, and lossless across platforms.
 */

/**
 * Count the number of Unicode code-points in a string.
 *
 * Spaces, newlines, tabs and every visible character each count as exactly 1.
 * Multi-byte characters (emoji, supplementary CJK, etc.) also count as 1.
 *
 * @example
 * countCharacters("Hello\n")   // → 6
 * countCharacters("café")      // → 4
 * countCharacters("😊 hi")     // → 5  (emoji = 1 code-point)
 * countCharacters("")          // → 0
 */
export function countCharacters(text: string): number {
  if (!text) return 0;
  return Array.from(text).length;
}

/**
 * Estimate how many output files a given text will produce.
 *
 * In exact mode this equals ceil(charCount / charLimit) exactly.
 * In smart mode the count may be marginally higher because the algorithm
 * always splits before the limit, never after — but ceil is a correct
 * upper bound in both modes.
 *
 * Returns 0 for empty input or invalid charLimit.
 */
export function estimateFileCount(text: string, charLimit: number): number {
  if (!text || charLimit <= 0) return 0;
  const total = countCharacters(text);
  if (total === 0) return 0;
  return Math.ceil(total / charLimit);
}

/**
 * Returns a human-friendly size label for the raw UTF-8 byte size of the text.
 * (Byte size differs from code-point count for multibyte characters.)
 */
export function byteSizeLabel(text: string): string {
  const bytes = new TextEncoder().encode(text).length;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validate a character limit value.
 * @returns An error message string, or null if the value is valid.
 */
export function validateCharLimit(value: number): string | null {
  if (!Number.isInteger(value)) return "Character limit must be a whole number.";
  if (value < 1) return "Character limit must be at least 1.";
  if (value > 10_000_000) return "Character limit cannot exceed 10,000,000.";
  return null;
}

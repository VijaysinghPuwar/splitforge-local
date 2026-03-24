export type SplitMode = "exact" | "smart";

/** Unicode-safe character count (counts code points, not UTF-16 units). */
export function countChars(text: string): number {
  if (!text) return 0;
  return [...text].length;
}

/** Split text into fixed-size chunks (last chunk may be shorter). */
export function splitExact(text: string, limit: number): string[] {
  if (!text || limit < 1) return [];
  const chars = [...text];
  const chunks: string[] = [];
  for (let i = 0; i < chars.length; i += limit) {
    chunks.push(chars.slice(i, i + limit).join(""));
  }
  return chunks;
}

/**
 * Split text preferring paragraph/newline breaks near the limit.
 * Never exceeds the limit.
 */
export function splitSmart(text: string, limit: number): string[] {
  if (!text || limit < 1) return [];
  const chars = [...text];
  const total = chars.length;
  const chunks: string[] = [];
  let pos = 0;

  while (pos < total) {
    if (pos + limit >= total) {
      chunks.push(chars.slice(pos).join(""));
      break;
    }

    // Look backwards from the limit for a good break point
    let breakAt = pos + limit;
    const windowStart = pos + Math.floor(limit * 0.6);

    // Prefer double newline (paragraph break)
    let found = false;
    for (let i = breakAt - 1; i >= windowStart; i--) {
      if (chars[i] === "\n" && i > 0 && chars[i - 1] === "\n") {
        breakAt = i + 1;
        found = true;
        break;
      }
    }

    // Fall back to single newline
    if (!found) {
      for (let i = breakAt - 1; i >= windowStart; i--) {
        if (chars[i] === "\n") {
          breakAt = i + 1;
          found = true;
          break;
        }
      }
    }

    // Fall back to space
    if (!found) {
      for (let i = breakAt - 1; i >= windowStart; i--) {
        if (chars[i] === " ") {
          breakAt = i + 1;
          found = true;
          break;
        }
      }
    }

    chunks.push(chars.slice(pos, breakAt).join(""));
    pos = breakAt;
  }

  return chunks;
}

export function split(text: string, limit: number, mode: SplitMode): string[] {
  return mode === "smart" ? splitSmart(text, limit) : splitExact(text, limit);
}

/** Fast preview — only computes first `max` chunks on main thread. */
export function previewChunks(text: string, limit: number, mode: SplitMode, max = 3): string[] {
  if (!text || limit < 1) return [];
  // For preview we only need the first few chunks — no need to process full text
  const preview = [...text].slice(0, limit * max).join("");
  return split(preview, limit, mode).slice(0, max);
}

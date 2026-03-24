/// <reference lib="webworker" />
export type {};

// ---------------------------------------------------------------------------
// Types — mirrored from the main thread; kept here to avoid cross-context imports
// ---------------------------------------------------------------------------

type SplitMode = "exact" | "smart";

interface SplitRequest {
  text: string;
  charLimit: number;
  mode: SplitMode;
}

export type WorkerMessage =
  | { type: "progress"; current: number; total: number }
  | { type: "result"; chunks: string[]; totalChars: number; durationMs: number }
  | { type: "error"; message: string };

// ---------------------------------------------------------------------------
// Pure splitting functions (inlined — workers have a separate module context)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

self.onmessage = (e: MessageEvent<SplitRequest>) => {
  const t0 = Date.now();
  const { text, charLimit, mode } = e.data;

  try {
    if (!text) {
      self.postMessage({ type: "result", chunks: [], totalChars: 0, durationMs: 0 } satisfies WorkerMessage);
      return;
    }

    // Convert to code points once. For most practical documents this array
    // is well within memory limits (1M chars ≈ ~50 MB code-point array).
    const cp: string[] = Array.from(text);
    const totalChars = cp.length;
    const estimatedChunks = Math.ceil(totalChars / charLimit);

    const chunks: string[] = [];
    let i = 0;

    while (i < cp.length) {
      const chunkIndex = chunks.length;

      if (mode === "smart") {
        const end = findSmartBreak(cp, i, charLimit);
        chunks.push(cp.slice(i, end).join(""));
        i = end;
      } else {
        chunks.push(cp.slice(i, i + charLimit).join(""));
        i += charLimit;
      }

      // Report progress every 20 chunks (or the last one)
      if (chunkIndex % 20 === 0 || i >= cp.length) {
        self.postMessage({
          type: "progress",
          current: chunks.length,
          total: estimatedChunks,
        } satisfies WorkerMessage);
      }
    }

    self.postMessage({
      type: "result",
      chunks,
      totalChars,
      durationMs: Date.now() - t0,
    } satisfies WorkerMessage);
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : "Unknown error in splitter worker.",
    } satisfies WorkerMessage);
  }
};

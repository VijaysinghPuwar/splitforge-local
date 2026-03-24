/// <reference lib="webworker" />
export type {};

type SplitMode = "exact" | "smart";

interface Request {
  text: string;
  charLimit: number;
  mode: SplitMode;
}

function countChars(text: string): number {
  return [...text].length;
}

function splitExact(text: string, limit: number): string[] {
  const chars = [...text];
  const chunks: string[] = [];
  for (let i = 0; i < chars.length; i += limit) {
    chunks.push(chars.slice(i, i + limit).join(""));
  }
  return chunks;
}

function splitSmart(text: string, limit: number): string[] {
  const chars = [...text];
  const total = chars.length;
  const chunks: string[] = [];
  let pos = 0;

  while (pos < total) {
    if (pos + limit >= total) {
      chunks.push(chars.slice(pos).join(""));
      break;
    }
    let breakAt = pos + limit;
    const windowStart = pos + Math.floor(limit * 0.6);
    let found = false;

    for (let i = breakAt - 1; i >= windowStart; i--) {
      if (chars[i] === "\n" && i > 0 && chars[i - 1] === "\n") {
        breakAt = i + 1; found = true; break;
      }
    }
    if (!found) {
      for (let i = breakAt - 1; i >= windowStart; i--) {
        if (chars[i] === "\n") { breakAt = i + 1; found = true; break; }
      }
    }
    if (!found) {
      for (let i = breakAt - 1; i >= windowStart; i--) {
        if (chars[i] === " ") { breakAt = i + 1; found = true; break; }
      }
    }
    chunks.push(chars.slice(pos, breakAt).join(""));
    pos = breakAt;
  }
  return chunks;
}

self.onmessage = (e: MessageEvent<Request>) => {
  const { text, charLimit, mode } = e.data;
  const t0 = Date.now();

  if (!text || charLimit < 1) {
    self.postMessage({ type: "result", chunks: [], totalChars: 0, durationMs: 0 });
    return;
  }

  const totalChars = countChars(text);
  const approxTotal = Math.ceil(totalChars / charLimit);

  const reportEvery = Math.max(1, Math.floor(approxTotal / 20));
  const chars = [...text];
  const total = chars.length;
  const chunks: string[] = [];

  if (mode === "exact") {
    for (let i = 0; i < chars.length; i += charLimit) {
      chunks.push(chars.slice(i, i + charLimit).join(""));
      if (chunks.length % reportEvery === 0) {
        self.postMessage({ type: "progress", current: chunks.length, total: approxTotal });
      }
    }
  } else {
    // smart
    let pos = 0;
    while (pos < total) {
      if (pos + charLimit >= total) {
        chunks.push(chars.slice(pos).join(""));
        break;
      }
      let breakAt = pos + charLimit;
      const windowStart = pos + Math.floor(charLimit * 0.6);
      let found = false;
      for (let i = breakAt - 1; i >= windowStart; i--) {
        if (chars[i] === "\n" && i > 0 && chars[i - 1] === "\n") {
          breakAt = i + 1; found = true; break;
        }
      }
      if (!found) {
        for (let i = breakAt - 1; i >= windowStart; i--) {
          if (chars[i] === "\n") { breakAt = i + 1; found = true; break; }
        }
      }
      if (!found) {
        for (let i = breakAt - 1; i >= windowStart; i--) {
          if (chars[i] === " ") { breakAt = i + 1; found = true; break; }
        }
      }
      chunks.push(chars.slice(pos, breakAt).join(""));
      pos = breakAt;
      if (chunks.length % reportEvery === 0) {
        self.postMessage({ type: "progress", current: chunks.length, total: approxTotal });
      }
    }
  }

  self.postMessage({ type: "result", chunks, totalChars, durationMs: Date.now() - t0 });
};

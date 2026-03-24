import { splitText, splitExact, splitSmart, previewChunks } from "../src/splitter";
import { countCharacters } from "../src/textCounter";

// ---------------------------------------------------------------------------
// splitExact
// ---------------------------------------------------------------------------
describe("splitExact", () => {
  it("returns empty array for empty input", () => {
    expect(splitExact("", 100)).toEqual([]);
  });

  it("throws for charLimit ≤ 0", () => {
    expect(() => splitExact("hello", 0)).toThrow(RangeError);
    expect(() => splitExact("hello", -1)).toThrow(RangeError);
  });

  it("splits ASCII text into exact chunks", () => {
    const text = "a".repeat(25);
    const chunks = splitExact(text, 10);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(10);
    expect(chunks[1]).toHaveLength(10);
    expect(chunks[2]).toHaveLength(5);
  });

  it("produces a single chunk when input equals the limit", () => {
    const text = "a".repeat(7100);
    const chunks = splitExact(text, 7100);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it("produces a single chunk when input is shorter than the limit", () => {
    const chunks = splitExact("hello", 7100);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("hello");
  });

  it("preserves original text exactly when rejoined", () => {
    const text = "Hello, world!\nThis is a test.\nAnother line.";
    const chunks = splitExact(text, 10);
    expect(chunks.join("")).toBe(text);
  });

  it("handles Unicode: each emoji counts as 1 character", () => {
    // 3 emoji = 3 code-points (but 6 UTF-16 code units)
    const text = "😊😊😊";
    const chunks = splitExact(text, 2);
    expect(chunks).toHaveLength(2);
    expect(countCharacters(chunks[0])).toBe(2);
    expect(countCharacters(chunks[1])).toBe(1);
  });

  it("handles text with newlines as normal characters", () => {
    const text = "a\nb\nc\nd\ne";
    const chunks = splitExact(text, 3);
    // 9 chars → 3 full chunks of 3
    expect(chunks).toHaveLength(3);
    expect(chunks.join("")).toBe(text);
  });

  it("handles extremely large input without freezing", () => {
    const text = "x".repeat(100_000);
    const chunks = splitExact(text, 7100);
    expect(chunks).toHaveLength(Math.ceil(100_000 / 7100));
    // Every chunk except the last is exactly 7100
    for (let i = 0; i < chunks.length - 1; i++) {
      expect(countCharacters(chunks[i])).toBe(7100);
    }
    expect(chunks.join("")).toBe(text);
  });

  it("handles text that is exactly one character long", () => {
    expect(splitExact("A", 7100)).toEqual(["A"]);
    expect(splitExact("A", 1)).toEqual(["A"]);
  });

  it("does not lose trailing newlines", () => {
    const text = "hello\n";
    const chunks = splitExact(text, 7100);
    expect(chunks[0]).toBe("hello\n");
  });
});

// ---------------------------------------------------------------------------
// splitSmart
// ---------------------------------------------------------------------------
describe("splitSmart", () => {
  it("returns empty array for empty input", () => {
    expect(splitSmart("", 100)).toEqual([]);
  });

  it("throws for charLimit ≤ 0", () => {
    expect(() => splitSmart("hello", 0)).toThrow(RangeError);
  });

  it("splits at double-newlines when available near the limit", () => {
    const part1 = "a".repeat(90);
    const part2 = "b".repeat(50);
    const text = part1 + "\n\n" + part2;
    // Limit of 100 — the \n\n appears at index 90-91, within the limit
    const chunks = splitSmart(text, 100);
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    // Every chunk must not exceed the limit
    for (const chunk of chunks) {
      expect(countCharacters(chunk)).toBeLessThanOrEqual(100);
    }
    expect(chunks.join("")).toBe(text);
  });

  it("splits at single newlines when no double-newline is within limit", () => {
    const text = "a".repeat(50) + "\n" + "b".repeat(50);
    const chunks = splitSmart(text, 60);
    for (const chunk of chunks) {
      expect(countCharacters(chunk)).toBeLessThanOrEqual(60);
    }
    expect(chunks.join("")).toBe(text);
  });

  it("never produces a chunk exceeding charLimit", () => {
    const text = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10";
    const chunks = splitSmart(text, 15);
    for (const chunk of chunks) {
      expect(countCharacters(chunk)).toBeLessThanOrEqual(15);
    }
  });

  it("preserves text exactly when rejoined", () => {
    const text = "Para 1 line 1.\nPara 1 line 2.\n\nPara 2 line 1.\nPara 2 line 2.\n\nPara 3.";
    const chunks = splitSmart(text, 30);
    expect(chunks.join("")).toBe(text);
  });

  it("hard-cuts when no natural break exists within the limit", () => {
    // A string with no spaces or newlines
    const text = "x".repeat(50);
    const chunks = splitSmart(text, 20);
    // Must still split and never exceed limit
    for (const chunk of chunks) {
      expect(countCharacters(chunk)).toBeLessThanOrEqual(20);
    }
    expect(chunks.join("")).toBe(text);
  });

  it("handles input equal to limit as a single chunk", () => {
    const text = "a".repeat(7100);
    const chunks = splitSmart(text, 7100);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it("handles input shorter than limit as a single chunk", () => {
    const chunks = splitSmart("hello", 7100);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("hello");
  });

  it("handles Unicode text without losing characters", () => {
    const text = "😊 hello\n\n😂 world\n😄 end";
    const chunks = splitSmart(text, 10);
    for (const chunk of chunks) {
      expect(countCharacters(chunk)).toBeLessThanOrEqual(10);
    }
    expect(chunks.join("")).toBe(text);
  });
});

// ---------------------------------------------------------------------------
// splitText (unified entry point)
// ---------------------------------------------------------------------------
describe("splitText", () => {
  const text = "a".repeat(7100) + "b".repeat(3000);

  it("delegates to exact split in exact mode", () => {
    const result = splitText(text, 7100, "exact");
    expect(result.mode).toBe("exact");
    expect(result.chunks).toHaveLength(2);
    expect(countCharacters(result.chunks[0])).toBe(7100);
    expect(result.hasShortTail).toBe(true);
  });

  it("delegates to smart split in smart mode", () => {
    const result = splitText("para1\n\npara2\n\npara3", 10, "smart");
    expect(result.mode).toBe("smart");
    for (const chunk of result.chunks) {
      expect(countCharacters(chunk)).toBeLessThanOrEqual(10);
    }
    expect(result.chunks.join("")).toBe("para1\n\npara2\n\npara3");
  });

  it("throws for charLimit ≤ 0", () => {
    expect(() => splitText("hello", 0, "exact")).toThrow(RangeError);
  });

  it("returns totalChars equal to countCharacters(input)", () => {
    const result = splitText(text, 7100, "exact");
    expect(result.totalChars).toBe(countCharacters(text));
  });

  it("hasShortTail is false when input is exact multiple of limit", () => {
    const result = splitText("a".repeat(7100), 7100, "exact");
    expect(result.hasShortTail).toBe(false);
  });

  it("hasShortTail is true when last chunk is shorter", () => {
    const result = splitText("a".repeat(7101), 7100, "exact");
    expect(result.hasShortTail).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// previewChunks
// ---------------------------------------------------------------------------
describe("previewChunks", () => {
  it("returns empty for empty input", () => {
    expect(previewChunks("", 100, "exact")).toEqual([]);
  });

  it("returns at most maxChunks chunks", () => {
    const text = "a".repeat(10_000);
    const preview = previewChunks(text, 100, "exact", 3);
    expect(preview).toHaveLength(3);
  });

  it("returns all chunks if total is less than maxChunks", () => {
    const text = "a".repeat(50);
    const preview = previewChunks(text, 100, "exact", 10);
    expect(preview).toHaveLength(1);
  });

  it("each preview chunk respects the charLimit in exact mode", () => {
    const preview = previewChunks("x".repeat(500), 50, "exact", 5);
    for (const c of preview) {
      expect(countCharacters(c)).toBeLessThanOrEqual(50);
    }
  });

  it("each preview chunk respects the charLimit in smart mode", () => {
    const text = "word1 word2 word3 ".repeat(100);
    const preview = previewChunks(text, 30, "smart", 5);
    for (const c of preview) {
      expect(countCharacters(c)).toBeLessThanOrEqual(30);
    }
  });
});

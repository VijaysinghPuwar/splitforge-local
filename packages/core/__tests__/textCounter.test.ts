import {
  countCharacters,
  estimateFileCount,
  byteSizeLabel,
  validateCharLimit,
} from "../src/textCounter";

describe("countCharacters", () => {
  it("returns 0 for empty string", () => {
    expect(countCharacters("")).toBe(0);
  });

  it("counts ASCII characters correctly", () => {
    expect(countCharacters("Hello")).toBe(5);
    expect(countCharacters("Hello, world!")).toBe(13);
  });

  it("counts spaces as characters", () => {
    expect(countCharacters("a b")).toBe(3);
    expect(countCharacters("   ")).toBe(3);
  });

  it("counts newlines as characters", () => {
    expect(countCharacters("line1\nline2")).toBe(11);
    expect(countCharacters("\n\n\n")).toBe(3);
  });

  it("counts emoji as 1 character each (not 2 UTF-16 code units)", () => {
    expect(countCharacters("😊")).toBe(1);
    expect(countCharacters("😊😊😊")).toBe(3);
    expect(countCharacters("hi 😊")).toBe(4);
  });

  it("counts accented and multi-byte Latin characters as 1 each", () => {
    expect(countCharacters("café")).toBe(4);
    expect(countCharacters("naïve")).toBe(5);
    expect(countCharacters("Ünïcödé")).toBe(7);
  });

  it("counts CJK characters as 1 each", () => {
    expect(countCharacters("你好")).toBe(2);
    expect(countCharacters("日本語")).toBe(3);
  });

  it("handles mixed Unicode correctly", () => {
    // 4 chars: emoji, space, letter, accent
    expect(countCharacters("😊 aé")).toBe(4);
  });

  it("does not trim content silently", () => {
    expect(countCharacters("  hello  ")).toBe(9);
    expect(countCharacters("\nhello\n")).toBe(7);
  });
});

describe("estimateFileCount", () => {
  it("returns 0 for empty string", () => {
    expect(estimateFileCount("", 100)).toBe(0);
  });

  it("returns 0 for invalid charLimit", () => {
    expect(estimateFileCount("hello", 0)).toBe(0);
    expect(estimateFileCount("hello", -1)).toBe(0);
  });

  it("calculates correct count for exact multiples", () => {
    expect(estimateFileCount("a".repeat(100), 10)).toBe(10);
    expect(estimateFileCount("a".repeat(7100), 7100)).toBe(1);
  });

  it("rounds up for partial last file", () => {
    expect(estimateFileCount("a".repeat(101), 10)).toBe(11);
    expect(estimateFileCount("a".repeat(7101), 7100)).toBe(2);
  });

  it("returns 1 for input shorter than limit", () => {
    expect(estimateFileCount("hello", 7100)).toBe(1);
  });

  it("returns 1 for input exactly equal to limit", () => {
    expect(estimateFileCount("a".repeat(7100), 7100)).toBe(1);
  });
});

describe("validateCharLimit", () => {
  it("accepts valid limits", () => {
    expect(validateCharLimit(1)).toBeNull();
    expect(validateCharLimit(7100)).toBeNull();
    expect(validateCharLimit(10_000_000)).toBeNull();
  });

  it("rejects 0", () => {
    expect(validateCharLimit(0)).toBeTruthy();
  });

  it("rejects negative numbers", () => {
    expect(validateCharLimit(-1)).toBeTruthy();
  });

  it("rejects non-integers", () => {
    expect(validateCharLimit(1.5)).toBeTruthy();
  });

  it("rejects values exceeding maximum", () => {
    expect(validateCharLimit(10_000_001)).toBeTruthy();
  });
});

describe("byteSizeLabel", () => {
  it("returns bytes for small strings", () => {
    expect(byteSizeLabel("hi")).toBe("2 B");
  });

  it("returns KB label for medium strings", () => {
    const label = byteSizeLabel("a".repeat(2000));
    expect(label).toMatch(/KB$/);
  });

  it("returns MB label for large strings", () => {
    const label = byteSizeLabel("a".repeat(1_100_000));
    expect(label).toMatch(/MB$/);
  });
});

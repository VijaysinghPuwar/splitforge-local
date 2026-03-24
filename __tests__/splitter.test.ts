import { countChars, splitExact, splitSmart, split } from "../src/lib/splitter";

describe("countChars", () => {
  test("empty string", () => expect(countChars("")).toBe(0));
  test("ascii", () => expect(countChars("hello")).toBe(5));
  test("emoji counts as 1", () => expect(countChars("😀")).toBe(1));
  test("mixed unicode", () => expect(countChars("hello 😀 world")).toBe(13));
  test("CJK", () => expect(countChars("你好世界")).toBe(4));
  test("newlines count", () => expect(countChars("a\nb\n")).toBe(4));
});

describe("splitExact", () => {
  test("empty input", () => expect(splitExact("", 10)).toEqual([]));
  test("exact fit", () => {
    const chunks = splitExact("abcde", 5);
    expect(chunks).toEqual(["abcde"]);
  });
  test("splits evenly", () => {
    const chunks = splitExact("abcdef", 3);
    expect(chunks).toEqual(["abc", "def"]);
  });
  test("last chunk shorter", () => {
    const chunks = splitExact("abcdefg", 3);
    expect(chunks).toEqual(["abc", "def", "g"]);
  });
  test("preserves full content", () => {
    const text = "hello world foo bar baz";
    const chunks = splitExact(text, 7);
    expect(chunks.join("")).toBe(text);
  });
  test("unicode emoji preserved", () => {
    const text = "a😀b😀c";
    const chunks = splitExact(text, 2);
    expect(chunks.join("")).toBe(text);
    expect(chunks[0]).toBe("a😀");
  });
  test("limit of 1", () => {
    const chunks = splitExact("abc", 1);
    expect(chunks).toEqual(["a", "b", "c"]);
  });
  test("limit larger than text", () => {
    expect(splitExact("hi", 100)).toEqual(["hi"]);
  });
  test("no chunk exceeds limit", () => {
    const text = "a".repeat(10000);
    const limit = 7100;
    const chunks = splitExact(text, limit);
    chunks.forEach((c) => expect(countChars(c)).toBeLessThanOrEqual(limit));
  });
});

describe("splitSmart", () => {
  test("empty input", () => expect(splitSmart("", 10)).toEqual([]));
  test("preserves full content", () => {
    const text = "Hello world.\n\nThis is a test.\n\nAnother paragraph here.";
    const chunks = splitSmart(text, 20);
    expect(chunks.join("")).toBe(text);
  });
  test("never exceeds limit", () => {
    const text = "word ".repeat(2000);
    const limit = 100;
    const chunks = splitSmart(text, limit);
    chunks.forEach((c) => expect(countChars(c)).toBeLessThanOrEqual(limit));
  });
  test("prefers paragraph break", () => {
    const text = "aaaa\n\nbbbb";
    const chunks = splitSmart(text, 7);
    expect(chunks[0]).toBe("aaaa\n\n");
    expect(chunks[1]).toBe("bbbb");
  });
  test("falls back to single newline", () => {
    const text = "aaa\nbbb";
    const chunks = splitSmart(text, 5);
    expect(chunks.join("")).toBe(text);
    chunks.forEach((c) => expect(countChars(c)).toBeLessThanOrEqual(5));
  });
  test("huge text no content loss", () => {
    const text = "Lorem ipsum. ".repeat(5000);
    const limit = 7100;
    const chunks = splitSmart(text, limit);
    expect(chunks.join("")).toBe(text);
    chunks.forEach((c) => expect(countChars(c)).toBeLessThanOrEqual(limit));
  });
  test("limit larger than text", () => {
    expect(splitSmart("short", 1000)).toEqual(["short"]);
  });
});

describe("split dispatch", () => {
  test("exact mode", () => {
    expect(split("abcdef", 3, "exact")).toEqual(["abc", "def"]);
  });
  test("smart mode returns valid chunks", () => {
    const text = "hello world\n\nfoo bar";
    const chunks = split(text, 15, "smart");
    expect(chunks.join("")).toBe(text);
  });
});

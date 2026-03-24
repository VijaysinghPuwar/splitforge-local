import { countChars } from "../src/lib/splitter";

describe("Unicode safety", () => {
  test("surrogate pairs count as 1", () => {
    // 𝄞 (musical symbol G clef) is U+1D11E, encoded as surrogate pair in JS
    expect(countChars("𝄞")).toBe(1);
  });
  test("mixed BMP and non-BMP", () => {
    expect(countChars("A𝄞B")).toBe(3);
  });
  test("arabic", () => {
    const text = "مرحبا";
    expect(countChars(text)).toBe(5);
  });
  test("japanese", () => {
    expect(countChars("日本語")).toBe(3);
  });
  test("newline and space counted", () => {
    expect(countChars(" \n\t")).toBe(3);
  });
  test("zero-width joiner sequence (family emoji)", () => {
    // 👨‍👩‍👧 is multiple code points joined by ZWJ
    const family = "👨‍👩‍👧";
    const len = countChars(family);
    // It's 5 code points: 👨 ZWJ 👩 ZWJ 👧
    expect(len).toBe(5);
  });
});

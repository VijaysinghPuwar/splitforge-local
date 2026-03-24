import {
  getFileName,
  getAllFileNames,
  sanitizePrefix,
  generateSubfolderName,
  validateOutputPath,
} from "../src/fileNaming";

describe("getFileName", () => {
  it("produces plain numbered names by default", () => {
    expect(getFileName(1)).toBe("1.txt");
    expect(getFileName(42)).toBe("42.txt");
    expect(getFileName(1000)).toBe("1000.txt");
  });

  it("applies a custom prefix", () => {
    expect(getFileName(1, { prefix: "part-" })).toBe("part-1.txt");
    expect(getFileName(7, { prefix: "chapter-" })).toBe("chapter-7.txt");
  });

  it("pads with leading zeros when enabled", () => {
    expect(getFileName(1, { leadingZeros: true, totalFiles: 100 })).toBe("001.txt");
    expect(getFileName(10, { leadingZeros: true, totalFiles: 100 })).toBe("010.txt");
    expect(getFileName(100, { leadingZeros: true, totalFiles: 100 })).toBe("100.txt");
  });

  it("combines prefix and leading zeros", () => {
    expect(getFileName(3, { prefix: "part-", leadingZeros: true, totalFiles: 50 })).toBe(
      "part-03.txt"
    );
  });

  it("does not pad when leadingZeros is false (default)", () => {
    expect(getFileName(5, { totalFiles: 1000 })).toBe("5.txt");
  });

  it("pads correctly for single-digit totalFiles", () => {
    expect(getFileName(1, { leadingZeros: true, totalFiles: 9 })).toBe("1.txt");
  });

  it("pads correctly for two-digit totalFiles", () => {
    expect(getFileName(1, { leadingZeros: true, totalFiles: 99 })).toBe("01.txt");
    expect(getFileName(99, { leadingZeros: true, totalFiles: 99 })).toBe("99.txt");
  });
});

describe("getAllFileNames", () => {
  it("returns empty array for count 0", () => {
    expect(getAllFileNames(0)).toEqual([]);
  });

  it("returns correct array for count 1", () => {
    expect(getAllFileNames(1)).toEqual(["1.txt"]);
  });

  it("returns sequential names for count 5", () => {
    expect(getAllFileNames(5)).toEqual([
      "1.txt",
      "2.txt",
      "3.txt",
      "4.txt",
      "5.txt",
    ]);
  });

  it("applies prefix to all names", () => {
    const names = getAllFileNames(3, { prefix: "part-" });
    expect(names).toEqual(["part-1.txt", "part-2.txt", "part-3.txt"]);
  });

  it("applies leading zeros consistently", () => {
    const names = getAllFileNames(10, { leadingZeros: true });
    expect(names[0]).toBe("01.txt");
    expect(names[9]).toBe("10.txt");
  });
});

describe("sanitizePrefix", () => {
  it("allows safe characters", () => {
    expect(sanitizePrefix("part-")).toBe("part-");
    expect(sanitizePrefix("chapter_")).toBe("chapter_");
    expect(sanitizePrefix("v1.")).toBe("v1.");
  });

  it("removes path separators and dangerous characters", () => {
    expect(sanitizePrefix("../evil/")).toBe("..evil");
    expect(sanitizePrefix("file<name>")).toBe("filename");
    expect(sanitizePrefix("a b c")).toBe("abc");
  });

  it("truncates long prefixes to 64 characters", () => {
    const long = "a".repeat(100);
    expect(sanitizePrefix(long)).toHaveLength(64);
  });

  it("returns empty string for fully unsafe input", () => {
    expect(sanitizePrefix("!@#$%^&*()")).toBe("");
  });
});

describe("generateSubfolderName", () => {
  it("generates a name with the correct format", () => {
    const date = new Date("2026-03-23T00:00:00");
    const name = generateSubfolderName(date, 1);
    expect(name).toBe("splitforge-export-2026-03-23-001");
  });

  it("increments the index correctly", () => {
    const date = new Date("2026-03-23T00:00:00");
    expect(generateSubfolderName(date, 2)).toBe("splitforge-export-2026-03-23-002");
    expect(generateSubfolderName(date, 10)).toBe("splitforge-export-2026-03-23-010");
  });

  it("pads month and day with leading zeros", () => {
    const date = new Date("2026-01-05T00:00:00");
    expect(generateSubfolderName(date, 1)).toBe("splitforge-export-2026-01-05-001");
  });
});

describe("validateOutputPath", () => {
  it("accepts valid absolute paths", () => {
    expect(validateOutputPath("/Users/alice/output")).toBeNull();
    expect(validateOutputPath("C:\\Users\\alice\\output")).toBeNull();
  });

  it("rejects empty paths", () => {
    expect(validateOutputPath("")).toBeTruthy();
    expect(validateOutputPath("   ")).toBeTruthy();
  });

  it("rejects paths with ..", () => {
    expect(validateOutputPath("/safe/path/../evil")).toBeTruthy();
  });

  it("rejects excessively long paths", () => {
    expect(validateOutputPath("a".repeat(5000))).toBeTruthy();
  });
});

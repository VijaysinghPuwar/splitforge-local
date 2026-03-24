import { getFileName, getAllFileNames, sanitizePrefix, generateSubfolderName } from "../src/lib/fileNaming";

describe("sanitizePrefix", () => {
  test("strips special chars", () => expect(sanitizePrefix("my file!")).toBe("myfile"));
  test("keeps alphanumeric and dash", () => expect(sanitizePrefix("my-file_1")).toBe("my-file_1"));
  test("empty stays empty", () => expect(sanitizePrefix("")).toBe(""));
  test("truncates at 32", () => expect(sanitizePrefix("a".repeat(40))).toHaveLength(32));
});

describe("getFileName", () => {
  test("no prefix, no zeros", () => {
    expect(getFileName(0, { prefix: "", leadingZeros: false, total: 5 })).toBe("1.txt");
  });
  test("with prefix", () => {
    expect(getFileName(0, { prefix: "part", leadingZeros: false, total: 5 })).toBe("part-1.txt");
  });
  test("leading zeros pads correctly", () => {
    expect(getFileName(0, { prefix: "", leadingZeros: true, total: 100 })).toBe("001.txt");
    expect(getFileName(9, { prefix: "", leadingZeros: true, total: 100 })).toBe("010.txt");
  });
  test("single file no padding", () => {
    expect(getFileName(0, { prefix: "", leadingZeros: true, total: 1 })).toBe("1.txt");
  });
});

describe("getAllFileNames", () => {
  test("generates correct count", () => {
    const names = getAllFileNames(3, { prefix: "", leadingZeros: false, total: 3 });
    expect(names).toEqual(["1.txt", "2.txt", "3.txt"]);
  });
  test("empty", () => {
    expect(getAllFileNames(0, { prefix: "", leadingZeros: false, total: 0 })).toEqual([]);
  });
});

describe("generateSubfolderName", () => {
  test("starts with splitforge-", () => {
    const name = generateSubfolderName(new Date(2025, 0, 15, 9, 5, 3));
    expect(name).toBe("splitforge-20250115-090503");
  });
});

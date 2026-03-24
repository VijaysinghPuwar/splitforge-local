/** File naming utilities. Pure functions, no I/O. */

export interface FileNamingOptions {
  prefix?: string;
  leadingZeros?: boolean;
  totalFiles?: number;
}

export function getFileName(index: number, opts: FileNamingOptions = {}): string {
  const { prefix = "", leadingZeros = false, totalFiles = 0 } = opts;
  let num = String(index);
  if (leadingZeros && totalFiles > 0) {
    num = num.padStart(String(totalFiles).length, "0");
  }
  return `${prefix}${num}.txt`;
}

export function getAllFileNames(count: number, opts: FileNamingOptions = {}): string[] {
  return Array.from({ length: count }, (_, i) =>
    getFileName(i + 1, { ...opts, totalFiles: count })
  );
}

export function sanitizePrefix(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9\-_.]/g, "").slice(0, 64);
}

export function generateSubfolderName(date = new Date(), index = 1): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `splitforge-${y}-${m}-${d}-${String(index).padStart(3, "0")}`;
}

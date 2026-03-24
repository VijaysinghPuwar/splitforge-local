/**
 * fileNaming.ts
 *
 * Generates output file names and handles overwrite-protection logic.
 * Pure functions — no I/O, no side-effects.
 */

export interface FileNamingOptions {
  /** Optional prefix, e.g. "part-" → "part-1.txt" */
  prefix?: string;
  /** Pad numbers with leading zeros to keep alphabetical order consistent */
  leadingZeros?: boolean;
  /** Total file count — needed to compute the correct zero-pad width */
  totalFiles?: number;
}

/**
 * Generate the file name for a given chunk index (1-based).
 *
 * @example
 * getFileName(1, { prefix: "part-" })                   // "part-1.txt"
 * getFileName(3, { leadingZeros: true, totalFiles: 100 }) // "003.txt"
 * getFileName(42, {})                                    // "42.txt"
 */
export function getFileName(index: number, options: FileNamingOptions = {}): string {
  const { prefix = "", leadingZeros = false, totalFiles = 0 } = options;

  let numStr = String(index);

  if (leadingZeros && totalFiles > 0) {
    const width = String(totalFiles).length;
    numStr = numStr.padStart(width, "0");
  }

  return `${prefix}${numStr}.txt`;
}

/**
 * Generate all file names for a set of chunks.
 *
 * @param count   Total number of chunks
 * @param options Naming options
 * @returns Array of file names ordered from first to last
 */
export function getAllFileNames(count: number, options: FileNamingOptions = {}): string[] {
  const names: string[] = [];
  for (let i = 1; i <= count; i++) {
    names.push(getFileName(i, { ...options, totalFiles: count }));
  }
  return names;
}

/**
 * Sanitize a user-supplied prefix to prevent path traversal or invalid file names.
 *
 * Allowed characters: alphanumeric, hyphens, underscores, dots.
 * Returns the sanitized prefix (may be an empty string).
 */
export function sanitizePrefix(prefix: string): string {
  // Remove anything that isn't a safe filename character
  return prefix.replace(/[^a-zA-Z0-9\-_.]/g, "").slice(0, 64);
}

/**
 * Generate a timestamped subfolder name for the "create subfolder" feature.
 *
 * Format: splitforge-export-YYYY-MM-DD-NNN
 * The suffix NNN starts at 001; callers should increment if the folder exists.
 *
 * @param date   Date to use for the timestamp (defaults to now)
 * @param index  Collision index, starting at 1
 */
export function generateSubfolderName(date: Date = new Date(), index = 1): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const idx = String(index).padStart(3, "0");
  return `splitforge-export-${year}-${month}-${day}-${idx}`;
}

/**
 * Validate that a proposed output path looks safe.
 *
 * This is a lightweight client-side check. The Rust backend performs the
 * authoritative path-traversal validation before any write.
 *
 * @returns An error message, or null if the path appears valid.
 */
export function validateOutputPath(path: string): string | null {
  if (!path || path.trim().length === 0) return "Output folder path cannot be empty.";
  if (path.includes("..")) return "Output path must not contain '..' segments.";
  if (path.length > 4096) return "Output path is too long.";
  return null;
}

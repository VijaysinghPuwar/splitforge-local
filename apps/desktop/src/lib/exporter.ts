/**
 * exporter.ts
 *
 * Orchestrates the full export pipeline:
 *   split text → generate file names → write files → write manifest
 *
 * This module is the only layer that interacts with the file system.
 * It delegates all I/O to tauri-bridge.ts.
 */

import {
  splitText,
  getAllFileNames,
  generateSubfolderName,
  sanitizePrefix,
  validateOutputPath,
  type SplitMode,
  type FileNamingOptions,
} from "@splitforge/core";

import {
  writeTextFile,
  pathExists,
  createDirAll,
  listDir,
} from "./tauri-bridge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OverwriteMode = "overwrite" | "skip" | "new-folder";

export interface ExportOptions {
  text: string;
  charLimit: number;
  mode: SplitMode;
  outputFolder: string;
  prefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
  overwriteMode: OverwriteMode;
  originalFileName?: string;
}

export interface ExportProgress {
  current: number;
  total: number;
  currentFile: string;
}

export interface ExportFileResult {
  fileName: string;
  status: "written" | "skipped" | "failed";
  error?: string;
}

export interface ExportResult {
  success: boolean;
  outputFolder: string;
  totalInputChars: number;
  charLimit: number;
  mode: SplitMode;
  totalFiles: number;
  filesWritten: number;
  filesSkipped: number;
  filesFailed: number;
  fileResults: ExportFileResult[];
  manifestWritten: boolean;
  durationMs: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Path utilities
// ---------------------------------------------------------------------------

/** Join path segments using the platform separator (no Node.js required). */
function joinPath(...parts: string[]): string {
  return parts
    .map((p, i) => (i > 0 ? p.replace(/^[/\\]+/, "") : p))
    .join("/")
    .replace(/\/{2,}/g, "/");
}

// ---------------------------------------------------------------------------
// Overwrite collision resolution
// ---------------------------------------------------------------------------

/**
 * If the output folder already contains numbered files and the user chose
 * "new-folder" mode, find a free subfolder name and create it.
 */
async function resolveOutputFolder(
  baseFolder: string,
  overwriteMode: OverwriteMode,
  fileNames: string[]
): Promise<string> {
  if (overwriteMode !== "new-folder") return baseFolder;

  // Check if any target file already exists
  const anyExists = await Promise.any(
    fileNames.map(async (name) => {
      const exists = await pathExists(joinPath(baseFolder, name));
      if (exists) return true;
      throw new Error("not exists");
    })
  ).catch(() => false);

  if (!anyExists) return baseFolder;

  // Find a free subfolder index
  const now = new Date();
  let index = 1;
  while (index <= 999) {
    const subName = generateSubfolderName(now, index);
    const fullPath = joinPath(baseFolder, subName);
    if (!(await pathExists(fullPath))) {
      await createDirAll(fullPath);
      return fullPath;
    }
    index++;
  }

  throw new Error("Could not find a free export subfolder after 999 attempts.");
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

/**
 * Run the full export pipeline. Call `onProgress` to receive real-time updates.
 *
 * @param options     Export configuration
 * @param onProgress  Optional progress callback; return `false` to cancel
 * @returns           A rich result object describing what happened
 */
export async function runExport(
  options: ExportOptions,
  onProgress?: (progress: ExportProgress) => boolean | void
): Promise<ExportResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // --- Validate ---
  const pathError = validateOutputPath(options.outputFolder);
  if (pathError) throw new Error(pathError);

  if (!options.text) throw new Error("Input text is empty.");
  if (options.charLimit < 1) throw new Error("Character limit must be at least 1.");

  // --- Split ---
  const sanitizedPrefix = sanitizePrefix(options.prefix ?? "");
  const splitResult = splitText(options.text, options.charLimit, options.mode);
  const { chunks } = splitResult;

  if (chunks.length === 0) throw new Error("Splitting produced no output chunks.");

  // --- Resolve output folder (may create subfolder) ---
  let targetFolder = options.outputFolder;
  if (options.createSubfolder) {
    const now = new Date();
    let index = 1;
    while (index <= 999) {
      const subName = generateSubfolderName(now, index);
      const candidate = joinPath(options.outputFolder, subName);
      if (!(await pathExists(candidate))) {
        await createDirAll(candidate);
        targetFolder = candidate;
        break;
      }
      index++;
    }
  }

  const namingOptions: FileNamingOptions = {
    prefix: sanitizedPrefix,
    leadingZeros: options.leadingZeros,
    totalFiles: chunks.length,
  };

  const fileNames = getAllFileNames(chunks.length, namingOptions);

  if (!options.createSubfolder && options.overwriteMode === "new-folder") {
    targetFolder = await resolveOutputFolder(targetFolder, options.overwriteMode, fileNames);
  }

  // Ensure folder exists
  await createDirAll(targetFolder);

  // --- Write files ---
  const fileResults: ExportFileResult[] = [];
  let filesWritten = 0;
  let filesSkipped = 0;
  let filesFailed = 0;

  for (let i = 0; i < chunks.length; i++) {
    const fileName = fileNames[i];
    const filePath = joinPath(targetFolder, fileName);

    // Progress callback — allow cancellation
    if (onProgress) {
      const shouldContinue = onProgress({
        current: i + 1,
        total: chunks.length,
        currentFile: fileName,
      });
      if (shouldContinue === false) {
        fileResults.push({ fileName, status: "skipped", error: "Export cancelled by user." });
        filesSkipped++;
        continue;
      }
    }

    // Overwrite check
    if (options.overwriteMode === "skip" && (await pathExists(filePath))) {
      fileResults.push({ fileName, status: "skipped", error: "File already exists." });
      filesSkipped++;
      continue;
    }

    try {
      await writeTextFile(targetFolder, filePath, chunks[i]);
      fileResults.push({ fileName, status: "written" });
      filesWritten++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      fileResults.push({ fileName, status: "failed", error: message });
      filesFailed++;
    }
  }

  // --- Write manifest ---
  let manifestWritten = false;
  if (options.exportManifest) {
    const manifest = {
      originalFileName: options.originalFileName ?? null,
      totalInputChars: splitResult.totalChars,
      charLimit: options.charLimit,
      totalFiles: chunks.length,
      filesWritten,
      filesSkipped,
      filesFailed,
      mode: options.mode,
      prefix: sanitizedPrefix,
      leadingZeros: options.leadingZeros,
      timestamp,
      outputFolder: targetFolder,
    };
    const manifestPath = joinPath(targetFolder, "manifest.json");
    try {
      await writeTextFile(targetFolder, manifestPath, JSON.stringify(manifest, null, 2));
      manifestWritten = true;
    } catch {
      // Non-fatal — still report success for the text files
    }
  }

  return {
    success: filesFailed === 0,
    outputFolder: targetFolder,
    totalInputChars: splitResult.totalChars,
    charLimit: options.charLimit,
    mode: options.mode,
    totalFiles: chunks.length,
    filesWritten,
    filesSkipped,
    filesFailed,
    fileResults,
    manifestWritten,
    durationMs: Date.now() - startTime,
    timestamp,
  };
}

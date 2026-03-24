/**
 * exporter.ts
 *
 * Two export paths — both process data entirely in the browser:
 *
 *  1. saveToFolder()     — File System Access API (Chrome/Edge). Opens a native
 *                          directory picker and writes files directly to disk.
 *
 *  2. downloadAsZip()    — fflate ZIP (all browsers). Builds a ZIP in memory
 *                          and triggers a browser download.
 *
 * No data is ever sent to a server.
 */

import { zipSync, strToU8 } from "fflate";
import { getAllFileNames, generateSubfolderName, type FileNamingOptions } from "./fileNaming";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportOptions {
  prefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
  originalFileName?: string;
  mode: string;
  charLimit: number;
}

export interface ExportFileRecord {
  name: string;
  status: "written" | "failed";
  error?: string;
}

export interface ExportResult {
  method: "folder" | "zip";
  totalFiles: number;
  filesWritten: number;
  filesFailed: number;
  fileRecords: ExportFileRecord[];
  manifestWritten: boolean;
  durationMs: number;
  folderName?: string;
}

export interface ExportProgress {
  current: number;
  total: number;
  file: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildManifest(
  chunks: string[],
  opts: ExportOptions,
  totalChars: number
): string {
  return JSON.stringify(
    {
      originalFileName: opts.originalFileName ?? null,
      totalInputChars: totalChars,
      charLimit: opts.charLimit,
      totalFiles: chunks.length,
      mode: opts.mode,
      prefix: opts.prefix,
      leadingZeros: opts.leadingZeros,
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );
}

function namingOpts(chunks: string[], opts: ExportOptions): FileNamingOptions {
  return { prefix: opts.prefix, leadingZeros: opts.leadingZeros, totalFiles: chunks.length };
}

// ---------------------------------------------------------------------------
// 1. File System Access API export
// ---------------------------------------------------------------------------

export async function saveToFolder(
  chunks: string[],
  opts: ExportOptions,
  totalChars: number,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  const t0 = Date.now();

  // Open OS-level directory picker
  const rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });

  // Optionally create a timestamped subfolder
  let targetHandle: FileSystemDirectoryHandle = rootHandle;
  let folderName: string | undefined;
  if (opts.createSubfolder) {
    folderName = generateSubfolderName(new Date());
    targetHandle = await rootHandle.getDirectoryHandle(folderName, { create: true });
  }

  const fileNames = getAllFileNames(chunks.length, namingOpts(chunks, opts));
  const records: ExportFileRecord[] = [];
  let written = 0;
  let failed = 0;

  for (let i = 0; i < chunks.length; i++) {
    const name = fileNames[i];
    onProgress?.({ current: i + 1, total: chunks.length, file: name });

    try {
      const fh = await targetHandle.getFileHandle(name, { create: true });
      const writable = await fh.createWritable();
      await writable.write(chunks[i]);
      await writable.close();
      records.push({ name, status: "written" });
      written++;
    } catch (err) {
      records.push({ name, status: "failed", error: String(err) });
      failed++;
    }
  }

  // Manifest
  let manifestWritten = false;
  if (opts.exportManifest) {
    try {
      const fh = await targetHandle.getFileHandle("manifest.json", { create: true });
      const writable = await fh.createWritable();
      await writable.write(buildManifest(chunks, opts, totalChars));
      await writable.close();
      manifestWritten = true;
    } catch {
      // non-fatal
    }
  }

  return {
    method: "folder",
    totalFiles: chunks.length,
    filesWritten: written,
    filesFailed: failed,
    fileRecords: records,
    manifestWritten,
    durationMs: Date.now() - t0,
    folderName,
  };
}

// ---------------------------------------------------------------------------
// 2. ZIP download export
// ---------------------------------------------------------------------------

export async function downloadAsZip(
  chunks: string[],
  opts: ExportOptions,
  totalChars: number,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  const t0 = Date.now();
  const fileNames = getAllFileNames(chunks.length, namingOpts(chunks, opts));
  const prefix = opts.createSubfolder ? `${generateSubfolderName(new Date())}/` : "";

  // Build the file tree for fflate
  const zipEntries: Record<string, Uint8Array> = {};

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.({ current: i + 1, total: chunks.length, file: fileNames[i] });
    zipEntries[`${prefix}${fileNames[i]}`] = strToU8(chunks[i]);
  }

  if (opts.exportManifest) {
    zipEntries[`${prefix}manifest.json`] = strToU8(buildManifest(chunks, opts, totalChars));
  }

  // Compress with level 1 (fastest) — text compresses well even at level 1
  const zipped = zipSync(zipEntries, { level: 1 });
  const blob = new Blob([zipped], { type: "application/zip" });

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `splitforge-${Date.now()}.zip`;
  anchor.click();
  URL.revokeObjectURL(url);

  const records: ExportFileRecord[] = fileNames.map((name) => ({
    name,
    status: "written" as const,
  }));

  return {
    method: "zip",
    totalFiles: chunks.length,
    filesWritten: chunks.length,
    filesFailed: 0,
    fileRecords: records,
    manifestWritten: opts.exportManifest,
    durationMs: Date.now() - t0,
  };
}

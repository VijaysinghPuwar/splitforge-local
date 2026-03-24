import { zipSync, strToU8 } from "fflate";
import { getAllFileNames, generateSubfolderName, type NamingOptions } from "./fileNaming";

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

function buildManifest(chunks: string[], opts: ExportOptions, totalChars: number): string {
  return JSON.stringify({
    originalFileName: opts.originalFileName ?? null,
    totalInputChars: totalChars,
    charLimit: opts.charLimit,
    totalFiles: chunks.length,
    mode: opts.mode,
    prefix: opts.prefix,
    timestamp: new Date().toISOString(),
  }, null, 2);
}

function namingOpts(total: number, opts: ExportOptions): NamingOptions {
  return { prefix: opts.prefix, leadingZeros: opts.leadingZeros, total };
}

export async function saveToFolder(
  chunks: string[],
  opts: ExportOptions,
  totalChars: number,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  const t0 = Date.now();
  const rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });

  let targetHandle: FileSystemDirectoryHandle = rootHandle;
  let folderName: string | undefined;
  if (opts.createSubfolder) {
    folderName = generateSubfolderName(new Date());
    targetHandle = await rootHandle.getDirectoryHandle(folderName, { create: true });
  }

  const names = getAllFileNames(chunks.length, namingOpts(chunks.length, opts));
  const records: ExportFileRecord[] = [];
  let written = 0, failed = 0;

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.({ current: i + 1, total: chunks.length, file: names[i] });
    try {
      const fh = await targetHandle.getFileHandle(names[i], { create: true });
      const w = await fh.createWritable();
      await w.write(chunks[i]);
      await w.close();
      records.push({ name: names[i], status: "written" });
      written++;
    } catch (err) {
      records.push({ name: names[i], status: "failed", error: String(err) });
      failed++;
    }
  }

  let manifestWritten = false;
  if (opts.exportManifest) {
    try {
      const fh = await targetHandle.getFileHandle("manifest.json", { create: true });
      const w = await fh.createWritable();
      await w.write(buildManifest(chunks, opts, totalChars));
      await w.close();
      manifestWritten = true;
    } catch { /* non-fatal */ }
  }

  return { method: "folder", filesWritten: written, filesFailed: failed, fileRecords: records, manifestWritten, durationMs: Date.now() - t0, folderName };
}

export async function downloadAsZip(
  chunks: string[],
  opts: ExportOptions,
  totalChars: number,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  const t0 = Date.now();
  const names = getAllFileNames(chunks.length, namingOpts(chunks.length, opts));
  const pfx = opts.createSubfolder ? `${generateSubfolderName(new Date())}/` : "";
  const entries: Record<string, Uint8Array> = {};

  for (let i = 0; i < chunks.length; i++) {
    onProgress?.({ current: i + 1, total: chunks.length, file: names[i] });
    entries[`${pfx}${names[i]}`] = strToU8(chunks[i]);
  }

  if (opts.exportManifest) {
    entries[`${pfx}manifest.json`] = strToU8(buildManifest(chunks, opts, totalChars));
  }

  const zipped = zipSync(entries, { level: 1 }) as Uint8Array<ArrayBuffer>;
  const blob = new Blob([zipped], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `splitforge-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);

  const records: ExportFileRecord[] = names.map((name) => ({ name, status: "written" as const }));
  return { method: "zip", filesWritten: chunks.length, filesFailed: 0, fileRecords: records, manifestWritten: opts.exportManifest, durationMs: Date.now() - t0 };
}

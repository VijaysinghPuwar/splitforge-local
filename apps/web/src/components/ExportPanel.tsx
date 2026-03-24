"use client";

import { canSaveToFolder, exportLimitationNote } from "@/lib/capabilities";
import type { ExportResult } from "@/lib/exporter";

interface Props {
  canExport: boolean;
  isExporting: boolean;
  result: ExportResult | null;
  onSaveToFolder: () => void;
  onDownloadZip: () => void;
  onOpenResult: () => void;
  onExportAgain: () => void;
}

export default function ExportPanel({
  canExport, isExporting, result,
  onSaveToFolder, onDownloadZip, onOpenResult, onExportAgain,
}: Props) {
  const folderSupported = canSaveToFolder();
  const note = exportLimitationNote();

  if (result) {
    const ok = result.filesFailed === 0;
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        {/* Status */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          ok ? "bg-brand-500/10 border-brand-500/30 text-brand-300" : "bg-red-900/20 border-red-700/40 text-red-300"
        }`}>
          <span className="text-lg">{ok ? "✓" : "⚠"}</span>
          <span>
            {result.method === "folder"
              ? `${result.filesWritten} file${result.filesWritten !== 1 ? "s" : ""} saved to folder`
              : `${result.filesWritten} file${result.filesWritten !== 1 ? "s" : ""} packaged in ZIP`}
            {result.filesFailed > 0 ? ` · ${result.filesFailed} failed` : ""}
            {" · "}{result.durationMs}ms
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: result.filesWritten.toString(), l: "Written" },
            { v: result.method === "folder" ? "Folder" : "ZIP", l: "Method" },
            { v: result.manifestWritten ? "Yes" : "No", l: "Manifest" },
          ].map(({ v, l }) => (
            <div key={l} className="card p-3 text-center">
              <p className="text-base font-bold text-white">{v}</p>
              <p className="text-xs text-gray-600 mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        {/* Failed files */}
        {result.filesFailed > 0 && (
          <div className="card px-4 py-3 text-xs">
            <p className="text-red-400 font-medium mb-1.5">Failed files</p>
            {result.fileRecords.filter((f) => f.status === "failed").map((f) => (
              <p key={f.name} className="text-gray-500 font-mono">{f.name} — {f.error}</p>
            ))}
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {result.method === "folder" && (
            <button onClick={onOpenResult} className="btn-primary">
              Open folder
            </button>
          )}
          <button onClick={onExportAgain} className="btn-secondary">Export again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="label">Export</span>

      <div className="flex gap-3 flex-wrap">
        {/* Folder save — only shown when supported */}
        {folderSupported && (
          <button
            onClick={onSaveToFolder}
            disabled={!canExport || isExporting}
            className="btn-primary flex-1 min-w-[140px]"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M2 7a2 2 0 012-2h3.586l2 2H16a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Save to folder
          </button>
        )}

        {/* ZIP — always visible */}
        <button
          onClick={onDownloadZip}
          disabled={!canExport || isExporting}
          className={`${folderSupported ? "btn-secondary" : "btn-primary"} flex-1 min-w-[140px]`}
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v10m-4-4 4 4 4-4M4 16h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download ZIP
        </button>
      </div>

      {/* Browser limitation note */}
      {note && (
        <p className="text-xs text-gray-600 leading-relaxed">{note}</p>
      )}

      {!canExport && (
        <p className="text-xs text-gray-700">Add text to enable export.</p>
      )}
    </div>
  );
}

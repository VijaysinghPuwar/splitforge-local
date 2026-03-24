"use client";

import { canSaveToFolder, folderLimitationNote } from "@/lib/capabilities";
import type { ExportResult } from "@/lib/exporter";

interface Props {
  canExport: boolean;
  isExporting: boolean;
  result: ExportResult | null;
  onSaveToFolder: () => void;
  onDownloadZip: () => void;
  onExportAgain: () => void;
}

export default function ExportPanel({ canExport, isExporting, result, onSaveToFolder, onDownloadZip, onExportAgain }: Props) {
  const folderOk = canSaveToFolder();
  const note = folderLimitationNote();

  if (result) {
    const ok = result.filesFailed === 0;
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
          ok ? "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.25)] text-success" : "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.25)] text-error"
        }`}>
          <span className="text-base mt-px">{ok ? "✓" : "⚠"}</span>
          <div>
            <p className="font-medium">
              {result.method === "folder"
                ? `${result.filesWritten} file${result.filesWritten !== 1 ? "s" : ""} saved`
                : `${result.filesWritten} file${result.filesWritten !== 1 ? "s" : ""} in ZIP`}
              {result.filesFailed > 0 && ` · ${result.filesFailed} failed`}
            </p>
            <p className="text-xs opacity-70 mt-0.5">{result.durationMs}ms · {result.manifestWritten ? "manifest included" : "no manifest"}</p>
          </div>
        </div>

        {result.filesFailed > 0 && (
          <div className="card px-4 py-3 text-xs space-y-1">
            <p className="text-error font-medium">Failed files</p>
            {result.fileRecords.filter((f) => f.status === "failed").map((f) => (
              <p key={f.name} className="text-text-dim font-mono">{f.name} — {f.error}</p>
            ))}
          </div>
        )}

        <button onClick={onExportAgain} className="btn-secondary text-xs">Export again</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="label">Export</span>

      <div className="flex flex-col gap-2">
        {folderOk && (
          <button
            onClick={onSaveToFolder}
            disabled={!canExport || isExporting}
            className="btn-primary w-full"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M2 7a2 2 0 012-2h3.586l2 2H16a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Save to folder
          </button>
        )}
        <button
          onClick={onDownloadZip}
          disabled={!canExport || isExporting}
          className={folderOk ? "btn-secondary w-full" : "btn-primary w-full"}
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v10m-4-4 4 4 4-4M4 16h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download ZIP
        </button>
      </div>

      {note && <p className="text-xs text-text-dim">{note}</p>}
      {!canExport && <p className="text-xs text-text-dim">Add text to enable export.</p>}
    </div>
  );
}

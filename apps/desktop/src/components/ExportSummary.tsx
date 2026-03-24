"use client";

import type { ExportResult } from "@/lib/exporter";

interface Props {
  result: ExportResult;
  onOpenFolder: () => void;
  onExportAgain: () => void;
}

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="stat-card">
      <span className={`stat-value ${accent ? "text-brand-400" : ""}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function ExportSummary({ result, onOpenFolder, onExportAgain }: Props) {
  const allGood = result.filesFailed === 0;
  const hasSkipped = result.filesSkipped > 0;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Status banner */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          allGood
            ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
            : "bg-red-900/20 border-red-700/40 text-red-300"
        }`}
      >
        <span className="text-lg leading-none">{allGood ? "✓" : "⚠"}</span>
        <span>
          {allGood
            ? `${result.filesWritten.toLocaleString()} ${result.filesWritten === 1 ? "file" : "files"} exported successfully`
            : `${result.filesFailed} ${result.filesFailed === 1 ? "file" : "files"} failed to write`}
          {hasSkipped ? ` · ${result.filesSkipped} skipped` : ""}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat value={result.totalInputChars} label="Input chars" />
        <Stat value={result.charLimit} label="Chars / file" />
        <Stat value={result.filesWritten} label="Files written" accent />
        <Stat value={`${result.durationMs}ms`} label="Duration" />
      </div>

      {/* Output path */}
      <div className="card px-4 py-3 flex items-center gap-3">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-500 shrink-0">
          <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        <p className="text-xs font-mono text-gray-400 flex-1 truncate" title={result.outputFolder}>
          {result.outputFolder}
        </p>
      </div>

      {/* Failed files (if any) */}
      {result.filesFailed > 0 && (
        <div className="card px-4 py-3">
          <p className="text-xs font-medium text-red-400 mb-2">Failed writes</p>
          <ul className="space-y-1">
            {result.fileResults
              .filter((f) => f.status === "failed")
              .map((f) => (
                <li key={f.fileName} className="text-xs text-gray-500 font-mono">
                  <span className="text-red-400">{f.fileName}</span>
                  {f.error ? ` — ${f.error}` : ""}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={onOpenFolder} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          Open folder
        </button>
        <button onClick={onExportAgain} className="btn-secondary">
          Export again
        </button>
      </div>

      {result.manifestWritten && (
        <p className="text-xs text-gray-600">manifest.json written to output folder</p>
      )}
    </div>
  );
}

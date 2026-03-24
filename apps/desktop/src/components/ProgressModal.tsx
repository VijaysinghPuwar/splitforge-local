"use client";

import type { ExportProgress } from "@/lib/exporter";

interface Props {
  progress: ExportProgress;
  onCancel: () => void;
}

export default function ProgressModal({ progress, onCancel }: Props) {
  const pct = Math.round((progress.current / progress.total) * 100);
  const isCancelling = progress.current === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Export in progress"
    >
      <div className="card w-full max-w-sm mx-4 p-6 flex flex-col gap-5 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Exporting…</h2>
          <span className="text-xs text-gray-500 tabular-nums">
            {progress.current} / {progress.total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-200"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p
            className="text-xs text-gray-500 truncate font-mono"
            title={progress.currentFile}
          >
            {progress.currentFile}
          </p>
        </div>

        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="btn-secondary w-full text-xs"
        >
          {isCancelling ? "Cancelling…" : "Cancel"}
        </button>
      </div>
    </div>
  );
}

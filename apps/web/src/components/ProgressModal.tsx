"use client";

interface Props {
  current: number;
  total: number;
  label: string;
  phase: "splitting" | "exporting";
  onCancel: () => void;
}

export default function ProgressModal({ current, total, label, phase, onCancel }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-sm mx-4 p-6 flex flex-col gap-5 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white capitalize">{phase}…</h2>
          <span className="text-xs text-gray-500 tabular-nums">{current} / {total > 0 ? total : "?"}</span>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-150"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-gray-600 font-mono truncate" title={label}>{label || "Processing…"}</p>
        </div>

        <button onClick={onCancel} className="btn-secondary w-full text-xs py-2">Cancel</button>
      </div>
    </div>
  );
}

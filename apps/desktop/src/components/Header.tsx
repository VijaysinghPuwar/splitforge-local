"use client";

interface Props {
  onReset: () => void;
  canReset: boolean;
}

export default function Header({ onReset, canReset }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="1" y="1" width="16" height="4" rx="1.5" fill="white" opacity="0.9" />
            <rect x="1" y="7" width="10" height="4" rx="1.5" fill="white" opacity="0.7" />
            <rect x="1" y="13" width="6" height="4" rx="1.5" fill="white" opacity="0.5" />
          </svg>
        </div>

        <div>
          <h1 className="text-sm font-semibold text-white leading-tight">SplitForge Local</h1>
          <p className="text-xs text-gray-500 leading-tight">Split large text into numbered files</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Privacy badge */}
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-surface-card border border-surface-border px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
          100% local
        </span>

        {canReset && (
          <button
            onClick={onReset}
            className="btn-ghost text-xs"
            title="Clear everything and start over"
          >
            Reset
          </button>
        )}
      </div>
    </header>
  );
}

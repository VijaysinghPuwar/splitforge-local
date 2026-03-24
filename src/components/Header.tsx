"use client";

interface Props {
  hasContent: boolean;
  onReset: () => void;
}

export default function Header({ hasContent, onReset }: Props) {
  return (
    <header className="border-b border-border bg-surface flex-shrink-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-text-primary tracking-tight">SplitForge</span>
          <span className="hidden sm:inline badge bg-accent-dim text-accent text-[10px]">Local</span>
        </div>
        <div className="flex items-center gap-2">
          {hasContent && (
            <button onClick={onReset} className="btn-ghost text-xs px-3 py-1.5">
              Clear
            </button>
          )}
          <a
            href="https://github.com/VijaysinghPuwar/splitforge-local"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs px-3 py-1.5"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}

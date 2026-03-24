"use client";

const GITHUB = "https://github.com/VijaysinghPuwar/splitforge-local";

interface Props { onReset: () => void; hasContent: boolean }

export default function Header({ onReset, hasContent }: Props) {
  return (
    <header className="h-13 flex items-center justify-between px-5 border-b border-surface-border shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="1" y="1" width="13" height="3.5" rx="1" fill="white" opacity="0.9" />
            <rect x="1" y="6.25" width="8.5" height="3.5" rx="1" fill="white" opacity="0.65" />
            <rect x="1" y="11" width="5" height="3" rx="1" fill="white" opacity="0.4" />
          </svg>
        </div>
        <div>
          <span className="text-sm font-semibold text-white">SplitForge</span>
          <span className="hidden sm:inline ml-2 text-xs text-gray-600">
            All processing runs in your browser
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 border border-surface-border rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
          100% local
        </span>

        {hasContent && (
          <button onClick={onReset} className="btn-ghost text-xs py-1.5">
            Reset
          </button>
        )}

        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost py-1.5 px-2.5"
          aria-label="GitHub repository"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
}

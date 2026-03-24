"use client";

interface Props {
  folder: string | null;
  onPickFolder: () => void;
  isPicking: boolean;
}

export default function OutputFolderPicker({ folder, onPickFolder, isPicking }: Props) {
  const shortPath = folder
    ? folder.length > 52
      ? "…" + folder.slice(-52)
      : folder
    : null;

  return (
    <div>
      <span className="label">Output folder</span>

      <button
        onClick={onPickFolder}
        disabled={isPicking}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left
          transition-all duration-150
          ${
            folder
              ? "bg-surface border-brand-500/40 hover:border-brand-400"
              : "bg-surface border-surface-border hover:border-gray-600 border-dashed"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface
        `}
        aria-label={folder ? `Selected folder: ${folder}. Click to change.` : "Choose output folder"}
      >
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${folder ? "bg-brand-500/15" : "bg-surface-border"}`}>
          {isPicking ? (
            <svg className="animate-spin h-4 w-4 text-brand-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={folder ? "text-brand-400" : "text-gray-500"}
            >
              <path
                d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {folder ? (
            <>
              <p className="text-xs font-medium text-brand-300">Output folder selected</p>
              <p
                className="text-xs text-gray-500 truncate font-mono mt-0.5"
                title={folder}
              >
                {shortPath}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              {isPicking ? "Opening folder picker…" : "Choose folder…"}
            </p>
          )}
        </div>

        {folder && !isPicking && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            className="shrink-0 text-gray-600"
          >
            <path
              d="M7 7l6 3-6 3V7z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

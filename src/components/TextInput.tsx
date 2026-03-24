"use client";

interface Props {
  text: string;
  charCount: number;
  charLimit: number;
  estimatedChunks: number;
  inputFileName: string | null;
  onTextChange: (t: string) => void;
  onImportFile: () => void;
  isImporting: boolean;
}

export default function TextInput({
  text, charCount, charLimit, estimatedChunks,
  inputFileName, onTextChange, onImportFile, isImporting,
}: Props) {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="label">Input</span>
          {inputFileName && (
            <span className="badge bg-surface-2 border border-border text-text-secondary text-[10px]">
              {inputFileName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-dim tabular-nums">
            {charCount.toLocaleString()} chars
            {estimatedChunks > 0 && (
              <span className="ml-2 text-accent font-medium">→ {estimatedChunks} file{estimatedChunks !== 1 ? "s" : ""}</span>
            )}
          </span>
          <button
            onClick={onImportFile}
            disabled={isImporting}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            {isImporting ? "Importing…" : "Import .txt"}
          </button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste your text here…"
        className="flex-1 w-full input resize-none font-mono text-sm leading-relaxed min-h-[200px]"
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}

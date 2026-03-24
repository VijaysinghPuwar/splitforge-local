"use client";

import { useRef, useCallback } from "react";
import { countCharacters, estimateFileCount, humanSize, LARGE_TEXT_THRESHOLD } from "@/lib/textCounter";

interface Props {
  text: string;
  charLimit: number;
  inputFileName: string | null;
  onTextChange: (t: string) => void;
  onImportFile: () => void;
  isImporting: boolean;
}

export default function TextInputPanel({
  text, charLimit, inputFileName, onTextChange, onImportFile, isImporting,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const charCount = countCharacters(text);
  const estFiles = estimateFileCount(text, charLimit);
  const hasText = charCount > 0;
  const isLarge = charCount > LARGE_TEXT_THRESHOLD;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") onTextChange(ev.target.result);
      };
      reader.readAsText(file, "utf-8");
    },
    [onTextChange]
  );

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="label mb-0">Input</span>
          {inputFileName && (
            <span className="text-xs text-gray-500 truncate font-mono">{inputFileName}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasText && (
            <button onClick={() => onTextChange("")} className="btn-ghost py-1 px-2 text-xs text-gray-500">
              Clear
            </button>
          )}
          <button
            onClick={onImportFile}
            disabled={isImporting}
            className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
          >
            {isImporting ? (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v10m-4-4 4 4 4-4M4 16h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {isImporting ? "Importing…" : "Import .txt"}
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
        placeholder="Paste your text here, or drag and drop a .txt file…"
        spellCheck={false}
        className="
          flex-1 min-h-[220px] resize-none w-full
          bg-surface border border-surface-border rounded-xl
          px-4 py-3.5 text-sm text-gray-200 leading-relaxed font-mono
          placeholder-gray-700
          focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500
          transition-colors
        "
        aria-label="Input text"
      />

      {/* Stats */}
      <div className="flex items-center justify-between text-xs shrink-0 px-0.5">
        <span className={hasText ? "text-gray-400" : "text-gray-600"}>
          {hasText ? (
            <>
              <span className="text-white font-medium tabular-nums">{charCount.toLocaleString()}</span>
              {" chars · "}
              {humanSize(text)}
            </>
          ) : "No text · supports drag & drop"}
        </span>
        {hasText && charLimit > 0 && (
          <span className="text-gray-400">
            <span className="text-white font-medium tabular-nums">~{estFiles.toLocaleString()}</span>
            {" "}{estFiles === 1 ? "file" : "files"}
          </span>
        )}
      </div>

      {/* Large text warning */}
      {isLarge && (
        <p className="text-xs text-yellow-500/80 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2 shrink-0">
          Large input ({charCount.toLocaleString()} chars). Processing runs in a background worker to keep the UI responsive.
        </p>
      )}
    </div>
  );
}

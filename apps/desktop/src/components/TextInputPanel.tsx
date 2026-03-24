"use client";

import { useRef, useCallback } from "react";
import { countCharacters, byteSizeLabel, estimateFileCount } from "@splitforge/core";

interface Props {
  text: string;
  charLimit: number;
  onTextChange: (text: string) => void;
  onImportFile: () => void;
  isImporting: boolean;
}

export default function TextInputPanel({
  text,
  charLimit,
  onTextChange,
  onImportFile,
  isImporting,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = countCharacters(text);
  const estimatedFiles = estimateFileCount(text, charLimit);
  const hasText = charCount > 0;

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      // Let the browser's default paste happen; just mark that we handled it
      // React's onChange will fire after and update state
      e.stopPropagation();
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (!file.name.endsWith(".txt")) {
        return; // silently ignore non-txt drops here; parent handles errors
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") onTextChange(result);
      };
      reader.readAsText(file, "utf-8");
    },
    [onTextChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="label mb-0">Input Text</span>
        <div className="flex items-center gap-2">
          {hasText && (
            <button
              onClick={() => onTextChange("")}
              className="btn-ghost py-1 px-2 text-xs text-gray-500"
              title="Clear text"
            >
              Clear
            </button>
          )}
          <button
            onClick={onImportFile}
            disabled={isImporting}
            className="btn-secondary py-1.5 text-xs"
          >
            {isImporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Importing…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3v10m-4-4 4 4 4-4M4 15h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Import .txt
              </>
            )}
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          placeholder="Paste your text here, or drag and drop a .txt file…"
          spellCheck={false}
          className="
            w-full h-full min-h-[260px] resize-none
            bg-surface border border-surface-border rounded-xl
            px-4 py-3.5 text-sm text-gray-200 leading-relaxed
            placeholder-gray-600 font-mono
            focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500
            transition-colors duration-150
          "
          aria-label="Input text"
        />

        {/* Drop overlay hint */}
        {!hasText && (
          <div
            aria-hidden="true"
            className="absolute bottom-4 left-4 right-4 flex items-center justify-center pointer-events-none"
          >
            <span className="text-xs text-gray-700">
              Supports drag &amp; drop
            </span>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span className={hasText ? "text-gray-400" : ""}>
          {hasText ? (
            <>
              <span className="text-white font-medium tabular-nums">
                {charCount.toLocaleString()}
              </span>{" "}
              chars · {byteSizeLabel(text)}
            </>
          ) : (
            "No text yet"
          )}
        </span>

        {hasText && charLimit > 0 && (
          <span>
            <span className="text-white font-medium tabular-nums">
              ~{estimatedFiles.toLocaleString()}
            </span>{" "}
            {estimatedFiles === 1 ? "file" : "files"}
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { countCharacters } from "@splitforge/core";

interface Props {
  chunks: string[];
  charLimit: number;
  isVisible: boolean;
  onToggle: () => void;
}

function ChunkCard({ chunk, index }: { chunk: string; index: number }) {
  const [copied, setCopied] = useState(false);
  const count = countCharacters(chunk);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chunk);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — silently ignore
    }
  };

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border">
        <span className="text-xs font-medium text-gray-400">
          Chunk {index + 1}
          <span className="ml-2 text-gray-600 tabular-nums">
            {count.toLocaleString()} chars
          </span>
        </span>
        <button
          onClick={handleCopy}
          className="btn-ghost py-1 px-2 text-xs"
          aria-label={`Copy chunk ${index + 1}`}
        >
          {copied ? (
            <span className="text-brand-400">Copied!</span>
          ) : (
            "Copy"
          )}
        </button>
      </div>

      {/* Content */}
      <pre className="px-4 py-3 text-xs text-gray-400 font-mono leading-relaxed overflow-auto max-h-32 whitespace-pre-wrap break-all">
        {chunk.length > 400
          ? chunk.slice(0, 400) + `\n\n… (${count.toLocaleString()} chars total)`
          : chunk}
      </pre>
    </div>
  );
}

export default function PreviewPanel({ chunks, charLimit, isVisible, onToggle }: Props) {
  if (chunks.length === 0) return null;

  return (
    <div className="border-t border-surface-border">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-surface-hover transition-colors text-left"
        aria-expanded={isVisible}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Preview</span>
          <span className="text-xs text-gray-600">
            first {chunks.length} {chunks.length === 1 ? "chunk" : "chunks"} · {charLimit.toLocaleString()} chars/file
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isVisible ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {isVisible && (
        <div className="px-6 pb-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chunks.map((chunk, i) => (
              <ChunkCard key={i} chunk={chunk} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

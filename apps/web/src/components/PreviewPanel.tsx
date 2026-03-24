"use client";

import { useState } from "react";
import { countCharacters } from "@/lib/textCounter";
import { canUseClipboard } from "@/lib/capabilities";

interface Props {
  chunks: string[];
  charLimit: number;
  isOpen: boolean;
  onToggle: () => void;
}

function ChunkCard({ chunk, index }: { chunk: string; index: number }) {
  const [copied, setCopied] = useState(false);
  const count = countCharacters(chunk);
  const preview = chunk.length > 320 ? chunk.slice(0, 320) + `…` : chunk;

  const handleCopy = async () => {
    if (!canUseClipboard()) return;
    await navigator.clipboard.writeText(chunk).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border shrink-0">
        <span className="text-xs font-medium text-gray-400">
          Chunk {index + 1}
          <span className="ml-2 text-gray-600 tabular-nums">{count.toLocaleString()} chars</span>
        </span>
        <button onClick={handleCopy} className="btn-ghost py-0.5 px-2 text-xs">
          {copied ? <span className="text-brand-400">Copied</span> : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs text-gray-500 font-mono leading-relaxed overflow-auto max-h-28 whitespace-pre-wrap break-all">
        {preview}
      </pre>
    </div>
  );
}

export default function PreviewPanel({ chunks, charLimit, isOpen, onToggle }: Props) {
  if (!chunks.length) return null;

  return (
    <div className="border-t border-surface-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-300">Preview</span>
          <span className="text-gray-600 text-xs">
            first {chunks.length} {chunks.length === 1 ? "chunk" : "chunks"} · {charLimit.toLocaleString()} chars/file
          </span>
        </div>
        <svg className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
          {chunks.map((c, i) => <ChunkCard key={i} chunk={c} index={i} />)}
        </div>
      )}
    </div>
  );
}

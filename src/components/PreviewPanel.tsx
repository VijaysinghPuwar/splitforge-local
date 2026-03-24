"use client";

import { useState } from "react";
import { countChars } from "@/lib/splitter";
import { canUseClipboard } from "@/lib/capabilities";

function ChunkCard({ chunk, index }: { chunk: string; index: number }) {
  const [copied, setCopied] = useState(false);
  const chars = countChars(chunk);
  const preview = chunk.length > 280 ? chunk.slice(0, 280) + "…" : chunk;

  const handleCopy = async () => {
    if (!canUseClipboard()) return;
    await navigator.clipboard.writeText(chunk).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span className="text-xs text-text-secondary">
          Chunk {index + 1}
          <span className="ml-2 text-text-dim tabular-nums">{chars.toLocaleString()} chars</span>
        </span>
        <button onClick={handleCopy} className="btn-ghost py-0.5 px-2 text-xs">
          {copied ? <span className="text-accent">Copied</span> : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs text-text-dim font-mono leading-relaxed overflow-auto max-h-24 whitespace-pre-wrap break-all">
        {preview}
      </pre>
    </div>
  );
}

interface Props {
  chunks: string[];
  charLimit: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PreviewPanel({ chunks, charLimit, isOpen, onToggle }: Props) {
  if (!chunks.length) return null;
  return (
    <div className="border-t border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-2 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-text-primary">Preview</span>
          <span className="text-text-dim text-xs">
            first {chunks.length} {chunks.length === 1 ? "chunk" : "chunks"} · {charLimit.toLocaleString()} chars/file
          </span>
        </div>
        <svg className={`w-4 h-4 text-text-dim transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
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

"use client";

import { useState, useId } from "react";
import { validateCharLimit } from "@/lib/textCounter";
import { sanitizePrefix } from "@/lib/fileNaming";
import type { SplitMode } from "@/lib/splitter";

interface Props {
  charLimit: number;
  splitMode: SplitMode;
  filePrefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
  onChange: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
}

interface Settings {
  charLimit: number;
  splitMode: SplitMode;
  filePrefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
}

function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-3 cursor-pointer group py-0.5">
      <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors select-none">{label}</span>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`toggle-track shrink-0 ${checked ? "bg-brand-500" : "bg-surface-border"}`}
      >
        <span className={`toggle-thumb ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
      </button>
    </label>
  );
}

export default function SplitSettings({ charLimit, splitMode, filePrefix, leadingZeros, createSubfolder, exportManifest, onChange }: Props) {
  const [rawLimit, setRawLimit] = useState(String(charLimit));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const uid = useId();
  const limitError = validateCharLimit(Number(rawLimit));

  const handleLimitChange = (raw: string) => {
    setRawLimit(raw);
    const n = Number(raw);
    if (!validateCharLimit(n)) onChange("charLimit", n);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Character limit */}
      <div>
        <label className="label" htmlFor={`${uid}-lim`}>Characters per file</label>
        <input
          id={`${uid}-lim`}
          type="number"
          min={1}
          max={10_000_000}
          value={rawLimit}
          onChange={(e) => handleLimitChange(e.target.value)}
          className={`input-field ${limitError ? "border-red-600 focus:border-red-500 focus:ring-red-500" : ""}`}
        />
        {limitError && <p className="mt-1.5 text-xs text-red-400">{limitError}</p>}
      </div>

      {/* Mode toggle */}
      <div>
        <span className="label">Split mode</span>
        <div className="flex gap-2">
          {(["exact", "smart"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onChange("splitMode", m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                splitMode === m
                  ? "bg-brand-500/10 border-brand-500 text-brand-300"
                  : "bg-surface border-surface-border text-gray-500 hover:text-gray-200 hover:border-gray-600"
              }`}
            >
              {m === "exact" ? "Exact" : "Smart"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-600 leading-relaxed">
          {splitMode === "exact"
            ? "Each file contains exactly N characters. Last file may be shorter."
            : "Prefers paragraph or line breaks near the limit. Never exceeds it."}
        </p>
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
        aria-expanded={showAdvanced}
      >
        <svg className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`} viewBox="0 0 12 12" fill="none">
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Advanced
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-3.5 pl-3 border-l border-surface-border animate-fade-in">
          <div>
            <label className="label" htmlFor={`${uid}-pfx`}>File prefix</label>
            <input
              id={`${uid}-pfx`}
              type="text"
              placeholder='e.g. "part-" → part-1.txt'
              value={filePrefix}
              onChange={(e) => onChange("filePrefix", sanitizePrefix(e.target.value))}
              className="input-field"
              maxLength={64}
            />
          </div>
          <Toggle id={`${uid}-zeros`}    checked={leadingZeros}     onChange={(v) => onChange("leadingZeros", v)}     label="Leading zeros" />
          <Toggle id={`${uid}-sub`}      checked={createSubfolder}  onChange={(v) => onChange("createSubfolder", v)}  label="Create timestamped subfolder" />
          <Toggle id={`${uid}-manifest`} checked={exportManifest}   onChange={(v) => onChange("exportManifest", v)}   label="Write manifest.json" />
        </div>
      )}
    </div>
  );
}

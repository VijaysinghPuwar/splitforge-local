"use client";

import { useState, useId } from "react";
import { validateCharLimit, sanitizePrefix } from "@splitforge/core";
import type { SplitMode } from "@splitforge/core";
import type { OverwriteMode } from "@/lib/exporter";

interface Props {
  charLimit: number;
  splitMode: SplitMode;
  filePrefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
  overwriteMode: OverwriteMode;
  onCharLimitChange: (v: number) => void;
  onSplitModeChange: (v: SplitMode) => void;
  onFilePrefixChange: (v: string) => void;
  onLeadingZerosChange: (v: boolean) => void;
  onCreateSubfolderChange: (v: boolean) => void;
  onExportManifestChange: (v: boolean) => void;
  onOverwriteModeChange: (v: OverwriteMode) => void;
}

function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-3 cursor-pointer group">
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
        {label}
      </span>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`toggle-track shrink-0 ${checked ? "bg-brand-500" : "bg-surface-border"}`}
      >
        <span
          className={`toggle-thumb ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
        />
      </button>
    </label>
  );
}

export default function SplitSettings({
  charLimit,
  splitMode,
  filePrefix,
  leadingZeros,
  createSubfolder,
  exportManifest,
  overwriteMode,
  onCharLimitChange,
  onSplitModeChange,
  onFilePrefixChange,
  onLeadingZerosChange,
  onCreateSubfolderChange,
  onExportManifestChange,
  onOverwriteModeChange,
}: Props) {
  const [charLimitRaw, setCharLimitRaw] = useState(String(charLimit));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const uid = useId();

  const charLimitError = validateCharLimit(Number(charLimitRaw));

  const handleCharLimitChange = (raw: string) => {
    setCharLimitRaw(raw);
    const n = Number(raw);
    if (!validateCharLimit(n)) {
      onCharLimitChange(n);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Character limit */}
      <div>
        <label className="label" htmlFor={`${uid}-charlimit`}>
          Characters per file
        </label>
        <input
          id={`${uid}-charlimit`}
          type="number"
          min={1}
          max={10_000_000}
          value={charLimitRaw}
          onChange={(e) => handleCharLimitChange(e.target.value)}
          className={`input-field ${charLimitError ? "border-red-600 focus:border-red-500 focus:ring-red-500" : ""}`}
          aria-describedby={charLimitError ? `${uid}-charlimit-err` : undefined}
        />
        {charLimitError && (
          <p id={`${uid}-charlimit-err`} className="mt-1.5 text-xs text-red-400">
            {charLimitError}
          </p>
        )}
      </div>

      {/* Split mode */}
      <div>
        <span className="label">Split mode</span>
        <div className="flex gap-2">
          {(["exact", "smart"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onSplitModeChange(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                splitMode === m
                  ? "bg-brand-500/15 border-brand-500 text-brand-300"
                  : "bg-surface border-surface-border text-gray-400 hover:text-gray-200 hover:border-gray-600"
              }`}
            >
              {m === "exact" ? "Exact" : "Smart"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-600">
          {splitMode === "exact"
            ? "Every file contains exactly the chosen count (last file may be shorter)."
            : "Prefers paragraph or line breaks near the limit — never exceeds it."}
        </p>
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        aria-expanded={showAdvanced}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        Advanced options
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-4 pl-3 border-l border-surface-border animate-fade-in">
          {/* File prefix */}
          <div>
            <label className="label" htmlFor={`${uid}-prefix`}>
              File prefix
            </label>
            <input
              id={`${uid}-prefix`}
              type="text"
              placeholder="e.g. part-"
              value={filePrefix}
              onChange={(e) => onFilePrefixChange(sanitizePrefix(e.target.value))}
              className="input-field"
              maxLength={64}
            />
            <p className="mt-1 text-xs text-gray-600">
              Result: {filePrefix || ""}1.txt, {filePrefix || ""}2.txt…
            </p>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <Toggle
              id={`${uid}-zeros`}
              checked={leadingZeros}
              onChange={onLeadingZerosChange}
              label="Leading zeros"
            />
            <Toggle
              id={`${uid}-subfolder`}
              checked={createSubfolder}
              onChange={onCreateSubfolderChange}
              label="Create export subfolder"
            />
            <Toggle
              id={`${uid}-manifest`}
              checked={exportManifest}
              onChange={onExportManifestChange}
              label="Write manifest.json"
            />
          </div>

          {/* Overwrite mode */}
          <div>
            <label className="label" htmlFor={`${uid}-overwrite`}>
              If files exist
            </label>
            <select
              id={`${uid}-overwrite`}
              value={overwriteMode}
              onChange={(e) => onOverwriteModeChange(e.target.value as OverwriteMode)}
              className="input-field"
            >
              <option value="overwrite">Overwrite</option>
              <option value="skip">Skip existing</option>
              <option value="new-folder">Create new subfolder</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

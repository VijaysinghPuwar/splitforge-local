"use client";

import type { SplitMode } from "@/lib/splitter";

interface Props {
  charLimit: number;
  mode: SplitMode;
  prefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
  onChange: <K extends keyof SettingsShape>(key: K, value: SettingsShape[K]) => void;
}

export interface SettingsShape {
  charLimit: number;
  mode: SplitMode;
  prefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
}

function Toggle({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <div>
        <div className="text-sm text-text-primary group-hover:text-white transition-colors">{label}</div>
        {description && <div className="text-xs text-text-dim mt-0.5">{description}</div>}
      </div>
      <div
        className={`relative w-9 h-5 rounded-full transition-colors duration-150 flex-shrink-0 ${checked ? "bg-accent" : "bg-surface-2 border border-border"}`}
        onClick={() => onChange(!checked)}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-150 ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
    </label>
  );
}

export default function Settings({ charLimit, mode, prefix, leadingZeros, createSubfolder, exportManifest, onChange }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Character limit */}
      <div className="flex flex-col gap-2">
        <label className="label">Chars per file</label>
        <input
          type="number"
          value={charLimit}
          min={1}
          max={1000000}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 1) onChange("charLimit", v);
          }}
          className="input w-full tabular-nums"
        />
      </div>

      {/* Split mode */}
      <div className="flex flex-col gap-2">
        <span className="label">Split mode</span>
        <div className="grid grid-cols-2 gap-2">
          {(["exact", "smart"] as SplitMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onChange("mode", m)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                mode === m
                  ? "bg-accent border-accent text-white"
                  : "bg-surface-2 border-border text-text-secondary hover:border-border-hover hover:text-text-primary"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-dim">
          {mode === "exact" ? "Fixed size. Last chunk may be shorter." : "Prefers paragraph/newline breaks. Never exceeds limit."}
        </p>
      </div>

      {/* File prefix */}
      <div className="flex flex-col gap-2">
        <label className="label">File prefix <span className="text-text-dim font-normal normal-case">(optional)</span></label>
        <input
          type="text"
          value={prefix}
          maxLength={32}
          placeholder="e.g. part → part-1.txt"
          onChange={(e) => onChange("prefix", e.target.value.replace(/[^\w-]/g, ""))}
          className="input w-full"
        />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-4 pt-1 border-t border-border">
        <Toggle checked={leadingZeros} onChange={(v) => onChange("leadingZeros", v)} label="Leading zeros" description="01.txt, 02.txt…" />
        <Toggle checked={createSubfolder} onChange={(v) => onChange("createSubfolder", v)} label="Create subfolder" />
        <Toggle checked={exportManifest} onChange={(v) => onChange("exportManifest", v)} label="Include manifest.json" />
      </div>
    </div>
  );
}

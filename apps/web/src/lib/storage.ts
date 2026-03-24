/**
 * storage.ts — localStorage-backed settings persistence and text autosave.
 * Falls back silently when localStorage is unavailable (private mode, SSR).
 */

import type { SplitMode } from "./splitter";

export interface AppSettings {
  charLimit: number;
  splitMode: SplitMode;
  filePrefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
}

const SETTINGS_KEY = "sf:settings";
const DRAFT_KEY    = "sf:draft";

// Text larger than this won't be autosaved to avoid exhausting localStorage quota.
const MAX_AUTOSAVE_BYTES = 512 * 1024; // 512 KB

const DEFAULTS: AppSettings = {
  charLimit: 7100,
  splitMode: "exact",
  filePrefix: "",
  leadingZeros: false,
  createSubfolder: false,
  exportManifest: false,
};

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function loadSettings(): AppSettings {
  const saved = read<Partial<AppSettings>>(SETTINGS_KEY);
  return { ...DEFAULTS, ...saved };
}

export function saveSettings(s: AppSettings): void {
  write(SETTINGS_KEY, s);
}

// ---------------------------------------------------------------------------
// Text autosave / draft restore
// ---------------------------------------------------------------------------

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced autosave — called on every keystroke, saves after 1 s of quiet.
 * Skips saving if the text is larger than MAX_AUTOSAVE_BYTES.
 */
export function autosaveText(text: string): void {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    const bytes = new TextEncoder().encode(text).length;
    if (bytes <= MAX_AUTOSAVE_BYTES) {
      write(DRAFT_KEY, text);
    } else {
      // Clear stale draft if text grew too large
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    }
  }, 1000);
}

export function loadDraft(): string {
  return read<string>(DRAFT_KEY) ?? "";
}

export function clearDraft(): void {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

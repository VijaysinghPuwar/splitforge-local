/**
 * storage.ts
 *
 * Persist user settings to localStorage so they survive app restarts.
 * Falls back gracefully if localStorage is unavailable.
 */

import type { SplitMode } from "@splitforge/core";
import type { OverwriteMode } from "./exporter";

export interface UserSettings {
  charLimit: number;
  splitMode: SplitMode;
  filePrefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
  overwriteMode: OverwriteMode;
  darkMode: boolean;
  lastOutputFolder: string | null;
}

const STORAGE_KEY = "splitforge:settings";

const DEFAULTS: UserSettings = {
  charLimit: 7100,
  splitMode: "exact",
  filePrefix: "",
  leadingZeros: false,
  createSubfolder: false,
  exportManifest: false,
  overwriteMode: "overwrite",
  darkMode: true,
  lastOutputFolder: null,
};

function safeGet(): Partial<UserSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<UserSettings>;
  } catch {
    return {};
  }
}

function safeSave(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (SSR, private mode) — ignore
  }
}

/** Load saved settings merged with defaults. */
export function loadSettings(): UserSettings {
  const saved = safeGet();
  return { ...DEFAULTS, ...saved };
}

/** Persist settings to localStorage. */
export function saveSettings(settings: UserSettings): void {
  safeSave(settings);
}

/** Update a single setting and persist the change. */
export function updateSetting<K extends keyof UserSettings>(
  current: UserSettings,
  key: K,
  value: UserSettings[K]
): UserSettings {
  const updated = { ...current, [key]: value };
  safeSave(updated);
  return updated;
}

/** Reset all settings to defaults. */
export function resetSettings(): UserSettings {
  safeSave(DEFAULTS);
  return { ...DEFAULTS };
}

/**
 * capabilities.ts — Browser feature detection.
 *
 * All checks are safe to call during SSR (they guard with typeof window).
 */

/** File System Access API: showDirectoryPicker() — Chrome 86+, Edge 86+ */
export function canSaveToFolder(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

/** File API: FileReader — universally supported */
export function canImportFile(): boolean {
  return typeof window !== "undefined" && "FileReader" in window;
}

/** Web Workers — universally supported in modern browsers */
export function canUseWorker(): boolean {
  return typeof window !== "undefined" && "Worker" in window;
}

/** Clipboard API */
export function canUseClipboard(): boolean {
  return typeof navigator !== "undefined" && "clipboard" in navigator;
}

export type ExportCapability = "folder-and-zip" | "zip-only";

export function exportCapability(): ExportCapability {
  return canSaveToFolder() ? "folder-and-zip" : "zip-only";
}

/** Short human-readable label for the current browser's export limitation */
export function exportLimitationNote(): string | null {
  if (canSaveToFolder()) return null;
  return "Direct folder export requires a Chromium-based browser (Chrome, Edge, Arc). ZIP download is available in all browsers.";
}

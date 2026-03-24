export function canSaveToFolder(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function canUseClipboard(): boolean {
  return typeof navigator !== "undefined" && "clipboard" in navigator;
}

export function folderLimitationNote(): string | null {
  if (typeof window === "undefined") return null;
  if (canSaveToFolder()) return null;
  return "Direct folder saving requires Chrome or Edge. Use ZIP download instead.";
}

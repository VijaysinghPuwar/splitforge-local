const SETTINGS_KEY = "sf:settings";
const DRAFT_KEY = "sf:draft";
const MAX_DRAFT_BYTES = 512 * 1024;

export interface StoredSettings {
  charLimit: number;
  mode: "exact" | "smart";
  prefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
}

const DEFAULTS: StoredSettings = {
  charLimit: 7100,
  mode: "exact",
  prefix: "",
  leadingZeros: false,
  createSubfolder: false,
  exportManifest: false,
};

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, val: string): void {
  try { localStorage.setItem(key, val); } catch { /* quota */ }
}

export function loadSettings(): StoredSettings {
  const raw = safeGet(SETTINGS_KEY);
  if (!raw) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: StoredSettings): void {
  safeSet(SETTINGS_KEY, JSON.stringify(s));
}

let _draftTimer: ReturnType<typeof setTimeout> | null = null;
export function autosaveDraft(text: string): void {
  if (_draftTimer) clearTimeout(_draftTimer);
  _draftTimer = setTimeout(() => {
    if (new Blob([text]).size <= MAX_DRAFT_BYTES) {
      safeSet(DRAFT_KEY, text);
    }
  }, 800);
}

export function loadDraft(): string {
  return safeGet(DRAFT_KEY) ?? "";
}

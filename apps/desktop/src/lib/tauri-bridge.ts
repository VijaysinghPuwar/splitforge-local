/**
 * tauri-bridge.ts
 *
 * Thin wrapper around Tauri's JS API and plugins.
 *
 * All Tauri-specific code is isolated here so that:
 *  1. The rest of the app never imports from @tauri-apps directly.
 *  2. During Next.js SSR / static export builds, Tauri APIs are not called
 *     (they are only available inside the desktop runtime).
 *  3. The web layer can stub or ignore this module cleanly.
 *
 * Every function checks `isTauri()` before invoking Tauri APIs and throws
 * a clear error if called from a non-Tauri context.
 */

// Extend the global Window interface so TypeScript knows about the Tauri
// internal marker. This avoids unsafe `as` casts and gives correct typing.
declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

/** Returns true when the app is running inside the Tauri desktop shell. */
export function isTauri(): boolean {
  return typeof window !== "undefined" && typeof window.__TAURI_INTERNALS__ !== "undefined";
}

/** Throw a consistent error for browser-only contexts. */
function requireTauri(fnName: string): void {
  if (!isTauri()) {
    throw new Error(
      `${fnName}() requires the Tauri desktop runtime. This feature is not available in the browser.`
    );
  }
}

// ---------------------------------------------------------------------------
// File-system commands (backed by Rust via tauri::command)
// ---------------------------------------------------------------------------

/** Read a UTF-8 text file from the local file system. */
export async function readTextFile(path: string): Promise<string> {
  requireTauri("readTextFile");
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string>("read_text_file", { path });
}

/**
 * Write UTF-8 content to a file.
 *
 * @param baseDir  The user-selected output folder (used by Rust for path validation).
 * @param path     Full absolute path to the target file.
 * @param content  UTF-8 text content to write.
 */
export async function writeTextFile(
  baseDir: string,
  path: string,
  content: string
): Promise<void> {
  requireTauri("writeTextFile");
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("write_text_file", { baseDir, path, content });
}

/** Check whether a path exists on the local file system. */
export async function pathExists(path: string): Promise<boolean> {
  requireTauri("pathExists");
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<boolean>("path_exists", { path });
}

/** Create a directory and all necessary parents. */
export async function createDirAll(path: string): Promise<void> {
  requireTauri("createDirAll");
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("create_dir_all", { path });
}

/** List the file names inside a directory. */
export async function listDir(path: string): Promise<string[]> {
  requireTauri("listDir");
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string[]>("list_dir", { path });
}

/** Return the file-name component of a path. */
export async function getFileName(path: string): Promise<string> {
  requireTauri("getFileName");
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string>("get_file_name", { path });
}

// ---------------------------------------------------------------------------
// Dialog commands (tauri-plugin-dialog)
// ---------------------------------------------------------------------------

/**
 * Open a native folder-picker dialog.
 * @returns The selected folder path, or null if the user cancelled.
 */
export async function pickFolder(): Promise<string | null> {
  requireTauri("pickFolder");
  const { open } = await import("@tauri-apps/plugin-dialog");
  const result = await open({ directory: true, multiple: false, title: "Select Output Folder" });
  if (result === null || Array.isArray(result)) return null;
  return result;
}

/**
 * Open a native file-picker dialog for .txt files.
 * @returns The selected file path, or null if the user cancelled.
 */
export async function pickTextFile(): Promise<string | null> {
  requireTauri("pickTextFile");
  const { open } = await import("@tauri-apps/plugin-dialog");
  const result = await open({
    multiple: false,
    title: "Import Text File",
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });
  if (result === null || Array.isArray(result)) return null;
  return result;
}

// ---------------------------------------------------------------------------
// Opener commands (tauri-plugin-opener)
// ---------------------------------------------------------------------------

/** Open a folder in the native file manager (Finder on macOS, Explorer on Windows). */
export async function openFolder(folderPath: string): Promise<void> {
  requireTauri("openFolder");
  const { openUrl } = await import("@tauri-apps/plugin-opener");
  // Tauri's opener accepts file:// URLs and plain paths
  await openUrl(folderPath);
}

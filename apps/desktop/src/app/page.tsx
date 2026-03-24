"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { previewChunks, estimateFileCount, countCharacters } from "@splitforge/core";
import type { SplitMode } from "@splitforge/core";

import { runExport, type ExportResult, type ExportProgress, type OverwriteMode } from "@/lib/exporter";
import { loadSettings, saveSettings } from "@/lib/storage";
import { isTauri, pickTextFile, pickFolder, readTextFile, openFolder } from "@/lib/tauri-bridge";

import Header from "@/components/Header";
import TextInputPanel from "@/components/TextInputPanel";
import SplitSettings from "@/components/SplitSettings";
import OutputFolderPicker from "@/components/OutputFolderPicker";
import PreviewPanel from "@/components/PreviewPanel";
import ExportSummary from "@/components/ExportSummary";
import ProgressModal from "@/components/ProgressModal";
import ToastContainer, { type ToastMessage } from "@/components/Toast";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface AppState {
  text: string;
  inputFileName: string | null;
  charLimit: number;
  splitMode: SplitMode;
  filePrefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
  overwriteMode: OverwriteMode;
  outputFolder: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let toastCounter = 0;
function makeToast(message: string, type: ToastMessage["type"]): ToastMessage {
  return { id: String(++toastCounter), message, type };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  // --- Core app state ---
  const [state, setState] = useState<AppState>(() => {
    const saved = loadSettings();
    return {
      text: "",
      inputFileName: null,
      charLimit: saved.charLimit,
      splitMode: saved.splitMode,
      filePrefix: saved.filePrefix,
      leadingZeros: saved.leadingZeros,
      createSubfolder: saved.createSubfolder,
      exportManifest: saved.exportManifest,
      overwriteMode: saved.overwriteMode,
      outputFolder: saved.lastOutputFolder,
    };
  });

  // --- Export state ---
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const cancelRef = useRef(false);

  // --- UI state ---
  const [isImporting, setIsImporting] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const charCount = countCharacters(state.text);
  const hasText = charCount > 0;
  const hasFolder = Boolean(state.outputFolder);
  const canExport = hasText && hasFolder && !isExporting && state.charLimit >= 1;

  const previewData = hasText && state.charLimit >= 1
    ? previewChunks(state.text, state.charLimit, state.splitMode, 3)
    : [];

  // ---------------------------------------------------------------------------
  // Settings persistence
  // ---------------------------------------------------------------------------

  useEffect(() => {
    saveSettings({
      charLimit: state.charLimit,
      splitMode: state.splitMode,
      filePrefix: state.filePrefix,
      leadingZeros: state.leadingZeros,
      createSubfolder: state.createSubfolder,
      exportManifest: state.exportManifest,
      overwriteMode: state.overwriteMode,
      darkMode: true,
      lastOutputFolder: state.outputFolder,
    });
  }, [state]);

  // ---------------------------------------------------------------------------
  // Toast helpers
  // ---------------------------------------------------------------------------

  const addToast = useCallback((message: string, type: ToastMessage["type"]) => {
    setToasts((prev) => [...prev, makeToast(message, type)]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleTextChange = useCallback((text: string) => {
    setState((s) => ({ ...s, text }));
    if (exportResult) setExportResult(null);
  }, [exportResult]);

  const handleImportFile = useCallback(async () => {
    if (!isTauri()) {
      addToast("File import is only available in the desktop app.", "info");
      return;
    }
    setIsImporting(true);
    try {
      const path = await pickTextFile();
      if (!path) return;
      const content = await readTextFile(path);
      const fileName = path.split(/[/\\]/).pop() ?? "file.txt";
      setState((s) => ({ ...s, text: content, inputFileName: fileName }));
      setExportResult(null);
      addToast(`Imported "${fileName}"`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to import file.", "error");
    } finally {
      setIsImporting(false);
    }
  }, [addToast]);

  const handlePickFolder = useCallback(async () => {
    if (!isTauri()) {
      addToast("Folder picker is only available in the desktop app.", "info");
      return;
    }
    setIsPicking(true);
    try {
      const folder = await pickFolder();
      if (folder) {
        setState((s) => ({ ...s, outputFolder: folder }));
        addToast("Output folder selected.", "success");
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to open folder picker.", "error");
    } finally {
      setIsPicking(false);
    }
  }, [addToast]);

  const handleExport = useCallback(async () => {
    if (!canExport || !state.outputFolder) return;

    setIsExporting(true);
    setExportProgress({ current: 0, total: 1, currentFile: "" });
    cancelRef.current = false;
    setExportResult(null);

    const totalFiles = Math.ceil(
      estimateFileCount(state.text, state.charLimit)
    );

    try {
      const result = await runExport(
        {
          text: state.text,
          charLimit: state.charLimit,
          mode: state.splitMode,
          outputFolder: state.outputFolder,
          prefix: state.filePrefix,
          leadingZeros: state.leadingZeros,
          createSubfolder: state.createSubfolder,
          exportManifest: state.exportManifest,
          overwriteMode: state.overwriteMode,
          originalFileName: state.inputFileName ?? undefined,
        },
        (progress) => {
          setExportProgress(progress);
          if (cancelRef.current) return false;
        }
      );

      setExportResult(result);
      if (result.success) {
        addToast(
          `Exported ${result.filesWritten} file${result.filesWritten !== 1 ? "s" : ""}.`,
          "success"
        );
      } else {
        addToast(`Export finished with ${result.filesFailed} error(s).`, "error");
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Export failed.", "error");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [canExport, state, addToast]);

  const handleCancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const handleOpenFolder = useCallback(async () => {
    const folder = exportResult?.outputFolder ?? state.outputFolder;
    if (!folder) return;
    if (!isTauri()) {
      addToast("Open folder is only available in the desktop app.", "info");
      return;
    }
    try {
      await openFolder(folder);
    } catch {
      addToast("Could not open folder.", "error");
    }
  }, [exportResult, state.outputFolder, addToast]);

  const handleReset = useCallback(() => {
    setState((s) => ({
      ...s,
      text: "",
      inputFileName: null,
    }));
    setExportResult(null);
  }, []);

  // Partial state updaters
  const set = <K extends keyof AppState>(key: K) =>
    (value: AppState[K]) => setState((s) => ({ ...s, [key]: value }));

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header onReset={handleReset} canReset={hasText || Boolean(exportResult)} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

          {/* ── Main two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* LEFT: Text input */}
            <div className="card p-5 flex flex-col gap-3 min-h-[420px]">
              <TextInputPanel
                text={state.text}
                charLimit={state.charLimit}
                onTextChange={handleTextChange}
                onImportFile={handleImportFile}
                isImporting={isImporting}
              />
            </div>

            {/* RIGHT: Settings + folder + action */}
            <div className="flex flex-col gap-4">

              {/* Settings card */}
              <div className="card p-5">
                <SplitSettings
                  charLimit={state.charLimit}
                  splitMode={state.splitMode}
                  filePrefix={state.filePrefix}
                  leadingZeros={state.leadingZeros}
                  createSubfolder={state.createSubfolder}
                  exportManifest={state.exportManifest}
                  overwriteMode={state.overwriteMode}
                  onCharLimitChange={set("charLimit")}
                  onSplitModeChange={set("splitMode")}
                  onFilePrefixChange={set("filePrefix")}
                  onLeadingZerosChange={set("leadingZeros")}
                  onCreateSubfolderChange={set("createSubfolder")}
                  onExportManifestChange={set("exportManifest")}
                  onOverwriteModeChange={set("overwriteMode")}
                />
              </div>

              {/* Output folder */}
              <div className="card p-5">
                <OutputFolderPicker
                  folder={state.outputFolder}
                  onPickFolder={handlePickFolder}
                  isPicking={isPicking}
                />
              </div>

              {/* Export action */}
              <button
                onClick={handleExport}
                disabled={!canExport}
                className="btn-primary w-full py-3 text-base"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Exporting…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3v10m-4-4 4 4 4-4M4 15h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Split &amp; Export
                  </>
                )}
              </button>

              {/* Validation hints */}
              {!hasText && (
                <p className="text-center text-xs text-gray-600">
                  Add text to begin
                </p>
              )}
              {hasText && !hasFolder && (
                <p className="text-center text-xs text-gray-600">
                  Choose an output folder to export
                </p>
              )}
            </div>
          </div>

          {/* ── Preview ── */}
          {previewData.length > 0 && (
            <div className="card overflow-hidden">
              <PreviewPanel
                chunks={previewData}
                charLimit={state.charLimit}
                isVisible={showPreview}
                onToggle={() => setShowPreview((v) => !v)}
              />
            </div>
          )}

          {/* ── Export result ── */}
          {exportResult && (
            <div className="card p-5">
              <ExportSummary
                result={exportResult}
                onOpenFolder={handleOpenFolder}
                onExportAgain={() => setExportResult(null)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Progress modal */}
      {isExporting && exportProgress && exportProgress.total > 0 && (
        <ProgressModal progress={exportProgress} onCancel={handleCancel} />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

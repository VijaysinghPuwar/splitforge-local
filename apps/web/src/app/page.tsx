"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { previewChunks } from "@/lib/splitter";
import type { SplitMode } from "@/lib/splitter";
import { countCharacters } from "@/lib/textCounter";
import { sanitizePrefix } from "@/lib/fileNaming";
import { splitInWorker, cancelWorker } from "@/lib/workerClient";
import { saveToFolder, downloadAsZip, type ExportResult, type ExportProgress } from "@/lib/exporter";
import { loadSettings, saveSettings, autosaveText, loadDraft } from "@/lib/storage";
import { canSaveToFolder } from "@/lib/capabilities";

import Header from "@/components/Header";
import TextInputPanel from "@/components/TextInputPanel";
import SplitSettings from "@/components/SplitSettings";
import ExportPanel from "@/components/ExportPanel";
import PreviewPanel from "@/components/PreviewPanel";
import ProgressModal from "@/components/ProgressModal";
import ToastContainer, { type ToastMsg } from "@/components/Toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Settings {
  charLimit: number;
  splitMode: SplitMode;
  filePrefix: string;
  leadingZeros: boolean;
  createSubfolder: boolean;
  exportManifest: boolean;
}

interface Progress {
  current: number;
  total: number;
  label: string;
  phase: "splitting" | "exporting";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _toastId = 0;
function toast(text: string, type: ToastMsg["type"]): ToastMsg {
  return { id: String(++_toastId), text, type };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function App() {
  // ── Text ──
  const [text, setText] = useState("");
  const [inputFileName, setInputFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // ── Settings ──
  const [settings, setSettings] = useState<Settings>(() => {
    const s = loadSettings();
    return {
      charLimit: s.charLimit,
      splitMode: s.splitMode,
      filePrefix: s.filePrefix,
      leadingZeros: s.leadingZeros,
      createSubfolder: s.createSubfolder,
      exportManifest: s.exportManifest,
    };
  });

  // ── Chunks (result of last split) ──
  const [chunks, setChunks] = useState<string[]>([]);
  const [totalChars, setTotalChars] = useState(0);

  // ── Export ──
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  // ── Progress ──
  const [progress, setProgress] = useState<Progress | null>(null);
  const cancelRef = useRef(false);

  // ── UI ──
  const [showPreview, setShowPreview] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------

  const charCount = countCharacters(text);
  const hasText = charCount > 0;
  const canExport = hasText && settings.charLimit >= 1;

  // Live preview (main thread, fast, first 3 chunks only)
  const previewData = hasText && settings.charLimit >= 1
    ? previewChunks(text, settings.charLimit, settings.splitMode, 3)
    : [];

  // ---------------------------------------------------------------------------
  // Hydration — restore saved draft + settings
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const draft = loadDraft();
    if (draft) setText(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    autosaveText(text);
  }, [text]);

  // ---------------------------------------------------------------------------
  // Toasts
  // ---------------------------------------------------------------------------

  const addToast = useCallback((text: string, type: ToastMsg["type"]) => {
    setToasts((p) => [...p, toast(text, type)]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // ---------------------------------------------------------------------------
  // Text import
  // ---------------------------------------------------------------------------

  const handleImportFile = useCallback(async () => {
    setIsImporting(true);
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: "Text files", accept: { "text/plain": [".txt"] } }],
        multiple: false,
      }).catch(() => [null]);

      if (!fileHandle) return;
      const file = await (fileHandle as FileSystemFileHandle).getFile();
      const content = await file.text();
      setText(content);
      setInputFileName(file.name);
      setExportResult(null);
      setChunks([]);
      addToast(`Imported "${file.name}"`, "success");
    } catch {
      // Fallback: <input type="file">
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,text/plain";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (typeof ev.target?.result === "string") {
            setText(ev.target.result);
            setInputFileName(file.name);
            setExportResult(null);
            setChunks([]);
            addToast(`Imported "${file.name}"`, "success");
          }
        };
        reader.readAsText(file, "utf-8");
      };
      input.click();
    } finally {
      setIsImporting(false);
    }
  }, [addToast]);

  // ---------------------------------------------------------------------------
  // Settings change
  // ---------------------------------------------------------------------------

  const handleSettingChange = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((s) => ({ ...s, [key]: value }));
      setExportResult(null);
      setChunks([]);
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Split (via Worker)
  // ---------------------------------------------------------------------------

  const runSplit = useCallback(async (): Promise<string[] | null> => {
    if (!hasText || settings.charLimit < 1) return null;

    cancelRef.current = false;
    setProgress({ current: 0, total: 0, label: "Splitting…", phase: "splitting" });

    try {
      const result = await splitInWorker(
        text,
        settings.charLimit,
        settings.splitMode,
        (p) => {
          if (cancelRef.current) cancelWorker();
          else setProgress({ current: p.current, total: p.total, label: "Splitting…", phase: "splitting" });
        }
      );

      if (cancelRef.current) {
        addToast("Cancelled.", "info");
        return null;
      }

      setChunks(result.chunks);
      setTotalChars(result.totalChars);
      return result.chunks;
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Split failed.", "error");
      return null;
    } finally {
      if (!cancelRef.current) setProgress(null);
    }
  }, [hasText, text, settings.charLimit, settings.splitMode, addToast]);

  // ---------------------------------------------------------------------------
  // Export — save to folder
  // ---------------------------------------------------------------------------

  const handleSaveToFolder = useCallback(async () => {
    if (!canSaveToFolder()) {
      addToast("Your browser doesn't support direct folder export. Use ZIP instead.", "info");
      return;
    }

    const splitChunks = await runSplit();
    if (!splitChunks) return;

    cancelRef.current = false;
    setProgress({ current: 0, total: splitChunks.length, label: "", phase: "exporting" });

    try {
      const result = await saveToFolder(
        splitChunks,
        {
          prefix: sanitizePrefix(settings.filePrefix),
          leadingZeros: settings.leadingZeros,
          createSubfolder: settings.createSubfolder,
          exportManifest: settings.exportManifest,
          originalFileName: inputFileName ?? undefined,
          mode: settings.splitMode,
          charLimit: settings.charLimit,
        },
        totalChars || countCharacters(text),
        (p) => setProgress({ current: p.current, total: p.total, label: p.file, phase: "exporting" })
      );

      setExportResult(result);
      addToast(
        result.filesFailed === 0
          ? `${result.filesWritten} file${result.filesWritten !== 1 ? "s" : ""} saved.`
          : `Done with ${result.filesFailed} error(s).`,
        result.filesFailed === 0 ? "success" : "error"
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      if (!msg.includes("user aborted")) addToast(msg, "error");
    } finally {
      setProgress(null);
    }
  }, [runSplit, settings, inputFileName, totalChars, text, addToast]);

  // ---------------------------------------------------------------------------
  // Export — download ZIP
  // ---------------------------------------------------------------------------

  const handleDownloadZip = useCallback(async () => {
    const splitChunks = await runSplit();
    if (!splitChunks) return;

    cancelRef.current = false;
    setProgress({ current: 0, total: splitChunks.length, label: "", phase: "exporting" });

    try {
      const result = await downloadAsZip(
        splitChunks,
        {
          prefix: sanitizePrefix(settings.filePrefix),
          leadingZeros: settings.leadingZeros,
          createSubfolder: settings.createSubfolder,
          exportManifest: settings.exportManifest,
          originalFileName: inputFileName ?? undefined,
          mode: settings.splitMode,
          charLimit: settings.charLimit,
        },
        totalChars || countCharacters(text),
        (p) => setProgress({ current: p.current, total: p.total, label: p.file, phase: "exporting" })
      );

      setExportResult(result);
      addToast(`ZIP downloaded — ${result.filesWritten} files.`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "ZIP failed.", "error");
    } finally {
      setProgress(null);
    }
  }, [runSplit, settings, inputFileName, totalChars, text, addToast]);

  // ---------------------------------------------------------------------------
  // Cancel / Reset
  // ---------------------------------------------------------------------------

  const handleCancel = useCallback(() => {
    cancelRef.current = true;
    cancelWorker();
    setProgress(null);
  }, []);

  const handleReset = useCallback(() => {
    setText("");
    setInputFileName(null);
    setChunks([]);
    setExportResult(null);
    setTotalChars(0);
  }, []);

  const handleTextChange = useCallback((t: string) => {
    setText(t);
    setExportResult(null);
    setChunks([]);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface">
      <Header onReset={handleReset} hasContent={hasText} />

      {/* Main scrollable area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">

          {/* ── Two-column main layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

            {/* LEFT: Input */}
            <div className="card p-5 flex flex-col" style={{ minHeight: "360px" }}>
              <TextInputPanel
                text={text}
                charLimit={settings.charLimit}
                inputFileName={inputFileName}
                onTextChange={handleTextChange}
                onImportFile={handleImportFile}
                isImporting={isImporting}
              />
            </div>

            {/* RIGHT: Settings + Export */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <SplitSettings
                  charLimit={settings.charLimit}
                  splitMode={settings.splitMode}
                  filePrefix={settings.filePrefix}
                  leadingZeros={settings.leadingZeros}
                  createSubfolder={settings.createSubfolder}
                  exportManifest={settings.exportManifest}
                  onChange={handleSettingChange}
                />
              </div>

              <div className="card p-5">
                <ExportPanel
                  canExport={canExport}
                  isExporting={Boolean(progress)}
                  result={exportResult}
                  onSaveToFolder={handleSaveToFolder}
                  onDownloadZip={handleDownloadZip}
                  onOpenResult={() => {/* folder result shown in panel */}}
                  onExportAgain={() => setExportResult(null)}
                />
              </div>
            </div>
          </div>

          {/* ── Preview ── */}
          {previewData.length > 0 && (
            <div className="card overflow-hidden">
              <PreviewPanel
                chunks={previewData}
                charLimit={settings.charLimit}
                isOpen={showPreview}
                onToggle={() => setShowPreview((v) => !v)}
              />
            </div>
          )}

        </div>
      </div>

      {/* Progress overlay */}
      {progress && (
        <ProgressModal
          current={progress.current}
          total={progress.total}
          label={progress.label}
          phase={progress.phase}
          onCancel={handleCancel}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

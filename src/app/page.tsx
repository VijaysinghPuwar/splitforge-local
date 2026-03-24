"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { countChars, previewChunks, type SplitMode } from "@/lib/splitter";
import { sanitizePrefix } from "@/lib/fileNaming";
import { splitInWorker, cancelWorker } from "@/lib/workerClient";
import { saveToFolder, downloadAsZip, type ExportResult } from "@/lib/exporter";
import { loadSettings, saveSettings, autosaveDraft, loadDraft, type StoredSettings } from "@/lib/storage";
import { canSaveToFolder } from "@/lib/capabilities";

import Header from "@/components/Header";
import TextInput from "@/components/TextInput";
import Settings from "@/components/Settings";
import ExportPanel from "@/components/ExportPanel";
import PreviewPanel from "@/components/PreviewPanel";
import ProgressModal from "@/components/ProgressModal";
import ToastContainer, { type ToastMsg } from "@/components/Toast";

interface Progress {
  current: number;
  total: number;
  label: string;
  phase: "splitting" | "exporting";
}

let _tid = 0;
function mkToast(text: string, type: ToastMsg["type"]): ToastMsg {
  return { id: String(++_tid), text, type };
}

export default function App() {
  const [text, setText] = useState("");
  const [inputFileName, setInputFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [settings, setSettings] = useState<StoredSettings>(() => loadSettings());
  const [chunks, setChunks] = useState<string[]>([]);
  const [totalChars, setTotalChars] = useState(0);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const cancelRef = useRef(false);

  // ── Derived ──
  const charCount = countChars(text);
  const hasText = charCount > 0;
  const canExport = hasText && settings.charLimit >= 1;
  const estimatedChunks = hasText && settings.charLimit >= 1 ? Math.ceil(charCount / settings.charLimit) : 0;
  const previewData = canExport ? previewChunks(text, settings.charLimit, settings.mode, 3) : [];

  // ── Hydrate ──
  useEffect(() => {
    const draft = loadDraft();
    if (draft) setText(draft);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist ──
  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { autosaveDraft(text); }, [text]);

  // ── Toasts ──
  const addToast = useCallback((text: string, type: ToastMsg["type"]) => {
    setToasts((p) => [...p, mkToast(text, type)]);
  }, []);
  const dismissToast = useCallback((id: string) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  // ── Import ──
  const handleImportFile = useCallback(async () => {
    setIsImporting(true);
    try {
      const [fh] = await (window as Window & typeof globalThis).showOpenFilePicker({
        types: [{ description: "Text files", accept: { "text/plain": [".txt"] } }],
        multiple: false,
      }).catch((): [null] => [null]);

      if (!fh) { setIsImporting(false); return; }
      const file = await (fh as FileSystemFileHandle).getFile();
      const content = await file.text();
      setText(content);
      setInputFileName(file.name);
      setExportResult(null);
      setChunks([]);
      addToast(`Imported "${file.name}"`, "success");
    } catch {
      // Fallback
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

  // ── Settings ──
  const handleSettingChange = useCallback(<K extends keyof StoredSettings>(key: K, value: StoredSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setExportResult(null);
    setChunks([]);
  }, []);

  // ── Split ──
  const runSplit = useCallback(async (): Promise<string[] | null> => {
    if (!canExport) return null;
    cancelRef.current = false;
    setProgress({ current: 0, total: 0, label: "Splitting…", phase: "splitting" });
    try {
      const result = await splitInWorker(text, settings.charLimit, settings.mode, (p) => {
        if (cancelRef.current) cancelWorker();
        else setProgress({ current: p.current, total: p.total, label: "Splitting…", phase: "splitting" });
      });
      if (cancelRef.current) { addToast("Cancelled.", "info"); return null; }
      setChunks(result.chunks);
      setTotalChars(result.totalChars);
      return result.chunks;
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Split failed.", "error");
      return null;
    } finally {
      if (!cancelRef.current) setProgress(null);
    }
  }, [canExport, text, settings.charLimit, settings.mode, addToast]);

  // ── Save to folder ──
  const handleSaveToFolder = useCallback(async () => {
    if (!canSaveToFolder()) {
      addToast("Your browser doesn't support direct folder export. Use ZIP.", "info");
      return;
    }
    const splitChunks = await runSplit();
    if (!splitChunks) return;
    cancelRef.current = false;
    setProgress({ current: 0, total: splitChunks.length, label: "", phase: "exporting" });
    try {
      const result = await saveToFolder(
        splitChunks,
        { prefix: sanitizePrefix(settings.prefix), leadingZeros: settings.leadingZeros, createSubfolder: settings.createSubfolder, exportManifest: settings.exportManifest, originalFileName: inputFileName ?? undefined, mode: settings.mode, charLimit: settings.charLimit },
        totalChars || charCount,
        (p) => setProgress({ current: p.current, total: p.total, label: p.file, phase: "exporting" })
      );
      setExportResult(result);
      addToast(result.filesFailed === 0 ? `${result.filesWritten} files saved.` : `Done with ${result.filesFailed} error(s).`, result.filesFailed === 0 ? "success" : "error");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      if (!msg.toLowerCase().includes("abort")) addToast(msg, "error");
    } finally {
      setProgress(null);
    }
  }, [runSplit, settings, inputFileName, totalChars, charCount, addToast]);

  // ── Download ZIP ──
  const handleDownloadZip = useCallback(async () => {
    const splitChunks = await runSplit();
    if (!splitChunks) return;
    cancelRef.current = false;
    setProgress({ current: 0, total: splitChunks.length, label: "", phase: "exporting" });
    try {
      const result = await downloadAsZip(
        splitChunks,
        { prefix: sanitizePrefix(settings.prefix), leadingZeros: settings.leadingZeros, createSubfolder: settings.createSubfolder, exportManifest: settings.exportManifest, originalFileName: inputFileName ?? undefined, mode: settings.mode, charLimit: settings.charLimit },
        totalChars || charCount,
        (p) => setProgress({ current: p.current, total: p.total, label: p.file, phase: "exporting" })
      );
      setExportResult(result);
      addToast(`ZIP downloaded — ${result.filesWritten} files.`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "ZIP failed.", "error");
    } finally {
      setProgress(null);
    }
  }, [runSplit, settings, inputFileName, totalChars, charCount, addToast]);

  // ── Cancel / Reset ──
  const handleCancel = useCallback(() => {
    cancelRef.current = true;
    cancelWorker();
    setProgress(null);
  }, []);

  const handleReset = useCallback(() => {
    setText(""); setInputFileName(null); setChunks([]); setExportResult(null); setTotalChars(0);
  }, []);

  const handleTextChange = useCallback((t: string) => {
    setText(t); setExportResult(null); setChunks([]);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0f1117" }}>
      <Header onReset={handleReset} hasContent={hasText} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

            {/* Left: Text input */}
            <div className="card p-5 flex flex-col" style={{ minHeight: 360 }}>
              <TextInput
                text={text}
                charCount={charCount}
                charLimit={settings.charLimit}
                estimatedChunks={estimatedChunks}
                inputFileName={inputFileName}
                onTextChange={handleTextChange}
                onImportFile={handleImportFile}
                isImporting={isImporting}
              />
            </div>

            {/* Right: Settings + Export */}
            <div className="flex flex-col gap-4">
              <div className="card p-5">
                <Settings
                  charLimit={settings.charLimit}
                  mode={settings.mode}
                  prefix={settings.prefix}
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
                  onExportAgain={() => setExportResult(null)}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
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

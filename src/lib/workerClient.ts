import type { SplitMode } from "./splitter";

export interface WorkerProgress {
  current: number;
  total: number;
}

export interface WorkerResult {
  chunks: string[];
  totalChars: number;
  durationMs: number;
}

let _worker: Worker | null = null;

export function splitInWorker(
  text: string,
  charLimit: number,
  mode: SplitMode,
  onProgress?: (p: WorkerProgress) => void
): Promise<WorkerResult> {
  if (_worker) {
    _worker.terminate();
    _worker = null;
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/splitter.worker.ts", import.meta.url));
    _worker = worker;

    worker.onmessage = (e) => {
      const msg = e.data as { type: string } & Record<string, unknown>;
      if (msg.type === "progress") {
        onProgress?.({ current: msg.current as number, total: msg.total as number });
      } else if (msg.type === "result") {
        _worker = null;
        worker.terminate();
        resolve({ chunks: msg.chunks as string[], totalChars: msg.totalChars as number, durationMs: msg.durationMs as number });
      } else if (msg.type === "error") {
        _worker = null;
        worker.terminate();
        reject(new Error(msg.message as string));
      }
    };

    worker.onerror = (err) => {
      _worker = null;
      worker.terminate();
      reject(new Error(err.message));
    };

    worker.postMessage({ text, charLimit, mode });
  });
}

export function cancelWorker(): void {
  if (_worker) {
    _worker.terminate();
    _worker = null;
  }
}

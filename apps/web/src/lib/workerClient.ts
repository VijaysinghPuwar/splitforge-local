/**
 * workerClient.ts
 *
 * Promise-based wrapper around the splitter Web Worker.
 * Creates the worker lazily, terminates it when done.
 *
 * All heavy text-splitting is offloaded to the worker so the main thread
 * stays responsive during large jobs.
 */

import type { SplitMode } from "./splitter";
import type { WorkerMessage } from "../workers/splitter.worker";

export interface WorkerSplitResult {
  chunks: string[];
  totalChars: number;
  durationMs: number;
}

export interface WorkerProgress {
  current: number;
  total: number;
}

let activeWorker: Worker | null = null;

/** Cancel and terminate any in-flight worker job. */
export function cancelWorker(): void {
  if (activeWorker) {
    activeWorker.terminate();
    activeWorker = null;
  }
}

/**
 * Split `text` in a Web Worker.
 *
 * @param text        Input text
 * @param charLimit   Characters per chunk
 * @param mode        "exact" or "smart"
 * @param onProgress  Called with progress updates during long jobs
 * @returns           Resolved chunks + metadata
 */
export function splitInWorker(
  text: string,
  charLimit: number,
  mode: SplitMode,
  onProgress?: (p: WorkerProgress) => void
): Promise<WorkerSplitResult> {
  // Cancel any previous job
  cancelWorker();

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/splitter.worker.ts", import.meta.url)
    );
    activeWorker = worker;

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;

      if (msg.type === "progress") {
        onProgress?.({ current: msg.current, total: msg.total });
        return;
      }

      // Terminate after receiving a terminal message
      worker.terminate();
      activeWorker = null;

      if (msg.type === "result") {
        resolve({ chunks: msg.chunks, totalChars: msg.totalChars, durationMs: msg.durationMs });
      } else {
        reject(new Error(msg.message));
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      activeWorker = null;
      reject(new Error(err.message ?? "Worker error"));
    };

    worker.postMessage({ text, charLimit, mode });
  });
}

/** True when a worker job is currently running. */
export function isWorkerRunning(): boolean {
  return activeWorker !== null;
}

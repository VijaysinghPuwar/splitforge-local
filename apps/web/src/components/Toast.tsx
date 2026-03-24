"use client";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";
export interface ToastMsg { id: string; text: string; type: ToastType }

const ICONS = { success: "✓", error: "✕", info: "ℹ" };
const STYLES: Record<ToastType, string> = {
  success: "bg-brand-600 border-brand-500/60",
  error:   "bg-red-900/90 border-red-700/60",
  info:    "bg-blue-900/90 border-blue-700/60",
};

function Toast({ msg, onDismiss }: { msg: ToastMsg; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <button
      onClick={onDismiss}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border text-sm font-medium
                  text-white shadow-lg animate-slide-in-right text-left ${STYLES[msg.type]}`}
    >
      <span className="shrink-0 font-bold">{ICONS[msg.type]}</span>
      <span className="flex-1 min-w-0">{msg.text}</span>
    </button>
  );
}

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMsg[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <Toast key={t.id} msg={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

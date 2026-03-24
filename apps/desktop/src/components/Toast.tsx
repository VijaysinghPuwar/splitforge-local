"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const styles: Record<ToastType, string> = {
  success: "bg-brand-600 border-brand-500 text-white",
  error: "bg-red-900/90 border-red-700 text-white",
  info: "bg-blue-900/90 border-blue-700 text-white",
};

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        text-sm font-medium animate-slide-in-right cursor-pointer
        ${styles[toast.type]}
      `}
      onClick={onDismiss}
    >
      <span className="text-base leading-none font-bold shrink-0">{icons[toast.type]}</span>
      <span className="flex-1 min-w-0">{toast.message}</span>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

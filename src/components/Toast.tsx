"use client";

import { useEffect } from "react";

export interface ToastMsg {
  id: string;
  text: string;
  type: "success" | "error" | "info";
}

const COLORS = {
  success: "border-success/30 bg-success/10 text-success",
  error: "border-error/30 bg-error/10 text-error",
  info: "border-border bg-surface text-text-secondary",
};

function Toast({ msg, onDismiss }: { msg: ToastMsg; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(msg.id), 4000);
    return () => clearTimeout(t);
  }, [msg.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm shadow-lg animate-slide-up ${COLORS[msg.type]}`}
    >
      <span className="flex-1">{msg.text}</span>
      <button onClick={() => onDismiss(msg.id)} className="opacity-50 hover:opacity-100 transition-opacity text-lg leading-none">&times;</button>
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: { toasts: ToastMsg[]; onDismiss: (id: string) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]">
      {toasts.map((t) => <Toast key={t.id} msg={t} onDismiss={onDismiss} />)}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

type Props = {
  message: string | null;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number;
};

const STYLES: Record<ToastType, string> = {
  success: "bg-emerald-900/90 border-emerald-700 text-emerald-200",
  error:   "bg-red-900/90 border-red-700 text-red-200",
  info:    "bg-indigo-900/90 border-indigo-700 text-indigo-200",
};

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  info:    "i",
};

export function Toast({ message, type = "success", onDismiss, duration = 3500 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={[
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border",
        "shadow-2xl max-w-sm text-sm font-medium",
        "transition-all duration-300",
        STYLES[type],
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
    >
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
        {ICONS[type]}
      </span>
      <span>{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="ml-2 opacity-70 hover:opacity-100 text-base leading-none"
      >
        ×
      </button>
    </div>
  );
}

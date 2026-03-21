"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MODES = [
  { key: "protect", label: "Protect" },
  { key: "recover", label: "Recover" },
  { key: "stabilize", label: "Stabilize" },
  { key: "perform", label: "Perform" },
] as const;

type TodayModeMenuProps = {
  value: string;
  onChange: (mode: string) => void;
  className?: string;
};

export function TodayModeMenu({ value, onChange, className }: TodayModeMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    MODES.find((m) => m.key === value.toLowerCase())?.label ??
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-teal-400/32 bg-teal-400/[0.09] px-3 text-xs font-medium text-teal-100/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] transition-colors hover:border-teal-400/45 hover:bg-teal-400/[0.12] focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/40"
      >
        <span className="text-teal-200/80">Today mode</span>
        <span className="font-semibold text-teal-50">{current}</span>
        <span className="text-teal-300/60" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-slate-700/60 bg-[#0c1220]/95 py-1 shadow-xl backdrop-blur-md"
        >
          {MODES.map((m) => (
            <li key={m.key} role="option" aria-selected={m.key === value.toLowerCase()}>
              <button
                type="button"
                className={cn(
                  "flex w-full px-3 py-2 text-left text-sm transition-colors",
                  m.key === value.toLowerCase()
                    ? "bg-teal-400/10 text-teal-100"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                )}
                onClick={() => {
                  onChange(m.key);
                  setOpen(false);
                }}
              >
                {m.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

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
        className="inline-flex h-9 items-center gap-2 rounded-2xl border border-[#45e0d4]/30 bg-[#45e0d4]/[0.09] px-3 text-xs font-medium text-[#edf2ff] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] transition-colors hover:border-[#45e0d4]/45 hover:bg-[#45e0d4]/[0.12] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/40"
      >
        <span className="text-[#98a4bf]">Today mode</span>
        <span className="font-semibold text-[#45e0d4]">{current}</span>
        <span className="text-[#7d89a6]" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-white/[0.08] bg-[#141f42]/98 py-1 shadow-xl backdrop-blur-md"
        >
          {MODES.map((m) => (
            <li key={m.key} role="option" aria-selected={m.key === value.toLowerCase()}>
              <button
                type="button"
                className={cn(
                  "flex w-full px-3 py-2 text-left text-sm transition-colors",
                  m.key === value.toLowerCase()
                    ? "bg-[#45e0d4]/12 text-[#45e0d4]"
                    : "text-[#98a4bf] hover:bg-white/[0.06] hover:text-[#edf2ff]",
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

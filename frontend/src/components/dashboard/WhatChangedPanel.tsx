"use client";

import type { WhatChangedEntry } from "@/lib/dashboard-types";
import { cn } from "@/lib/utils";

type WhatChangedPanelProps = {
  items: readonly WhatChangedEntry[];
  className?: string;
};

function sourceLabel(source: WhatChangedEntry["source"]): string {
  switch (source) {
    case "task":
      return "Task";
    case "recovery_sync":
      return "Recovery sync";
    case "check_in":
      return "Check-in";
    default:
      return "";
  }
}

export function WhatChangedPanel({ items, className }: WhatChangedPanelProps) {
  const recent = items.slice(-6);
  if (recent.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-700/40 bg-slate-900/35 px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
        className,
      )}
      aria-label="Recent changes"
    >
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        What changed
      </h3>
      <ul className="mt-2 space-y-3">
        {recent.map((entry) => (
          <li
            key={entry.id}
            className="flex gap-2 text-xs leading-relaxed text-slate-400"
          >
            <span
              className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-400/50"
              aria-hidden
            />
            <div className="min-w-0 space-y-0.5">
              <p className="text-slate-300/95">{entry.headline}</p>
              <p className="text-[11px] text-slate-500">{entry.reason}</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
                {sourceLabel(entry.source)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import { useEffect } from "react";
import type { EvidenceLensPanel } from "@/lib/evidence-lens";
import { IconClose } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";

type EvidenceLensSheetProps = {
  open: boolean;
  panel: EvidenceLensPanel;
  onClose: () => void;
};

export function EvidenceLensSheet({ open, panel, onClose }: EvidenceLensSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-stretch sm:justify-end sm:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-lens-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default sm:hidden"
        aria-label="Close"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative z-[1] flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0a1020] shadow-2xl sm:h-dvh sm:max-h-none sm:rounded-none sm:border-l sm:border-y-0 sm:border-r-0",
          "shadow-[0_24px_64px_-20px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-400/80">
              Evidence lens
            </p>
            <h2
              id="evidence-lens-title"
              className="mt-1 text-lg font-semibold tracking-tight text-white"
            >
              {panel.title}
            </h2>
            {panel.subtitle ? (
              <p className="mt-1 text-xs text-slate-500">{panel.subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/40"
            aria-label="Close evidence lens"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Why this recommendation exists
              </dt>
              <dd className="mt-1 leading-relaxed text-slate-300">{panel.why}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Schedule reason
              </dt>
              <dd className="mt-1 leading-relaxed text-slate-300">
                {panel.scheduleReason}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Evidence summary
              </dt>
              <dd className="mt-1 leading-relaxed text-slate-400">
                {panel.evidenceSummary}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Assumptions
              </dt>
              <dd className="mt-1 leading-relaxed text-slate-400">
                {panel.assumptions}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Confidence
              </dt>
              <dd className="mt-1 leading-relaxed text-slate-300">
                {panel.confidence}
              </dd>
            </div>
            {panel.preferenceNote ? (
              <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 px-3 py-3">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Your preferences
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-slate-400">
                  {panel.preferenceNote}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </aside>
    </div>
  );
}

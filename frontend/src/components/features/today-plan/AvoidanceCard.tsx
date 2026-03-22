"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { todayCardShell } from "./today-surfaces";

export type AvoidanceCardProps = {
  /** Icon inside the circular badge (typically 20–22px). */
  icon: ReactNode;
  /** Short, specific heading (informative tone). */
  title: string;
  /** Supporting explanation — calm, non-judgmental copy works best. */
  detail: string;
  className?: string;
  onEvidence?: () => void;
};

export function AvoidanceCard({
  icon,
  title,
  detail,
  className,
  onEvidence,
}: AvoidanceCardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full min-h-0 gap-4 overflow-hidden bg-gradient-to-br from-[#141f42] via-[#101c3c] to-[#0c1734]",
        "p-4 transition-[border-color,box-shadow] duration-200 md:gap-[1.125rem] md:p-5",
        todayCardShell,
        "hover:border-amber-500/22 hover:shadow-[0_28px_64px_-28px_rgba(0,0,0,0.88),inset_0_1px_0_0_rgba(255,255,255,0.06),0_0_36px_-18px_rgba(251,191,36,0.1)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-amber-400/35 via-amber-500/15 to-transparent opacity-90"
        aria-hidden
      />

      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/[0.11] text-amber-200/95 ring-1 ring-amber-400/28 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09)] md:h-11 md:w-11"
        aria-hidden
      >
        {icon}
      </div>

      <div className="relative min-w-0 flex-1 py-0.5 md:py-px">
        <h3 className="text-[13px] font-semibold leading-snug text-[#edf2ff] md:text-sm">
          {title}
        </h3>
        <p className="mt-2 text-[12px] leading-relaxed text-[#98a4bf] md:text-[13px] md:leading-relaxed">
          {detail}
        </p>
        {onEvidence ? (
          <button
            type="button"
            onClick={onEvidence}
            className="mt-2.5 text-[11px] font-medium text-[#86c9ff] underline-offset-4 hover:underline"
          >
            Evidence lens
          </button>
        ) : null}
      </div>
    </article>
  );
}

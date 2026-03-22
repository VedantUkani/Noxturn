"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { todayCardShell, todayInsetStrip } from "./today-surfaces";

export type RecoveryRecommendationCardProps = {
  /** Small icon shown in the top badge (e.g. Lucide-style SVG or `NavIcons`). */
  icon: ReactNode;
  /** Card heading, e.g. “Sleep Block”. */
  title: string;
  /** Primary time range or directive, e.g. “10:00 - 15:00”. */
  value: string;
  /** Supporting copy in the bottom inset strip. */
  note: string;
  className?: string;
};

export function RecoveryRecommendationCard({
  icon,
  title,
  value,
  note,
  className,
}: RecoveryRecommendationCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full min-h-[218px] flex-col overflow-hidden bg-gradient-to-b from-[#141f42] via-[#101c3c] to-[#0c1734] p-5 transition-[border-color,box-shadow] duration-200 md:min-h-[228px]",
        todayCardShell,
        "hover:border-white/[0.1] hover:shadow-[0_28px_72px_-32px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.07)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#45e0d4]/[0.06] blur-2xl transition-opacity duration-200 group-hover:opacity-100 opacity-80"
        aria-hidden
      />

      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0c2a3d] text-[#45e0d4] ring-1 ring-[#45e0d4]/22 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {icon}
      </div>

      <h3 className="relative mt-3.5 text-[13px] font-semibold tracking-tight text-[#edf2ff] md:mt-4">
        {title}
      </h3>
      <p className="relative mt-2 min-h-[2.625rem] text-[15px] font-semibold leading-snug tracking-tight text-[#edf2ff] md:text-base md:leading-snug">
        {value}
      </p>

      <div className="relative mt-auto pt-3.5 md:pt-4">
        <div className={cn("px-3 py-2.5 md:px-3.5 md:py-3", todayInsetStrip)}>
          <p className="text-[11px] leading-relaxed text-[#7d89a6] md:text-xs md:leading-relaxed">
            {note}
          </p>
        </div>
      </div>
    </article>
  );
}

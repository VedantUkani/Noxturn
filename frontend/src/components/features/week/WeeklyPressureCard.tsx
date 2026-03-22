"use client";

import { cn } from "@/lib/utils";

type WeeklyPressureCardProps = {
  index: number;
  categoryLabel: string;
  title: string;
  detail: string;
  className?: string;
};

/**
 * Calm “weekly pressure” tile — signal without alarm chrome (hackathon / judge friendly).
 */
export function WeeklyPressureCard({
  index,
  categoryLabel,
  title,
  detail,
  className,
}: WeeklyPressureCardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[22px] bg-gradient-to-br from-[#141f42] to-[#101c3c] p-5 ring-1 ring-white/[0.07] sm:p-6",
        "shadow-[0_14px_40px_-28px_rgba(0,0,0,0.85)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-[#45e0d4]/50 via-amber-400/25 to-transparent"
        aria-hidden
      />
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0c2a3d]/90 text-xs font-semibold tabular-nums text-[#45e0d4] ring-1 ring-[#45e0d4]/25"
          aria-hidden
        >
          {index}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d89a6]">
          {categoryLabel}
        </p>
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug text-[#edf2ff]">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#98a4bf]">
        {detail}
      </p>
    </article>
  );
}

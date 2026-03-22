"use client";

import { IconClose } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";

type WeekDangerCardProps = {
  /** Category line — small caps above the headline. */
  categoryLabel: string;
  title: string;
  detail: string;
  className?: string;
};

/**
 * Week “harm to avoid” tile — mirrors Today {@link AvoidanceCard} layout with
 * rose / X emphasis to match schedule-injury framing.
 */
export function WeekDangerCard({
  categoryLabel,
  title,
  detail,
  className,
}: WeekDangerCardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full min-h-0 gap-4 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#141f42] to-[#101c3c]",
        "p-5 transition-[box-shadow] duration-200 md:gap-5 md:p-6",
        "ring-1 ring-white/[0.07]",
        "hover:ring-rose-500/20",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-rose-500/40 via-rose-500/18 to-transparent opacity-90"
        aria-hidden
      />

      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600/25 text-rose-50 ring-1 ring-rose-500/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] md:h-11 md:w-11"
        aria-hidden
      >
        <IconClose className="h-[18px] w-[18px]" />
      </div>

      <div className="relative min-w-0 flex-1 py-0.5 md:py-px">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-300/70">
          {categoryLabel}
        </p>
        <h3 className="mt-1 text-[13px] font-semibold leading-snug text-[#edf2ff] md:text-sm">
          {title}
        </h3>
        <p className="mt-2 text-[12px] leading-relaxed text-[#98a4bf] md:text-[13px] md:leading-relaxed">
          {detail}
        </p>
      </div>
    </article>
  );
}

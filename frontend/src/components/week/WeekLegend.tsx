"use client";

import { cn } from "@/lib/utils";

const ITEMS: { swatch: string; label: string; hint?: string }[] = [
  {
    swatch:
      "border border-[#45e0d4]/30 bg-gradient-to-r from-[#0c2a3d]/90 to-[#0c2a3d]/60",
    label: "Daytime / evening work",
  },
  {
    swatch: "border border-indigo-400/35 bg-indigo-950/55",
    label: "Night work",
  },
  {
    swatch: "border border-violet-400/35 bg-violet-950/50",
    label: "Other fixed time",
    hint: "Class, lab, etc.",
  },
  {
    swatch:
      "border border-amber-400/40 bg-gradient-to-b from-amber-500/20 to-rose-500/15",
    label: "Pressure",
    hint: "Warmer = more circadian load",
  },
];

type WeekLegendProps = {
  className?: string;
  /** Visually de-emphasize extended hints on small screens. */
  id?: string;
};

export function WeekLegend({ className, id }: WeekLegendProps) {
  return (
    <div
      id={id}
      className={cn(
        "flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3",
        className,
      )}
    >
      {ITEMS.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 items-start gap-3 text-[12px] text-[#98a4bf] sm:max-w-[220px]"
        >
          <span
            className={cn(
              "mt-0.5 h-3 w-8 shrink-0 rounded-sm shadow-sm",
              item.swatch,
            )}
            aria-hidden
          />
          <span>
            <span className="font-medium text-[#edf2ff]">{item.label}</span>
            {item.hint ? (
              <span className="mt-0.5 hidden text-[11px] leading-snug text-[#7d89a6] sm:block">
                {item.hint}
              </span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}

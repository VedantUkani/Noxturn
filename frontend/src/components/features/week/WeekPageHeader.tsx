"use client";

import { cn } from "@/lib/utils";

type WeekPageHeaderProps = {
  className?: string;
};

export function WeekPageHeader({ className }: WeekPageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d89a6]">
        Week view
      </p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#edf2ff] sm:text-[1.65rem] sm:leading-snug">
          Circadian injury map
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-[#98a4bf]">
          Where your rota hits hardest — then use{" "}
          <span className="font-medium text-[#edf2ff]">Today</span> for what to do
          next.
        </p>
      </div>
    </header>
  );
}

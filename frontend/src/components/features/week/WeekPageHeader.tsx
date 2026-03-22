"use client";

import { cn } from "@/lib/utils";

type WeekPageHeaderProps = {
  className?: string;
};

export function WeekPageHeader({ className }: WeekPageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7d89a6]">
        This week
      </p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-[#edf2ff] sm:text-[1.65rem] sm:leading-snug">
          Circadian injury map
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-[#98a4bf]">
          See where your rota stresses recovery — then open{" "}
          <span className="font-medium text-[#edf2ff]">Today</span> for the next
          protective step.
        </p>
      </div>
    </header>
  );
}

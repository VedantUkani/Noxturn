"use client";

import { cn } from "@/lib/utils";

type RecoveryWindowCardProps = {
  line: string;
  className?: string;
};

export function RecoveryWindowCard({ line, className }: RecoveryWindowCardProps) {
  return (
    <section
      aria-labelledby="week-recovery-title"
      className={cn(
        "rounded-[22px] border border-[#45e0d4]/15 bg-[#0c2a3d]/35 p-5 ring-1 ring-white/[0.05] sm:p-6",
        className,
      )}
    >
      <h2
        id="week-recovery-title"
        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#45e0d4]/90"
      >
        What to protect
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#98a4bf]">
        {line}
      </p>
    </section>
  );
}

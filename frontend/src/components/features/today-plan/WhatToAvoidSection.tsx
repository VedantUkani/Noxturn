import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { todayCardShell } from "./today-surfaces";

export type WhatToAvoidSectionProps = {
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Full-width framed section: warning-style header + inner content (e.g. a grid of AvoidanceCards).
 * Spacing aligns with other Today blocks via the parent `space-y-*` stack.
 */
export function WhatToAvoidSection({
  title,
  titleIcon,
  children,
  className,
}: WhatToAvoidSectionProps) {
  return (
    <section
      className={cn("w-full", className)}
      aria-labelledby="today-what-to-avoid-title"
    >
      <div
        className={cn(
          "overflow-hidden bg-gradient-to-b from-slate-800/48 via-slate-900/42 to-[#0a1020]/96",
          todayCardShell,
        )}
      >
        <div className="border-b border-white/[0.065] bg-slate-950/25 px-5 py-4 md:px-6 md:py-[1.125rem]">
          <div className="flex items-center gap-3">
            {titleIcon ? (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/[0.12] text-amber-300 ring-1 ring-amber-400/26 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                aria-hidden
              >
                {titleIcon}
              </span>
            ) : null}
            <h2
              id="today-what-to-avoid-title"
              className="text-[0.9375rem] font-semibold tracking-tight text-white md:text-base"
            >
              {title}
            </h2>
          </div>
        </div>

        <div className="p-5 md:p-6 md:pt-5">{children}</div>
      </div>
    </section>
  );
}

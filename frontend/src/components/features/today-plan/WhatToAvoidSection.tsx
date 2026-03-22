import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { todayCardShell } from "./today-surfaces";

export type WhatToAvoidSectionProps = {
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  className?: string;
  /** `amber` = Today avoidance default; `rose` = week / schedule harm emphasis. */
  tone?: "amber" | "rose";
  /** Override heading id for a11y when multiple sections exist on the app. */
  titleId?: string;
  /** Class for the padded body below the header (spacing tweaks per page). */
  contentClassName?: string;
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
  tone = "amber",
  titleId = "today-what-to-avoid-title",
  contentClassName,
}: WhatToAvoidSectionProps) {
  const iconWrap =
    tone === "rose"
      ? "bg-rose-500/[0.14] text-rose-100 ring-rose-400/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
      : "bg-amber-500/[0.12] text-amber-300 ring-amber-400/26 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]";

  return (
    <section className={cn("w-full", className)} aria-labelledby={titleId}>
      <div
        className={cn(
          "overflow-hidden bg-gradient-to-b from-[#141f42] via-[#101c3c] to-[#0c1734]",
          todayCardShell,
        )}
      >
        <div className="border-b border-white/[0.065] bg-[#101c3c]/80 px-5 py-4 md:px-6 md:py-[1.125rem]">
          <div className="flex items-center gap-3">
            {titleIcon ? (
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1",
                  iconWrap,
                )}
                aria-hidden
              >
                {titleIcon}
              </span>
            ) : null}
            <h2
              id={titleId}
              className="text-[0.9375rem] font-semibold tracking-tight text-[#edf2ff] md:text-base"
            >
              {title}
            </h2>
          </div>
        </div>

        <div
          className={cn("p-5 md:p-6 md:pt-5", contentClassName)}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

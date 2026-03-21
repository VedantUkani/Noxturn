"use client";

import { useEffect, useState } from "react";
import { DEMO_PLAN_MODE_LABEL } from "@/lib/constants";
import { getStoredPlanMode } from "@/lib/session";
import { cn } from "@/lib/utils";

function formatModeLabel(raw: string | null): string {
  if (!raw) return DEMO_PLAN_MODE_LABEL;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

type TodayModePillProps = {
  className?: string;
  /** Short label for very narrow screens */
  compact?: boolean;
};

export function TodayModePill({ className, compact }: TodayModePillProps) {
  const [label, setLabel] = useState<string>(() =>
    formatModeLabel(
      typeof window !== "undefined" ? getStoredPlanMode() : null,
    ),
  );

  useEffect(() => {
    const sync = () => setLabel(formatModeLabel(getStoredPlanMode()));
    sync();
    window.addEventListener("noxturn-plan-mode", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("noxturn-plan-mode", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <span
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-teal-400/32 bg-teal-400/[0.09] px-3 text-xs font-medium text-teal-100/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]",
        compact && "h-8 px-2.5 text-[11px]",
        className,
      )}
    >
      {compact ? (
        label
      ) : (
        <>
          <span className="text-teal-200/80">Today mode:</span>
          <span className="ml-1 font-semibold text-teal-100">{label}</span>
        </>
      )}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasCompletedOnboarding } from "@/lib/onboarding-flag";
import { cn } from "@/lib/utils";

/**
 * Bottom escape hatch: welcome (first-run) or app home (/today) once onboarding is done.
 */
export function ScheduleFooterBack() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toAppHome = mounted && hasCompletedOnboarding();
  const href = toAppHome ? "/today" : "/onboarding";
  const label = toAppHome ? "Home" : "Back";

  return (
    <div className="flex justify-center border-t border-slate-800/80 pt-6">
      {!mounted ? (
        <div className="h-11 w-40 rounded-xl bg-slate-900/20" aria-hidden />
      ) : (
        <Link
          href={href}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-600/90 bg-slate-900/45 px-8 text-sm font-medium text-slate-200 transition-colors",
            "hover:border-slate-500 hover:bg-slate-800/60 hover:text-white",
            "focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/45",
          )}
        >
          <span aria-hidden className="text-base leading-none text-slate-400">
            ←
          </span>
          {label}
        </Link>
      )}
    </div>
  );
}

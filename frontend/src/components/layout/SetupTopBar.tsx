"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccessibilityMenu } from "@/components/accessibility";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { markOnboardingComplete } from "@/lib/onboarding-flag";

/**
 * Setup routes: brand goes to the main app. Larger wordmark reads as the real
 * entry point; tagline stays subtle.
 */
export function SetupTopBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800/80 bg-[#0f172a]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <span className="w-10 shrink-0 sm:w-11" aria-hidden />
        <Link
          href="/onboarding"
          onClick={() => {
            if (pathname === "/schedule") markOnboardingComplete();
          }}
          className="group flex min-w-0 flex-1 flex-col items-center gap-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]"
        >
          <span className="text-[1.75rem] font-bold leading-none tracking-tight text-white transition-[color,filter] duration-200 group-hover:text-teal-50 sm:text-[2rem] md:text-[2.25rem]">
            {APP_NAME}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-400/90 sm:text-[11px]">
            {APP_TAGLINE}
          </span>
        </Link>
        <div className="flex shrink-0 justify-end">
          <AccessibilityMenu variant="compact" />
        </div>
      </div>
    </header>
  );
}

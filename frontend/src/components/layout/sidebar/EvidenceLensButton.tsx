"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dispatchOpenEvidenceLensOverview } from "@/lib/evidence-lens-events";

type EvidenceLensButtonProps = {
  onNavigate?: () => void;
};

const lensShellClass =
  "flex h-10 w-full items-center justify-center rounded-full px-4 text-[13px] font-semibold tracking-tight transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300/80";

export function EvidenceLensButton({ onNavigate }: EvidenceLensButtonProps) {
  const pathname = usePathname();
  const active = pathname === "/evidence";
  const openSheetFirst = pathname === "/today" || pathname === "/dashboard";

  if (openSheetFirst) {
    return (
      <button
        type="button"
        onClick={() => {
          dispatchOpenEvidenceLensOverview();
          onNavigate?.();
        }}
        className={cn(
          lensShellClass,
          "border border-teal-400/35 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-[0_8px_28px_-10px_rgba(45,212,191,0.55)] hover:from-teal-300 hover:to-cyan-300 hover:shadow-[0_10px_32px_-8px_rgba(45,212,191,0.5)]",
        )}
      >
        Evidence Lens
      </button>
    );
  }

  return (
    <Link
      href="/evidence"
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        lensShellClass,
        active
          ? "border border-teal-400/45 bg-teal-400/12 text-teal-100 shadow-[0_0_24px_-10px_rgba(45,212,191,0.4)]"
          : "border border-teal-400/35 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 shadow-[0_8px_28px_-10px_rgba(45,212,191,0.55)] hover:from-teal-300 hover:to-cyan-300 hover:shadow-[0_10px_32px_-8px_rgba(45,212,191,0.5)]",
      )}
    >
      Evidence Lens
    </Link>
  );
}

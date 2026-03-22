"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";
import { dispatchOpenEvidenceLensOverview } from "@/lib/evidence-lens-events";

type EvidenceLensButtonProps = {
  onNavigate?: () => void;
};

const lensShellClass = cn(
  "flex h-10 w-full items-center justify-center rounded-2xl px-4 text-[13px] font-bold tracking-tight transition-colors duration-200",
  nx.focusRing,
);

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
          "border border-[#45e0d4]/30 bg-[#45e0d4] text-[#04112d] shadow-[0_8px_28px_-12px_rgba(69,224,212,0.55)] hover:brightness-105",
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
          ? "border border-[#45e0d4]/35 bg-[#0c1f3d] text-[#45e0d4] shadow-[inset_0_0_0_1px_rgba(69,224,212,0.15)]"
          : "border border-[#45e0d4]/30 bg-[#45e0d4] text-[#04112d] shadow-[0_8px_28px_-12px_rgba(69,224,212,0.55)] hover:brightness-105",
      )}
    >
      Evidence Lens
    </Link>
  );
}

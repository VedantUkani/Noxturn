"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  href: string;
  label: string;
  description: string;
  active: boolean;
  Icon: ComponentType<{ className?: string }>;
  onNavigate?: () => void;
};

export function SidebarNavItem({
  href,
  label,
  description,
  active,
  Icon,
  onNavigate,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      title={description}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-full px-3 py-2 text-[13px] font-medium transition-all duration-200",
        active
          ? "border border-teal-400/50 bg-gradient-to-r from-teal-500/25 via-cyan-500/15 to-teal-600/10 text-teal-50 shadow-[0_0_0_1px_rgba(45,212,191,0.2),0_10px_36px_-14px_rgba(34,211,238,0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)]"
          : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-cyan-200" : "text-slate-500 group-hover:text-slate-400",
        )}
      />
      {label}
    </Link>
  );
}

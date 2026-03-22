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
        "group relative flex items-center gap-3 px-3.5 py-2.5 text-[15px] font-medium transition-colors",
        active
          ? "bg-[#0c1f3d] text-[#45e0d4] shadow-[inset_0_0_0_1px_rgba(69,224,212,0.12)]"
          : "text-[#98a4bf] hover:bg-white/[0.04] hover:text-[#edf2ff]",
        "rounded-2xl",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          active ? "text-[#45e0d4]" : "text-[#7d89a6] group-hover:text-[#98a4bf]",
        )}
      />
      {label}
    </Link>
  );
}

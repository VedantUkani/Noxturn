"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCog } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";

const iconBtnClass =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#98a4bf] transition-colors duration-200 ease-out hover:bg-white/[0.06] hover:text-[#edf2ff] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45";

/** Cog control: navigates to full Workspace & recovery settings (no dropdown). */
export function SettingsMenu() {
  const pathname = usePathname();
  const onSettings =
    pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <Link
      href="/settings"
      aria-label="Settings"
      title="Workspace & recovery"
      aria-current={onSettings ? "page" : undefined}
      className={cn(iconBtnClass, onSettings && "bg-white/[0.08] text-[#45e0d4]")}
    >
      <IconCog className="h-[18px] w-[18px]" />
    </Link>
  );
}

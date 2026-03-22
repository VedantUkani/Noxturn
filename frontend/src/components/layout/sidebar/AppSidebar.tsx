"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { DASHBOARD_NAV } from "@/lib/navigation";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import {
  IconCalendar,
  IconClipboardList,
  IconClock,
  IconFlask,
  IconPulse,
} from "@/components/icons/NavIcons";
import type { DashboardNavHref } from "@/lib/navigation";
import { SidebarNavItem } from "./SidebarNavItem";
import { UserMiniProfileCard } from "./UserMiniProfileCard";

const navIcon: Record<
  DashboardNavHref,
  ComponentType<{ className?: string }>
> = {
  "/week": IconCalendar,
  "/schedule": IconClipboardList,
  "/today": IconClock,
  "/recovery": IconPulse,
  "/sandbox": IconFlask,
};

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden px-5 pb-6 pt-7">
      <div className="shrink-0 overflow-hidden">
        <div className="px-0.5">
          <Link
            href="/onboarding"
            onClick={onNavigate}
            className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#45e0d4]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08142f]"
          >
            <span className="text-[1.05rem] font-bold tracking-tight text-[#edf2ff]">
              {APP_NAME}
            </span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#45e0d4] transition-colors group-hover:text-[#45e0d4]/90">
              {APP_TAGLINE}
            </span>
          </Link>
        </div>

        <nav
          aria-label="Primary"
          className="mt-8 flex flex-col gap-1.5"
        >
          {DASHBOARD_NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = navIcon[item.href];
            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                description={item.description}
                active={active}
                Icon={Icon}
                onNavigate={onNavigate}
              />
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-white/[0.06] bg-transparent pt-4">
        <div className="flex flex-col gap-2.5">
          <UserMiniProfileCard />
        </div>
      </div>
    </div>
  );
}

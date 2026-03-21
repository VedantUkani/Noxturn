"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV } from "@/lib/navigation";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import {
  IconCalendar,
  IconClock,
  IconFlask,
  IconPulse,
} from "@/components/icons/NavIcons";
import { SidebarNavItem } from "./SidebarNavItem";
import { UserMiniProfileCard } from "./UserMiniProfileCard";
import { EvidenceLensButton } from "./EvidenceLensButton";

const navIcon = {
  "/week": IconCalendar,
  "/today": IconClock,
  "/recovery": IconPulse,
  "/sandbox": IconFlask,
} as const;

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col justify-between overflow-hidden px-4 py-4 lg:py-5">
      <div className="shrink-0 overflow-hidden">
        <div className="px-0.5">
          <Link
            href="/today"
            onClick={onNavigate}
            className="group block rounded-xl outline-none ring-teal-400/50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d18]"
          >
            <span className="text-[1.05rem] font-semibold tracking-tight text-white drop-shadow-[0_1px_12px_rgba(45,212,191,0.12)]">
              {APP_NAME}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 transition-colors group-hover:text-slate-400">
              {APP_TAGLINE}
            </span>
          </Link>
        </div>

        <nav
          aria-label="Primary"
          className="mt-6 flex flex-col gap-1 lg:mt-7"
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

      <div className="shrink-0 border-t border-white/[0.06] bg-[#080d18]/95 pt-4">
        <div className="flex flex-col gap-2.5">
          <UserMiniProfileCard />
          <EvidenceLensButton onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

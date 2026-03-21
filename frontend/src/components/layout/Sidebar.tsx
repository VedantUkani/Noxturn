"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useA11y } from "@/contexts/AccessibilityContext";
import {
  IconHome, IconCalendar, IconFlask, IconSettings, IconActivity,
} from "@/components/icons";

type NavItem = {
  href:  string;
  labelKey: "home" | "onboard" | "dashboard" | "sandbox" | "settings";
  Icon:  React.ComponentType<{ size?: number; className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/",          labelKey: "home",      Icon: IconHome     },
  { href: "/onboard",   labelKey: "onboard",   Icon: IconCalendar },
  { href: "/dashboard", labelKey: "dashboard", Icon: IconActivity },
  { href: "/sandbox",   labelKey: "sandbox",   Icon: IconFlask    },
  { href: "/settings",  labelKey: "settings",  Icon: IconSettings },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const { t } = useA11y();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        role="navigation"
        aria-label={t("nav", "home")}
        className={[
          "fixed top-0 left-0 h-full z-40 flex flex-col",
          "w-60 bg-slate-950 border-r border-slate-800",
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div
            className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-none">Noxturn</p>
            <p className="text-xs text-slate-500 mt-0.5">Circadian Planner</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, labelKey, Icon }) => {
            const label  = t("nav", labelKey);
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-700/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent",
                ].join(" ")}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user strip */}
        <div className="px-3 pb-5 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div
              className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="text-xs text-slate-300 font-semibold">U</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">Shift Worker</p>
              <p className="text-xs text-slate-600 truncate">Local session</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

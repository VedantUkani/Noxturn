"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { IconClose, IconMenu } from "@/components/icons/NavIcons";
import { APP_NAME } from "@/lib/constants";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobile = () => setMobileNavOpen(false);

  return (
    <div className="relative flex min-h-dvh bg-[#070b14] text-slate-100">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 max-w-[256px] flex-col overflow-hidden border-r border-white/[0.07] bg-gradient-to-b from-[#0b1222] via-[#080d18] to-[#05080f] shadow-[inset_-1px_0_0_rgba(255,255,255,0.05),8px_0_48px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl transition-transform duration-200 ease-out ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-end border-b border-white/[0.06] bg-[#080d18]/90 px-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/60"
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AppSidebar onNavigate={closeMobile} />
        </div>
      </aside>

      <div className="relative flex min-w-0 min-h-dvh flex-1 flex-col lg:h-dvh lg:min-h-0 lg:pl-64 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.07),transparent_50%)] before:content-['']">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/60"
            aria-expanded={mobileNavOpen}
            aria-controls="dashboard-sidebar"
            aria-label="Open navigation menu"
          >
            <IconMenu />
          </button>
          <span className="font-semibold tracking-tight text-white">{APP_NAME}</span>
        </div>

        <div className="shrink-0">
          <DashboardTopBar />
        </div>

        <main className="relative z-[1] mx-auto w-full max-w-7xl min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}

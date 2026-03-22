"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { IconClose, IconMenu } from "@/components/icons/NavIcons";
import { APP_NAME } from "@/lib/constants";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobile = () => setMobileNavOpen(false);

  return (
    <div className={cn("relative flex min-h-dvh", nx.page)}>
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className={cn(
            "fixed inset-0 z-40 lg:hidden",
            nx.overlay,
          )}
          onClick={closeMobile}
        />
      ) : null}

      <aside
        id="dashboard-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh flex-col overflow-hidden transition-transform duration-200 ease-out",
          nx.sidebarWidthClass,
          nx.sidebar,
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-end border-b border-white/[0.06] bg-[#08142f] px-3 lg:hidden">
          <button
            type="button"
            onClick={closeMobile}
            className={cn(
              "rounded-lg p-2 text-[#98a4bf] hover:bg-white/[0.06] hover:text-[#edf2ff]",
              nx.focusRing,
            )}
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AppSidebar onNavigate={closeMobile} />
        </div>
      </aside>

      <div
        className={cn(
          "relative flex min-h-dvh min-w-0 flex-1 flex-col lg:h-dvh lg:min-h-0 lg:pl-[260px]",
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className={cn(
              "rounded-lg p-2 text-[#edf2ff] hover:bg-white/[0.06]",
              nx.focusRing,
            )}
            aria-expanded={mobileNavOpen}
            aria-controls="dashboard-sidebar"
            aria-label="Open navigation menu"
          >
            <IconMenu />
          </button>
          <span className="font-semibold tracking-tight text-[#edf2ff]">
            {APP_NAME}
          </span>
        </div>

        <div className="shrink-0">
          <DashboardTopBar />
        </div>

        <main
          className={cn(
            "relative z-[1] min-h-0 flex-1 overflow-y-auto",
            nx.mainPad,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

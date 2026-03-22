"use client";

import { usePathname } from "next/navigation";
import { dashboardPageHeading } from "@/lib/navigation";
import { TopUtilityBar } from "@/components/layout/top-bar";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";

export function DashboardTopBar() {
  const pathname = usePathname();
  const title = dashboardPageHeading(pathname);
  const isToday = pathname === "/today" || pathname === "/dashboard";

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-[#04112d]/92 backdrop-blur-md",
        nx.mainGutter,
        isToday ? "justify-end" : "justify-between",
      )}
    >
      {!isToday ? (
        <h1 className="min-w-0 truncate text-sm font-semibold text-[#edf2ff] md:text-[0.9375rem]">
          {title}
        </h1>
      ) : null}
      <TopUtilityBar showModePill={!isToday} />
    </header>
  );
}

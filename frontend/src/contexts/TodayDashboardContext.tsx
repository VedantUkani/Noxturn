"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTodayDashboard } from "@/hooks/useTodayDashboard";
import type { TodayDashboardPayload } from "@/lib/dashboard-types";
import type { TodayDashboardState } from "@/hooks/useTodayDashboard";

const Ctx = createContext<TodayDashboardState | null>(null);

type TodayDashboardProviderProps = {
  initial: TodayDashboardPayload;
  children: ReactNode;
};

export function TodayDashboardProvider({
  initial,
  children,
}: TodayDashboardProviderProps) {
  const value = useTodayDashboard(initial);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTodayDashboardContext(): TodayDashboardState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useTodayDashboardContext must be used within TodayDashboardProvider",
    );
  }
  return ctx;
}

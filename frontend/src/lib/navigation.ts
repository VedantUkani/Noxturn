export type DashboardNavHref =
  | "/week"
  | "/schedule"
  | "/today"
  | "/recovery";

export type DashboardNavItem = {
  href: DashboardNavHref;
  label: string;
  /** Shown on larger screens or for accessibility context */
  description: string;
};

/** Primary shell navigation — order is intentional (horizon → now → recovery → roster). */
export const DASHBOARD_NAV: readonly DashboardNavItem[] = [
  {
    href: "/week",
    label: "Week",
    description: "Circadian injury map for your rota horizon.",
  },
  {
    href: "/today",
    label: "Today",
    description: "Next best actions and anchor tasks for this shift window.",
  },
  {
    href: "/recovery",
    label: "Recovery",
    description: "Rhythm and rest signals without streak pressure.",
  },
  {
    href: "/schedule",
    label: "Roster & schedule",
    description: "Shifts, calendar import, and uploads.",
  },
] as const;

/** Short label for the dashboard top bar (not the same as nav label). */
export function dashboardPageHeading(pathname: string): string {
  const map: Record<string, string> = {
    "/week": "Circadian injury map",
    "/schedule": "Roster & schedule",
    "/today": "Today",
    "/dashboard": "Today",
    "/recovery": "Recovery",
    "/settings": "Settings",
    "/onboarding": "Welcome",
    "/onboard": "Onboarding",
  };
  return map[pathname] ?? "Noxturn";
}

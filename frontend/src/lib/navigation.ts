export type DashboardNavHref = "/week" | "/today" | "/recovery" | "/sandbox";

export type DashboardNavItem = {
  href: DashboardNavHref;
  label: string;
  /** Shown on larger screens or for accessibility context */
  description: string;
};

/** Primary shell navigation — order is intentional (scan: horizon → now → recovery → simulate). */
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
    href: "/sandbox",
    label: "Sandbox",
    description: "What-if shifts before you commit to a swap.",
  },
] as const;

/** Short label for the dashboard top bar (not the same as nav label). */
export function dashboardPageHeading(pathname: string): string {
  const map: Record<string, string> = {
    "/week": "Circadian injury map",
    "/today": "Today",
    "/dashboard": "Today",
    "/recovery": "Recovery",
    "/sandbox": "Sandbox",
    "/settings": "Settings",
    "/onboarding": "Welcome",
    "/onboard": "Onboarding",
  };
  return map[pathname] ?? "Noxturn";
}

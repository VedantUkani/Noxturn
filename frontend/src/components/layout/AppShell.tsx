import { DashboardChrome } from "./DashboardChrome";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <DashboardChrome>{children}</DashboardChrome>;
}

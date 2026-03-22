"use client";

import type { ReactNode } from "react";
import { AccessibilityPreferencesProvider } from "@/components/accessibility";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <AccessibilityPreferencesProvider>{children}</AccessibilityPreferencesProvider>
  );
}

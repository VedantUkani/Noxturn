"use client";

import type { ReactNode } from "react";
import { AccessibilityPreferencesProvider } from "@/components/accessibility";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AccessibilityPreferencesProvider>{children}</AccessibilityPreferencesProvider>
    </GoogleOAuthProvider>
  );
}

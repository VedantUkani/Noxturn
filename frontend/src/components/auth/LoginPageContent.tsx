"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { AccessibilityMenu } from "@/components/accessibility";
import { NOXTURN_COLORS } from "@/lib/ui-theme";
import { LoginBranding } from "./login/LoginBranding";
import { LoginSignInCard } from "./login/LoginSignInCard";

export function LoginPageContent() {
  const searchParams = useSearchParams();

  const postLoginDestination = useMemo(() => {
    const dest = searchParams.get("from");
    return dest && dest.startsWith("/") && !dest.startsWith("//")
      ? dest
      : "/today";
  }, [searchParams]);

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{
        background: `radial-gradient(ellipse 120% 80% at 50% -30%, rgba(69, 224, 212, 0.07), transparent 52%), linear-gradient(180deg, ${NOXTURN_COLORS.pageBgDeep} 0%, ${NOXTURN_COLORS.pageBg} 45%, #030814 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(52vh,420px)] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(12,31,61,0.55),transparent_65%)]"
        aria-hidden
      />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <AccessibilityMenu variant="compact" />
      </div>

      <div className="relative flex flex-1 flex-col justify-center px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-[420px]">
          <LoginBranding />
          <LoginSignInCard postLoginDestination={postLoginDestination} />
        </div>
      </div>
    </div>
  );
}

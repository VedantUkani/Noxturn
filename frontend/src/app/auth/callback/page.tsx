"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { markAuthenticated } from "@/lib/auth-browser";
import { POST_ONBOARDING_DEST_KEY } from "@/lib/onboarding-flag";
import { supabase } from "@/lib/supabase";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!supabase) {
      router.replace("/");
      return;
    }
    void (async () => {
      const code = searchParams.get("code");
      try {
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else {
          await supabase.auth.getSession();
        }
      } catch {
        /* session may still be established via hash fragment */
        await supabase.auth.getSession();
      }

      markAuthenticated();
      try {
        sessionStorage.setItem(POST_ONBOARDING_DEST_KEY, "/today");
      } catch {
        /* ignore */
      }
      router.replace("/onboarding");
      router.refresh();
    })();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#04112d] px-4 text-sm text-[#98a4bf]">
      Completing sign-in…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#04112d] text-sm text-[#7d89a6]">
          Loading…
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}

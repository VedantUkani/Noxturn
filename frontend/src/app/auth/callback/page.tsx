"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { markAuthenticated } from "@/lib/auth-browser";
import { syncBackendAuth } from "@/lib/backend-auth";
import {
  displayNameFromEmail,
  persistSessionIdentity,
} from "@/lib/session-identity";
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

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (user) {
        const email = user.email?.trim() ?? "";
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        const metaName =
          (typeof meta?.full_name === "string" ? meta.full_name : "") ||
          (typeof meta?.name === "string" ? meta.name : "");
        const displayName =
          metaName.trim() ||
          (email ? displayNameFromEmail(email) : "Account");
        persistSessionIdentity({ displayName, email });
        // Sync with backend auth to obtain backend JWT for protected API calls
        try {
          await syncBackendAuth(email, displayName);
        } catch {
          /* non-fatal */
        }
      }

      markAuthenticated();

      // If this was a calendar-connect OAuth flow, redirect to /schedule
      let postDest: string | null = null;
      try {
        postDest = sessionStorage.getItem("noxturn_post_auth_dest");
        sessionStorage.removeItem("noxturn_post_auth_dest");
        sessionStorage.removeItem("noxturn_calendar_connect");
      } catch { /* ignore */ }

      if (postDest) {
        router.replace(postDest);
        router.refresh();
        return;
      }

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

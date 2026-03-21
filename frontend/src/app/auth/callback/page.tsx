"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!supabase) {
      router.replace("/schedule");
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
      router.replace("/schedule");
      router.refresh();
    })();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-slate-400">
      Signing in to your calendar…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
          Loading…
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}

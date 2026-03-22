"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { fetchRecoveryAnalytics } from "@/lib/noxturn-api";
import { ensureBackendAuth, getOrCreateUserId } from "@/lib/session";
import { mapRecoveryApiToViewModel } from "./map-recovery-api";
import { RecoveryAnalyticsPage } from "./RecoveryAnalyticsPage";
import type { RecoveryAnalyticsViewModel } from "./types";
import { cn } from "@/lib/utils";

type Phase = "loading" | "ready" | "empty" | "error";

export function RecoveryPageClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [viewModel, setViewModel] = useState<RecoveryAnalyticsViewModel | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const userId = getOrCreateUserId();
    if (!userId) {
      router.replace("/onboard");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        // Always ensure a valid JWT before hitting the authenticated endpoint
        await ensureBackendAuth();
        const data = await fetchRecoveryAnalytics();
        if (cancelled) return;

        setViewModel(mapRecoveryApiToViewModel(data));
        setPhase("ready");
      } catch (e) {
        if (cancelled) return;
        // 401/403 means auth issue — treat same as no data
        if (
          e instanceof ApiError &&
          (e.status === 401 || e.status === 403 || e.status === 404)
        ) {
          setPhase("empty");
        } else {
          setErrorMsg(
            e instanceof Error ? e.message : "Could not load recovery analytics.",
          );
          setPhase("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (phase === "loading") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-[#45e0d4]/20 border-t-[#45e0d4]" />
        </div>
        <p className="text-sm text-[#98a4bf]">Loading your recovery analytics…</p>
      </div>
    );
  }

  if (phase === "empty") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            "bg-[#141f42] shadow-[0_0_32px_-8px_rgba(69,224,212,0.15)]",
          )}
        >
          <span className="text-3xl" aria-hidden>📊</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#edf2ff]">No recovery data yet</h2>
          <p className="max-w-sm text-sm leading-relaxed text-[#7d89a6]">
            Upload your shift schedule and generate a plan on the Today page.
            Then mark tasks complete to start building your recovery analytics.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/today")}
            className="rounded-xl bg-[#45e0d4]/15 px-6 py-2.5 text-sm font-semibold text-[#45e0d4] transition hover:bg-[#45e0d4]/25"
          >
            Go to Today
          </button>
          <button
            type="button"
            onClick={() => router.push("/onboard")}
            className="rounded-xl border border-white/[0.1] px-6 py-2.5 text-sm font-medium text-[#7d89a6] transition hover:border-white/[0.2] hover:text-[#edf2ff]"
          >
            Upload Schedule
          </button>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="max-w-sm text-sm leading-relaxed text-[#f87171]">
          {errorMsg ?? "Something went wrong loading recovery analytics."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl border border-white/[0.12] px-5 py-2 text-xs font-medium text-[#edf2ff] transition hover:border-white/[0.2]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!viewModel) return null;

  return <RecoveryAnalyticsPage data={viewModel} />;
}

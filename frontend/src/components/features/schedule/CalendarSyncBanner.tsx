"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  connectGoogleCalendar,
  getSessionProvider,
  hasCalendarToken,
  isSupabaseConfigured,
  signInWithMicrosoft,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

/**
 * Calendar sync card — always visible on the Today page.
 * Shows "Connect" when not yet authorised, "Sync again" when already connected.
 */
export function CalendarSyncBanner() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [calReady, setCalReady] = useState(false);

  useEffect(() => {
    void getSessionProvider().then(setProvider);
    void hasCalendarToken().then(setCalReady);
  }, []);

  const supabaseOk = isSupabaseConfigured();

  const handleGoogle = async () => {
    setBusy(true);
    setErr(null);
    setDone(null);
    try {
      if (calReady && provider === "google") {
        // Already authorised — go to schedule page to import
        router.push("/schedule");
      } else {
        // Request calendar permission via OAuth
        sessionStorage.setItem("noxturn_calendar_autoimport", "true");
        await connectGoogleCalendar();
        // Redirects away; no further action needed here
      }
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Could not start Google sign-in.");
      setBusy(false);
    }
  };

  const handleOutlook = async () => {
    setBusy(true);
    setErr(null);
    setDone(null);
    try {
      if (calReady && provider === "azure") {
        router.push("/schedule");
      } else {
        await signInWithMicrosoft();
        // Redirects away
      }
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Could not start Microsoft sign-in.");
      setBusy(false);
    }
  };

  return (
    <div className={cn(nx.card, "p-5")}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#45e0d4]/10 text-[#45e0d4]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/>
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-[#edf2ff]">
              {calReady ? "Calendar connected" : "Sync your rota"}
            </p>
            <p className="text-[11px] text-[#7d89a6]">
              {calReady
                ? "Re-sync to pull latest shifts"
                : "Connect your calendar to auto-import shifts"}
            </p>
          </div>
        </div>

        {/* Quick action — just go to /schedule for full options */}
        <button
          type="button"
          onClick={() => router.push("/schedule")}
          className="shrink-0 rounded-xl border border-white/[0.1] bg-[#0d1833] px-3 py-1.5 text-xs font-medium text-[#98a4bf] transition hover:border-white/[0.2] hover:text-[#edf2ff]"
        >
          Manage
        </button>
      </div>

      {/* Calendar buttons */}
      {supabaseOk ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Google */}
          <button
            type="button"
            disabled={busy}
            onClick={handleGoogle}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#45e0d4] px-4 text-xs font-bold text-[#04112d] transition hover:brightness-105 disabled:opacity-50"
          >
            <svg viewBox="0 0 18 18" className="h-3.5 w-3.5" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {calReady && provider === "google" ? "Re-sync Google" : "Google Calendar"}
          </button>

          {/* Outlook */}
          <button
            type="button"
            disabled={busy}
            onClick={handleOutlook}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.12] bg-[#101c3c]/90 px-4 text-xs font-medium text-[#edf2ff] transition hover:border-white/[0.2] hover:bg-[#141f42] disabled:opacity-50"
          >
            <svg viewBox="0 0 18 18" className="h-3.5 w-3.5" fill="#0078D4">
              <path d="M9 0L1 3.5v11L9 18l8-3.5v-11L9 0zm0 2.2l5.6 2.4L9 7 3.4 4.6 9 2.2zM2.5 6.1L8 8.4V15.3l-5.5-2.4V6.1zm7 9.2V8.4l5.5-2.3v6.8l-5.5 2.4z"/>
            </svg>
            {calReady && provider === "azure" ? "Re-sync Outlook" : "Outlook / NHS 365"}
          </button>

          {/* File upload shortcut */}
          <button
            type="button"
            onClick={() => router.push("/schedule")}
            className="inline-flex h-9 items-center rounded-xl px-3 text-xs font-medium text-[#7d89a6] transition hover:text-[#98a4bf]"
          >
            Upload file →
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => router.push("/schedule")}
          className="mt-4 inline-flex h-9 items-center rounded-xl bg-[#45e0d4] px-5 text-xs font-bold text-[#04112d] transition hover:brightness-105"
        >
          Add schedule →
        </button>
      )}

      {err && <p className="mt-3 text-xs text-rose-300">{err}</p>}
      {done && <p className="mt-3 text-xs text-[#45e0d4]">{done}</p>}
    </div>
  );
}

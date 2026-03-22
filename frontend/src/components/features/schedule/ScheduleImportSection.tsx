"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  eventsToBlocks,
  fetchOutlookCalendarEvents,
} from "@/lib/calendarImport";
import { fetchGoogleCalendarViaPopup } from "@/lib/googleCalendarOAuth";
import { getOrCreateUserId } from "@/lib/session";
import {
  normalizeImportedBlocks,
  postScheduleIcsUpload,
  postScheduleSpreadsheetUpload,
} from "@/lib/schedule-import-api";
import type { ScheduleBlockInput } from "@/lib/types";
import {
  isSupabaseConfigured,
  signInWithMicrosoft,
  supabase,
} from "@/lib/supabase";

type ScheduleImportSectionProps = {
  onBlocksImported: (blocks: ScheduleBlockInput[]) => void;
};

const btnClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 text-center text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800/80 focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-400/45 disabled:pointer-events-none disabled:opacity-45";

export function ScheduleImportSection({
  onBlocksImported,
}: ScheduleImportSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [calendarReady, setCalendarReady] = useState(false);

  const refreshCalendarSession = useCallback(async () => {
    if (!supabase) {
      setCalendarReady(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setCalendarReady(Boolean(data.session?.provider_token));
  }, []);

  useEffect(() => {
    void refreshCalendarSession();
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshCalendarSession();
    });
    return () => subscription.unsubscribe();
  }, [refreshCalendarSession]);

  const mergeFromApi = useCallback(
    (raw: ScheduleBlockInput[]) => {
      const normalized = normalizeImportedBlocks(raw as unknown[]);
      onBlocksImported(normalized);
      setNotice(`Added ${normalized.length} block(s) from file.`);
      setErr(null);
    },
    [onBlocksImported],
  );

  const mergeCalendarBlocks = useCallback(
    (blocks: ScheduleBlockInput[]) => {
      onBlocksImported(blocks);
      setNotice(`Added ${blocks.length} block(s) from your calendar.`);
      setErr(null);
    },
    [onBlocksImported],
  );

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const userId = getOrCreateUserId();
    if (!userId) {
      setErr("Could not resolve user id for upload.");
      return;
    }
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const lower = file.name.toLowerCase();
      const res =
        lower.endsWith(".ics") || lower.endsWith(".ical")
          ? await postScheduleIcsUpload(file, userId)
          : await postScheduleSpreadsheetUpload(file, userId);
      mergeFromApi(res.blocks);
    } catch (x) {
      setNotice(null);
      setErr(x instanceof Error ? x.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const pullGoogle = async () => {
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const events = await fetchGoogleCalendarViaPopup(14);
      const blocks = eventsToBlocks(events, 30).map((b) => ({
        ...b,
        id: crypto.randomUUID(),
      }));
      mergeCalendarBlocks(blocks);
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Google import failed.");
    } finally {
      setBusy(false);
    }
  };

  const pullOutlook = async () => {
    setBusy(true);
    setErr(null);
    setNotice(null);
    try {
      const events = await fetchOutlookCalendarEvents(14);
      const blocks = eventsToBlocks(events, 30).map((b) => ({
        ...b,
        id: crypto.randomUUID(),
      }));
      mergeCalendarBlocks(blocks);
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Outlook import failed.");
    } finally {
      setBusy(false);
    }
  };

  const connectOutlook = async () => {
    setErr(null);
    try {
      await signInWithMicrosoft();
    } catch (x) {
      setErr(
        x instanceof Error ? x.message : "Could not start Microsoft sign-in.",
      );
    }
  };

  const supabaseOk = isSupabaseConfigured();

  return (
    <section className="space-y-3" aria-label="Import schedule">
      <div>
        <h2 className="text-sm font-semibold text-slate-200">
          Bring in your rota
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Google Calendar, Outlook, a roster file (CSV, Excel, or .ics), or add
          blocks manually with +.
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls,.ics,.ical,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={onFileChange}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          className={btnClass}
          disabled={busy}
          onClick={pullGoogle}
        >
          Google Calendar
        </button>
        <button
          type="button"
          className={btnClass}
          disabled={busy || !supabaseOk}
          onClick={calendarReady ? pullOutlook : connectOutlook}
        >
          {calendarReady ? "Import Outlook" : "Connect Outlook"}
        </button>
        <button
          type="button"
          className={btnClass}
          disabled={busy}
          onClick={onPickFile}
        >
          Upload file
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Manual entry: use the + button under &quot;Your shifts&quot;.
      </p>

      {!supabaseOk ? (
        process.env.NODE_ENV === "development" ? (
          <p className="text-[11px] leading-relaxed text-slate-600">
            Calendar buttons need{" "}
            <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-400">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-400">
              ANON_KEY
            </code>
            . File upload uses{" "}
            <code className="rounded bg-slate-900 px-1 py-0.5 text-slate-400">
              NEXT_PUBLIC_API_BASE
            </code>
            .
          </p>
        ) : (
          <p className="text-[11px] leading-relaxed text-slate-500">
            Calendar connect isn&apos;t available here — use upload or add shifts
            with +.
          </p>
        )
      ) : !calendarReady ? (
        <p className="text-[11px] text-slate-500">
          Google Calendar opens a popup — allow it if blocked. Connect Outlook to import from Microsoft.
        </p>
      ) : null}

      {notice ? (
        <p className="text-sm text-teal-200/90" role="status">
          {notice}
        </p>
      ) : null}
      {err ? (
        <p className="text-sm text-rose-300/90" role="alert">
          {err}
        </p>
      ) : null}
    </section>
  );
}

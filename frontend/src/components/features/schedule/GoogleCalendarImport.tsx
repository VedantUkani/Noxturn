"use client";

import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";

export type CalendarShift = {
  title: string;
  start: string;
  end: string;
};

type Props = {
  onImport: (shifts: CalendarShift[]) => void;
};

export function GoogleCalendarImport({ onImport }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const login = useGoogleLogin({
    flow: "implicit",
    scope: "https://www.googleapis.com/auth/calendar.readonly",
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const token = tokenResponse.access_token;
        const timeMin = new Date().toISOString();
        const timeMax = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

        const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
        url.searchParams.set("timeMin", timeMin);
        url.searchParams.set("timeMax", timeMax);
        url.searchParams.set("singleEvents", "true");
        url.searchParams.set("orderBy", "startTime");
        url.searchParams.set("maxResults", "50");

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Google Calendar API error: ${res.status}`);

        const json = await res.json();
        const items = json.items ?? [];

        const shifts: CalendarShift[] = items
          .filter((e: { start?: { dateTime?: string; date?: string } }) =>
            e.start?.dateTime || e.start?.date
          )
          .map((e: {
            summary?: string;
            start: { dateTime?: string; date?: string };
            end: { dateTime?: string; date?: string };
          }) => ({
            title: e.summary ?? "Shift",
            start: e.start.dateTime ?? `${e.start.date}T08:00:00`,
            end: e.end?.dateTime ?? `${e.end?.date}T16:00:00`,
          }));

        setCount(shifts.length);
        onImport(shifts);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google Calendar access was denied or failed.");
      setLoading(false);
    },
  });

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => { setError(null); setCount(null); login(); }}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-100 disabled:opacity-60"
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        {loading ? "Fetching calendar…" : "Import from Google Calendar"}
      </button>

      {count !== null && (
        <p className="text-center text-xs text-emerald-400">
          ✓ {count} events imported from Google Calendar
        </p>
      )}
      {error && (
        <p className="text-center text-xs text-red-400">{error}</p>
      )}
      <p className="text-center text-[11px] text-slate-500">
        Fetches next 14 days. Opens a Google popup — allow it if blocked.
      </p>
    </div>
  );
}

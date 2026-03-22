import { supabase } from "./supabase";
import type { BlockType } from "./types";

export type CalendarEvent = {
  title: string;
  start: string;
  end: string;
};

async function requireToken(): Promise<string> {
  if (!supabase) {
    throw new Error("Sign-in is not available without Supabase configuration.");
  }
  const { data } = await supabase.auth.getSession();
  const token = data.session?.provider_token;
  if (!token) {
    throw new Error("No provider token — sign in with Google or Microsoft first.");
  }
  return token;
}

export async function fetchGoogleCalendarEvents(
  daysAhead = 14,
): Promise<CalendarEvent[]> {
  const token = await requireToken();
  const timeMin = new Date().toISOString();
  const timeMax = new Date(
    Date.now() + daysAhead * 24 * 60 * 60 * 1000,
  ).toISOString();

  const url = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "50");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(
      err?.error?.message ?? `Google Calendar API error: ${res.status}`,
    );
  }

  const json = (await res.json()) as {
    items?: Array<{
      summary?: string;
      start: { dateTime?: string; date?: string };
      end: { dateTime?: string; date?: string };
    }>;
  };

  const items = json.items ?? [];
  return items
    .filter((e) => e.start.dateTime || e.start.date)
    .map((e) => ({
      title: e.summary ?? "Shift",
      start: e.start.dateTime ?? `${e.start.date}T00:00:00`,
      end: e.end.dateTime ?? `${e.end.date}T23:59:59`,
    }));
}

export async function fetchOutlookCalendarEvents(
  daysAhead = 14,
): Promise<CalendarEvent[]> {
  const token = await requireToken();
  const startDateTime = new Date().toISOString();
  const endDateTime = new Date(
    Date.now() + daysAhead * 24 * 60 * 60 * 1000,
  ).toISOString();

  const url = new URL("https://graph.microsoft.com/v1.0/me/calendarView");
  url.searchParams.set("startDateTime", startDateTime);
  url.searchParams.set("endDateTime", endDateTime);
  url.searchParams.set("$top", "50");
  url.searchParams.set("$select", "subject,start,end");
  url.searchParams.set("$orderby", "start/dateTime");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(
      err?.error?.message ?? `Outlook Calendar API error: ${res.status}`,
    );
  }

  const json = (await res.json()) as {
    value?: Array<{
      subject?: string;
      start: { dateTime: string };
      end: { dateTime: string };
    }>;
  };

  return (json.value ?? []).map((e) => ({
    title: e.subject ?? "Shift",
    start: e.start.dateTime,
    end: e.end.dateTime,
  }));
}

const SHIFT_KEYWORDS: Record<string, BlockType> = {
  night: "night_shift",
  noc: "night_shift",
  nocturnal: "night_shift",
  evening: "evening_shift",
  afternoon: "evening_shift",
  pm: "evening_shift",
  day: "day_shift",
  am: "day_shift",
  morning: "day_shift",
  off: "off_day",
  rest: "off_day",
  leave: "off_day",
};

function guessBlockType(title: string): BlockType {
  const lower = title.toLowerCase();
  for (const [keyword, blockType] of Object.entries(SHIFT_KEYWORDS)) {
    if (lower.includes(keyword)) return blockType;
  }
  return "day_shift";
}

export function eventsToRawText(events: CalendarEvent[]): string {
  return events
    .map((e) => {
      const date = e.start.slice(0, 10);
      const startTime = e.start.slice(11, 16);
      const endTime = e.end.slice(11, 16);
      return `${e.title} on ${date} from ${startTime} to ${endTime}`;
    })
    .join("\n");
}

export type MappedBlock = {
  block_type: BlockType;
  title: string;
  start_time: string;
  end_time: string;
  commute_before_minutes?: number;
  commute_after_minutes?: number;
};

export function eventsToBlocks(
  events: CalendarEvent[],
  commute = 0,
): MappedBlock[] {
  return events.map((e) => ({
    block_type: guessBlockType(e.title),
    title: e.title,
    start_time: e.start,
    end_time: e.end,
    commute_before_minutes: commute,
    commute_after_minutes: commute,
  }));
}

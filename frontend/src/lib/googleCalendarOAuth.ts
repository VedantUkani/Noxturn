const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const REDIRECT_URI =
  typeof window !== "undefined"
    ? `${window.location.origin}/auth/google-calendar-callback`
    : "http://localhost:3000/auth/google-calendar-callback";

/**
 * Opens a Google OAuth2 implicit-flow popup and resolves with an access token.
 * No third-party library needed — uses the standard OAuth2 implicit grant.
 *
 * Prerequisites in Google Cloud Console:
 *   Authorized JavaScript origins:  http://localhost:3000
 *   Authorized redirect URIs:       http://localhost:3000/auth/google-calendar-callback
 */
export function openGoogleCalendarPopup(): Promise<string> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "token",
      scope: CALENDAR_SCOPE,
      include_granted_scopes: "true",
      prompt: "consent",
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    const width = 500;
    const height = 600;
    const left = Math.max(0, (window.screen.width - width) / 2);
    const top = Math.max(0, (window.screen.height - height) / 2);

    const popup = window.open(
      url,
      "google_calendar_oauth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    );

    if (!popup) {
      reject(
        new Error("Popup was blocked. Allow popups for this site and try again."),
      );
      return;
    }

    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "GOOGLE_CALENDAR_TOKEN") return;
      window.removeEventListener("message", handler);
      if (event.data.error) {
        reject(new Error(`Google auth error: ${event.data.error}`));
      } else if (event.data.accessToken) {
        resolve(event.data.accessToken as string);
      } else {
        reject(new Error("No access token received."));
      }
    };

    window.addEventListener("message", handler);

    // Fallback: if popup is closed without sending a message
    const poll = setInterval(() => {
      if (popup.closed) {
        clearInterval(poll);
        window.removeEventListener("message", handler);
        reject(new Error("Popup was closed before completing sign-in."));
      }
    }, 500);
  });
}

export async function fetchGoogleCalendarViaPopup(daysAhead = 14) {
  const token = await openGoogleCalendarPopup();

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

  return (json.items ?? [])
    .filter((e) => e.start.dateTime || e.start.date)
    .map((e) => ({
      title: e.summary ?? "Shift",
      start: e.start.dateTime ?? `${e.start.date}T00:00:00`,
      end: e.end.dateTime ?? `${e.end.date}T23:59:59`,
    }));
}

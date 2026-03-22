"use client";

import { useEffect } from "react";

/**
 * OAuth2 implicit-flow callback for Google Calendar.
 * Google redirects here with #access_token=... in the URL hash.
 * We extract the token and postMessage it back to the opener window.
 */
export default function GoogleCalendarCallbackPage() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const error = params.get("error");

    if (window.opener) {
      window.opener.postMessage(
        { type: "GOOGLE_CALENDAR_TOKEN", accessToken, error },
        window.location.origin,
      );
    }
    window.close();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#04112d] text-[#edf2ff]">
      <p className="text-sm text-slate-400">Connecting Google Calendar…</p>
    </div>
  );
}

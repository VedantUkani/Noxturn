"use client";

import { useEffect } from "react";

/**
 * Fitbit OAuth 2.0 callback page.
 * Fitbit redirects here with ?code=... after the user authorises.
 * We forward the code (or error) back to the opener window via postMessage,
 * then close the popup.
 */
export default function FitbitCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const state = params.get("state");

    if (window.opener) {
      window.opener.postMessage(
        { type: "FITBIT_OAUTH_CODE", code, error, state },
        window.location.origin,
      );
    }
    window.close();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#04112d] text-[#edf2ff]">
      <p className="text-sm text-slate-400">Connecting Fitbit…</p>
    </div>
  );
}

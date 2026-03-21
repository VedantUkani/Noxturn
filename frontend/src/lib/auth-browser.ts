"use client";

import {
  NOXTURN_AUTH_MAX_AGE_SEC,
  NOXTURN_AUTH_VALUE,
  serializeAuthCookie,
  serializeClearAuthCookie,
} from "./auth-cookie";

export function markAuthenticated(): void {
  if (typeof document === "undefined") return;
  // Local dev: session-only cookie so closing the browser shows login again on localhost.
  const maxAge =
    process.env.NODE_ENV === "development" ? 0 : NOXTURN_AUTH_MAX_AGE_SEC;
  document.cookie = serializeAuthCookie(NOXTURN_AUTH_VALUE, maxAge);
}

export function clearAuthenticated(): void {
  if (typeof document === "undefined") return;
  document.cookie = serializeClearAuthCookie();
}

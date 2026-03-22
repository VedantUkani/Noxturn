/** Demo session cookie — replace with HttpOnly session when backend auth ships. */

export const NOXTURN_AUTH_COOKIE = "noxturn_auth";
export const NOXTURN_AUTH_VALUE = "1";
export const NOXTURN_AUTH_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** `maxAgeSec <= 0` → session cookie (clears when the browser session ends). */
export function serializeAuthCookie(value: string, maxAgeSec: number): string {
  const base = `${NOXTURN_AUTH_COOKIE}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
  if (maxAgeSec <= 0) return base;
  return `${base}; Max-Age=${maxAgeSec}`;
}

export function serializeClearAuthCookie(): string {
  return `${NOXTURN_AUTH_COOKIE}=; Path=/; Max-Age=0`;
}

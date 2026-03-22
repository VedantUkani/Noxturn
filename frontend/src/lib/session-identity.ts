/**
 * Lightweight display identity after login — until a real auth API owns this.
 * Cleared on sign-out alongside the auth cookie.
 */

export const SESSION_IDENTITY_KEY = "noxturn_session_identity_v1";

export const IDENTITY_CHANGED_EVENT = "noxturn-identity-changed";

export type SessionIdentity = {
  displayName: string;
  email: string;
};

export function notifyIdentityChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(IDENTITY_CHANGED_EVENT));
}

/** Derive a readable label when sign-in only collects email (no full name field). */
export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return "Account";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function persistSessionIdentity(identity: SessionIdentity): void {
  if (typeof window === "undefined") return;
  const payload: SessionIdentity = {
    displayName: identity.displayName.trim() || displayNameFromEmail(identity.email),
    email: identity.email.trim(),
  };
  window.localStorage.setItem(SESSION_IDENTITY_KEY, JSON.stringify(payload));
  notifyIdentityChanged();
}

export function loadSessionIdentity(): SessionIdentity | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_IDENTITY_KEY);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const rec = o as Record<string, unknown>;
    if (typeof rec.displayName !== "string" || typeof rec.email !== "string") {
      return null;
    }
    return {
      displayName: rec.displayName,
      email: rec.email,
    };
  } catch {
    return null;
  }
}

export function clearSessionIdentity(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_IDENTITY_KEY);
  notifyIdentityChanged();
}

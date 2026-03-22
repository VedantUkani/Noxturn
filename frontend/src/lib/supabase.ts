import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Optional OAuth client (Google / Microsoft calendar) — only when env vars are set.
 * Matches the flow from the legacy Noxturn frontend on `dev`.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
    },
  });
  if (error) throw error;
}

/**
 * Re-authenticates with Google requesting the calendar.readonly scope.
 * After the redirect the auth/callback page detects the provider_token and
 * redirects to /schedule so the user can immediately import their shifts.
 */
export async function connectGoogleCalendar(): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
  }
  try {
    sessionStorage.setItem("noxturn_post_auth_dest", "/schedule");
    sessionStorage.setItem("noxturn_calendar_connect", "google");
  } catch { /* ignore */ }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      scopes: "https://www.googleapis.com/auth/calendar.readonly",
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw error;
}

/** Returns the OAuth provider for the current session (e.g. "google", "azure"). */
export async function getSessionProvider(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return (data.session?.user?.app_metadata?.provider as string) ?? null;
}

/** True if the current session has a provider_token (calendar access granted). */
export async function hasCalendarToken(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session?.provider_token);
}

export async function signInWithMicrosoft(): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      scopes: "Calendars.Read User.Read offline_access",
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

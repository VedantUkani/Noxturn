import {
  isSupabaseConfigured,
  signInWithGoogle,
  signInWithMicrosoft,
} from "@/lib/supabase";

export type SocialSignInResult =
  | { kind: "redirect" }
  | { kind: "unavailable" }
  | { kind: "failed" };

/**
 * Google OAuth via Supabase when env is configured; otherwise callers should show
 * a user-friendly message (no technical details).
 *
 * TODO(noxturn-auth): Swap implementation when a dedicated auth API replaces Supabase OAuth.
 */
export async function initiateGoogleSignIn(): Promise<SocialSignInResult> {
  if (!isSupabaseConfigured()) return { kind: "unavailable" };
  try {
    await signInWithGoogle();
    return { kind: "redirect" };
  } catch {
    return { kind: "failed" };
  }
}

/**
 * Microsoft (Azure AD) OAuth via Supabase when env is configured.
 *
 * TODO(noxturn-auth): Align provider/scopes with enterprise IdP when backend auth ships.
 */
export async function initiateMicrosoftSignIn(): Promise<SocialSignInResult> {
  if (!isSupabaseConfigured()) return { kind: "unavailable" };
  try {
    await signInWithMicrosoft();
    return { kind: "redirect" };
  } catch {
    return { kind: "failed" };
  }
}

export type RegisterAccountPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type RegisterAccountResult = { ok: true } | { ok: false; message: string };

/**
 * Creates a new account via Supabase email+password sign-up,
 * then signs in immediately so the session is ready.
 */
export async function registerAccount(
  payload: RegisterAccountPayload,
): Promise<RegisterAccountResult> {
  try {
    const { supabase } = await import("@/lib/supabase");
    if (!supabase) return { ok: true }; // Supabase not configured — allow pass-through for demo

    // Step 1: Sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: { data: { full_name: payload.fullName } },
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("already registered")) {
        return { ok: false, message: "An account with this email already exists. Try signing in." };
      }
      return { ok: false, message: signUpError.message };
    }

    // Step 2: If email confirmation is disabled, session is available immediately.
    // If confirmation is required, sign in explicitly to get a session.
    if (!signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
      if (signInError) {
        // Account created but email confirmation is required — tell user clearly
        return {
          ok: false,
          message: "Account created! Check your email to confirm your address, then sign in.",
        };
      }
    }

    return { ok: true };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

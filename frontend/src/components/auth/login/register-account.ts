export type RegisterAccountPayload = {
  fullName: string;
  email: string;
  password: string;
};

export type RegisterAccountResult = { ok: true } | { ok: false; message: string };

/**
 * Persists a new account when a backend exists. Today the app uses the same
 * client session after registration as after sign-in.
 *
 * TODO(noxturn-auth): POST to `/api/auth/register` (or Supabase signUp); map errors to user-safe messages.
 */
export async function registerAccount(
  _payload: RegisterAccountPayload,
): Promise<RegisterAccountResult> {
  void _payload;
  return { ok: true };
}

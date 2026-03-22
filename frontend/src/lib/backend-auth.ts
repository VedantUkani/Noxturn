/**
 * Syncs a Supabase-authenticated user with the Noxturn FastAPI backend.
 * After Supabase login, call syncBackendAuth() to obtain and store a backend JWT.
 * All protected API calls then use this JWT via getBackendJwt().
 */

const JWT_KEY = "noxturn_backend_jwt";
const DEFAULT_API_BASE = "http://127.0.0.1:8000";

function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE;
  return raw ? raw.replace(/\/$/, "") : DEFAULT_API_BASE;
}

export function getBackendJwt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(JWT_KEY);
}

export function clearBackendJwt(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(JWT_KEY);
}

function setBackendJwt(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(JWT_KEY, token);
}

/**
 * Tries backend /auth/login; if user not found (404) calls /auth/register.
 * Stores the returned JWT in localStorage for use by api.ts.
 */
export async function syncBackendAuth(email: string, name?: string): Promise<void> {
  const base = apiBase();

  // 1. Try login
  const loginRes = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (loginRes.ok) {
    const data = (await loginRes.json()) as { access_token: string };
    setBackendJwt(data.access_token);
    return;
  }

  // 2. If not registered yet, register then get JWT
  if (loginRes.status === 404) {
    const regRes = await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: name?.trim() || email.split("@")[0],
        role: "nurse",
      }),
    });
    if (regRes.ok) {
      const data = (await regRes.json()) as { access_token: string };
      setBackendJwt(data.access_token);
    }
  }
}

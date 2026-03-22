/**
 * HTTP client for the Noxturn FastAPI backend.
 * Set `NEXT_PUBLIC_API_BASE` (e.g. http://127.0.0.1:8000). Defaults match local dev.
 */

const DEFAULT_API_BASE = "http://127.0.0.1:8000";

function normalizeBase(raw: string | undefined): string {
  if (!raw || !raw.trim()) return DEFAULT_API_BASE;
  return raw.replace(/\/$/, "");
}

export function getApiBase(): string {
  return normalizeBase(process.env.NEXT_PUBLIC_API_BASE);
}

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(path: string, status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.path = path;
    this.status = status;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON from API");
  }
}

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const jwt = localStorage.getItem("noxturn_backend_jwt");
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
}

export async function getJson<T>(path: string): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    headers: authHeader(),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(
      path,
      res.status,
      body.slice(0, 200) || `Request failed (${res.status})`,
    );
  }
  return parseJson<T>(res);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new ApiError(
      path,
      res.status,
      errBody.slice(0, 200) || `Request failed (${res.status})`,
    );
  }
  return parseJson<T>(res);
}

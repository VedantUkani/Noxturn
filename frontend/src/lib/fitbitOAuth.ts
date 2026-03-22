const CLIENT_ID = process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID ?? "";
const AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const SCOPES = "sleep activity heartrate profile";

function getRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/fitbit-callback`;
}

// ─── PKCE helpers ────────────────────────────────────────────────────────────

function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateCodeVerifier(): string {
  return base64UrlEncode(generateRandomBytes(48));
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded.buffer as ArrayBuffer);
  return base64UrlEncode(digest);
}

// ─── OAuth popup ──────────────────────────────────────────────────────────────

export type FitbitTokenResult = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresIn: number;
  scope: string;
};

export async function connectFitbit(): Promise<FitbitTokenResult> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = base64UrlEncode(generateRandomBytes(16));
  const redirectUri = getRedirectUri();

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  const url = `${AUTH_URL}?${params.toString()}`;
  const width = 520;
  const height = 640;
  const left = Math.max(0, (window.screen.width - width) / 2);
  const top = Math.max(0, (window.screen.height - height) / 2);

  const popup = window.open(
    url,
    "fitbit_oauth",
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
  );

  if (!popup) throw new Error("Popup was blocked. Please allow popups and try again.");

  return new Promise((resolve, reject) => {
    const handler = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== "FITBIT_OAUTH_CODE") return;

      window.removeEventListener("message", handler);
      clearInterval(pollTimer);

      const { code, error, state: returnedState } = event.data as {
        code?: string;
        error?: string;
        state?: string;
      };

      if (error) return reject(new Error(`Fitbit denied access: ${error}`));
      if (returnedState !== state) return reject(new Error("State mismatch — possible CSRF."));
      if (!code) return reject(new Error("No authorisation code received."));

      try {
        const res = await fetch("/api/fitbit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, codeVerifier, redirectUri }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Token exchange failed.");
        // Persist token so the app can make API calls later
        sessionStorage.setItem("fitbit_access_token", data.accessToken);
        sessionStorage.setItem("fitbit_refresh_token", data.refreshToken);
        sessionStorage.setItem("fitbit_user_id", data.userId);
        resolve(data as FitbitTokenResult);
      } catch (e) {
        reject(e);
      }
    };

    window.addEventListener("message", handler);

    // Detect if user closes popup without authorising
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        window.removeEventListener("message", handler);
        reject(new Error("Popup closed before completing authorisation."));
      }
    }, 600);
  });
}

export function disconnectFitbit(): void {
  sessionStorage.removeItem("fitbit_access_token");
  sessionStorage.removeItem("fitbit_refresh_token");
  sessionStorage.removeItem("fitbit_user_id");
}

export function getFitbitAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("fitbit_access_token");
}

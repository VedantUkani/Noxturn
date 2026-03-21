"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { markAuthenticated } from "@/lib/auth-browser";
import { POST_ONBOARDING_DEST_KEY } from "@/lib/onboarding-flag";
import { cn } from "@/lib/utils";

export function LoginPageContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const continueIn = useCallback(() => {
    setPending(true);
    markAuthenticated();
    const dest = searchParams.get("from");
    const safe =
      dest && dest.startsWith("/") && !dest.startsWith("//")
        ? dest
        : "/today";

    try {
      sessionStorage.setItem(POST_ONBOARDING_DEST_KEY, safe);
    } catch {
      /* ignore quota / private mode */
    }
    // Full navigation: auth cookie is always sent; onboarding shows welcome or forwards if already done.
    window.location.assign("/onboarding");
  }, [searchParams]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      continueIn();
    },
    [continueIn],
  );

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#070b14] text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.09),transparent_50%)]"
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-400/85">
              {APP_TAGLINE}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
              {APP_NAME}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Continue to the app — local demo mode works without the API. Email
              and password are optional for now.
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0c1220]/95 to-[#080d18]/98 p-6 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)]",
              "backdrop-blur-xl sm:p-7",
            )}
          >
            <form className="space-y-5" onSubmit={onSubmit} noValidate>
              <div>
                <label
                  htmlFor="noxturn-email"
                  className="block text-xs font-medium text-slate-400"
                >
                  Email{" "}
                  <span className="font-normal text-slate-600">(optional)</span>
                </label>
                <input
                  id="noxturn-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700/60 bg-slate-950/50 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-teal-400/0 transition-[border-color,box-shadow] placeholder:text-slate-600 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/25"
                  placeholder="you@hospital.org"
                />
              </div>
              <div>
                <label
                  htmlFor="noxturn-password"
                  className="block text-xs font-medium text-slate-400"
                >
                  Password{" "}
                  <span className="font-normal text-slate-600">(optional)</span>
                </label>
                <input
                  id="noxturn-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700/60 bg-slate-950/50 px-3.5 py-2.5 text-sm text-slate-100 outline-none ring-teal-400/0 transition-[border-color,box-shadow] placeholder:text-slate-600 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/25"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-teal-400 text-sm font-semibold text-slate-950 shadow-[0_0_24px_-8px_rgba(45,212,191,0.45)] transition-colors hover:bg-teal-300 focus-visible:outline focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d18] disabled:pointer-events-none disabled:opacity-60"
              >
                {pending ? "Opening…" : "Continue"}
              </button>
            </form>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-500">
              No backend required — the dashboard uses local demo data until
              <code className="mx-0.5 rounded bg-slate-800/80 px-1 py-0.5 text-[10px] text-slate-400">
                NEXT_PUBLIC_API_BASE
              </code>{" "}
              is set and the API is running.
            </p>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-600">
              If you land on the app instead of here, you still have an active
              session — use{" "}
              <span className="text-slate-500">Sign out</span> in the sidebar or
              clear site cookies for localhost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

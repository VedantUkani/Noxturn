"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { markAuthenticated } from "@/lib/auth-browser";
import { syncBackendAuth } from "@/lib/backend-auth";
import {
  displayNameFromEmail,
  persistSessionIdentity,
} from "@/lib/session-identity";
import { POST_ONBOARDING_DEST_KEY } from "@/lib/onboarding-flag";
import { nx } from "@/lib/ui-theme";
import { cn } from "@/lib/utils";
import { AuthModeToggle, type AuthMode } from "./AuthModeToggle";
import {
  EyeClosedIcon,
  EyeOpenIcon,
  GoogleGlyph,
  MicrosoftGlyph,
} from "./login-icons";
import {
  initiateGoogleSignIn,
  initiateMicrosoftSignIn,
} from "./login-social-adapters";
import {
  confirmPasswordErrorMessage,
  emailErrorMessage,
  fullNameErrorMessage,
  newPasswordErrorMessage,
  passwordErrorMessage,
} from "./login-validation";
import { registerAccount } from "./register-account";

type LoginSignInCardProps = {
  /** Safe in-app path after onboarding (from `?from=`). */
  postLoginDestination: string;
};

export function LoginSignInCard({ postLoginDestination }: LoginSignInCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const baseId = useId();
  const emailId = `${baseId}-email`;
  const passwordId = `${baseId}-password`;
  const nameId = `${baseId}-name`;
  const confirmId = `${baseId}-confirm`;
  const termsId = `${baseId}-terms`;
  const emailErrorId = `${baseId}-email-err`;
  const passwordErrorId = `${baseId}-password-err`;
  const nameErrorId = `${baseId}-name-err`;
  const confirmErrorId = `${baseId}-confirm-err`;
  const termsErrorId = `${baseId}-terms-err`;
  const formErrorId = `${baseId}-form-err`;
  const socialStatusId = `${baseId}-social-status`;
  const forgotStatusId = `${baseId}-forgot-status`;

  const [mode, setMode] = useState<AuthMode>(() =>
    searchParams.get("mode") === "register" ? "register" : "sign-in",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [pending, setPending] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [confirmErr, setConfirmErr] = useState<string | null>(null);
  const [termsErr, setTermsErr] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [socialMessage, setSocialMessage] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [socialBusy, setSocialBusy] = useState<"google" | "microsoft" | null>(
    null,
  );

  useEffect(() => {
    const next =
      searchParams.get("mode") === "register" ? "register" : "sign-in";
    setMode(next);
  }, [searchParams]);

  const syncModeToUrl = useCallback(
    (next: AuthMode) => {
      setMode(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "register") params.set("mode", "register");
      else params.delete("mode");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
      setFormError(null);
      setSocialMessage(null);
      setForgotMessage(null);
      setEmailErr(null);
      setPasswordErr(null);
      setNameErr(null);
      setConfirmErr(null);
      setTermsErr(null);
      setFullName("");
      setConfirmPassword("");
      setAgreeToTerms(false);
      setPassword("");
    },
    [pathname, router, searchParams],
  );

  const continueToApp = useCallback(
    async (identity: { displayName: string; email: string }) => {
      persistSessionIdentity(identity);
      setPending(true);
      markAuthenticated();
      // Sync with backend auth to obtain backend JWT for protected API calls
      try {
        await syncBackendAuth(identity.email, identity.displayName);
      } catch {
        /* non-fatal — app still works, API calls may 401 until resolved */
      }
      try {
        sessionStorage.setItem(POST_ONBOARDING_DEST_KEY, postLoginDestination);
      } catch {
        /* ignore quota / private mode */
      }
      window.location.assign("/onboarding");
    },
    [postLoginDestination],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSocialMessage(null);
      setForgotMessage(null);
      setFormError(null);

      const eErr = emailErrorMessage(email);
      setEmailErr(eErr);

      if (mode === "sign-in") {
        const pErr = passwordErrorMessage(password);
        setPasswordErr(pErr);
        setNameErr(null);
        setConfirmErr(null);
        setTermsErr(null);
        if (eErr || pErr) return;
        const em = email.trim();
        setPending(true);
        try {
          const { supabase } = await import("@/lib/supabase");
          if (supabase) {
            const { error } = await supabase.auth.signInWithPassword({
              email: em,
              password,
            });
            if (error) {
              setPending(false);
              setFormError("Incorrect email or password. Please try again.");
              return;
            }
          }
        } catch {
          setPending(false);
          setFormError("Sign in failed. Please try again.");
          return;
        }
        continueToApp({
          displayName: displayNameFromEmail(em),
          email: em,
        });
        return;
      }

      const nErr = fullNameErrorMessage(fullName);
      const pErr = newPasswordErrorMessage(password);
      const cErr = confirmPasswordErrorMessage(password, confirmPassword);
      setNameErr(nErr);
      setPasswordErr(pErr);
      setConfirmErr(cErr);
      if (!agreeToTerms) {
        setTermsErr("Confirm to continue.");
      } else {
        setTermsErr(null);
      }

      if (eErr || nErr || pErr || cErr || !agreeToTerms) return;

      setPending(true);
      const result = await registerAccount({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      if (!result.ok) {
        setPending(false);
        setFormError(result.message);
        return;
      }
      continueToApp({
        displayName: fullName.trim(),
        email: email.trim(),
      });
    },
    [
      agreeToTerms,
      confirmPassword,
      continueToApp,
      email,
      fullName,
      mode,
      password,
    ],
  );

  const onGoogle = useCallback(async () => {
    setSocialMessage(null);
    setForgotMessage(null);
    setFormError(null);
    setSocialBusy("google");
    const result = await initiateGoogleSignIn();
    if (result.kind === "redirect") {
      return;
    }
    setSocialBusy(null);
    if (result.kind === "unavailable") {
      setSocialMessage(
        "Google sign-in isn’t set up for your workspace yet. Use your email and password.",
      );
      return;
    }
    setSocialMessage("We couldn’t start Google sign-in. Try again or use email.");
  }, []);

  const onMicrosoft = useCallback(async () => {
    setSocialMessage(null);
    setForgotMessage(null);
    setFormError(null);
    setSocialBusy("microsoft");
    const result = await initiateMicrosoftSignIn();
    if (result.kind === "redirect") {
      return;
    }
    setSocialBusy(null);
    if (result.kind === "unavailable") {
      setSocialMessage(
        "Microsoft sign-in isn’t set up for your workspace yet. Use your email and password.",
      );
      return;
    }
    setSocialMessage(
      "We couldn’t start Microsoft sign-in. Try again or use email.",
    );
  }, []);

  const inputClass = cn(
    "w-full rounded-2xl border border-white/[0.1] bg-[#0d1833]/90 px-3.5 py-2.5 text-[15px] text-[#edf2ff] shadow-inner shadow-black/20 outline-none transition-[border-color,box-shadow]",
    "placeholder:text-[#7d89a6]/80",
    "focus:border-[#45e0d4]/45 focus:ring-2 focus:ring-[#45e0d4]/25",
    "disabled:cursor-not-allowed disabled:opacity-55",
  );

  const socialButtonClass = cn(
    "relative flex h-11 w-full items-center justify-center gap-2.5 rounded-2xl border border-white/[0.1] bg-[#101c3c]/90 text-sm font-semibold text-[#edf2ff] shadow-[0_10px_32px_-22px_rgba(0,0,0,0.9)] transition",
    "hover:border-white/[0.16] hover:bg-[#141f42]",
    "focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a142e]",
    "disabled:pointer-events-none disabled:opacity-45",
  );

  const busy = pending || socialBusy !== null;

  return (
    <div
      className={cn(
        "rounded-[22px] border border-white/[0.08] bg-gradient-to-b from-[#16264a]/95 to-[#141f42]/98 p-6 shadow-[0_28px_70px_-36px_rgba(0,0,0,0.92),inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        "backdrop-blur-xl sm:p-8",
      )}
    >
      <div className="mb-6 text-center">
        <h2
          id={`${baseId}-auth-heading`}
          className="text-lg font-semibold tracking-tight text-[#edf2ff]"
        >
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#98a4bf]">
          {mode === "sign-in"
            ? "Sign in with your work email and password."
            : "Register with your organization email to get started."}
        </p>
      </div>

      <AuthModeToggle
        mode={mode}
        onChange={syncModeToUrl}
        disabled={busy}
        labelledBy={`${baseId}-auth-heading`}
      />

      {formError ? (
        <p
          id={formErrorId}
          role="alert"
          className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-200/95"
        >
          {formError}
        </p>
      ) : null}

      {socialMessage ? (
        <p
          id={socialStatusId}
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-2xl border border-[#45e0d4]/20 bg-[#0c1f3d]/80 px-3 py-2.5 text-center text-sm leading-snug text-[#98a4bf]",
            formError ? "mt-3" : "mt-5",
          )}
        >
          {socialMessage}
        </p>
      ) : null}

      {forgotMessage ? (
        <p
          id={forgotStatusId}
          role="status"
          aria-live="polite"
          className="mt-3 rounded-2xl border border-white/[0.08] bg-[#101c3c]/60 px-3 py-2.5 text-center text-sm text-[#98a4bf]"
        >
          {forgotMessage}
        </p>
      ) : null}

      <form
        id="auth-panel-credentials"
        role="tabpanel"
        aria-labelledby={
          mode === "sign-in" ? "auth-tab-sign-in" : "auth-tab-register"
        }
        className={cn("space-y-4", "mt-6")}
        onSubmit={(e) => void onSubmit(e)}
        noValidate
      >
        {mode === "register" ? (
          <div>
            <label
              htmlFor={nameId}
              className="mb-1.5 block text-xs font-semibold tracking-wide text-[#98a4bf]"
            >
              Full name
            </label>
            <input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              aria-invalid={nameErr ? true : undefined}
              aria-describedby={
                nameErr ? nameErrorId : undefined
              }
              disabled={pending}
              value={fullName}
              onChange={(ev) => {
                setFullName(ev.target.value);
                if (nameErr) setNameErr(null);
              }}
              className={cn(inputClass, nameErr && "border-red-400/35")}
              placeholder="Jordan Rivera"
            />
            {nameErr ? (
              <p id={nameErrorId} className="mt-1.5 text-xs text-red-300/95">
                {nameErr}
              </p>
            ) : null}
          </div>
        ) : null}

        <div>
          <label
            htmlFor={emailId}
            className="mb-1.5 block text-xs font-semibold tracking-wide text-[#98a4bf]"
          >
            Work email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-invalid={emailErr ? true : undefined}
            aria-describedby={emailErr ? emailErrorId : undefined}
            disabled={pending}
            value={email}
            onChange={(ev) => {
              setEmail(ev.target.value);
              if (emailErr) setEmailErr(null);
            }}
            className={cn(inputClass, emailErr && "border-red-400/35")}
            placeholder="name@healthsystem.org"
          />
          {emailErr ? (
            <p id={emailErrorId} className="mt-1.5 text-xs text-red-300/95">
              {emailErr}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor={passwordId}
              className="block text-xs font-semibold tracking-wide text-[#98a4bf]"
            >
              Password
            </label>
            {mode === "sign-in" ? (
              <button
                type="button"
                className="text-xs font-medium text-[#86c9ff] underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141f42]"
                disabled={pending}
                onClick={() => {
                  setForgotMessage(
                    "Password resets are managed by your organization. Contact your IT or HR administrator.",
                  );
                }}
              >
                Forgot password?
              </button>
            ) : null}
          </div>
          <div className="relative">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              aria-invalid={passwordErr ? true : undefined}
              aria-describedby={passwordErr ? passwordErrorId : undefined}
              disabled={pending}
              value={password}
              onChange={(ev) => {
                setPassword(ev.target.value);
                if (passwordErr) setPasswordErr(null);
              }}
              className={cn(
                inputClass,
                "pr-12",
                passwordErr && "border-red-400/35",
              )}
              placeholder={
                mode === "sign-in"
                  ? "Enter your password"
                  : "Create a strong password"
              }
            />
            <button
              type="button"
              className={cn(
                "absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#98a4bf] transition",
                "hover:bg-white/[0.06] hover:text-[#edf2ff]",
                nx.focusRing,
                "focus-visible:ring-offset-[#0d1833]",
              )}
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
            </button>
          </div>
          {passwordErr ? (
            <p id={passwordErrorId} className="mt-1.5 text-xs text-red-300/95">
              {passwordErr}
            </p>
          ) : mode === "register" ? (
            <p className="mt-1.5 text-[11px] leading-snug text-[#7d89a6]">
              At least 8 characters, with letters and numbers.
            </p>
          ) : null}
        </div>

        {mode === "register" ? (
          <div>
            <label
              htmlFor={confirmId}
              className="mb-1.5 block text-xs font-semibold tracking-wide text-[#98a4bf]"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id={confirmId}
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-invalid={confirmErr ? true : undefined}
                aria-describedby={confirmErr ? confirmErrorId : undefined}
                disabled={pending}
                value={confirmPassword}
                onChange={(ev) => {
                  setConfirmPassword(ev.target.value);
                  if (confirmErr) setConfirmErr(null);
                }}
                className={cn(
                  inputClass,
                  "pr-12",
                  confirmErr && "border-red-400/35",
                )}
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                className={cn(
                  "absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#98a4bf] transition",
                  "hover:bg-white/[0.06] hover:text-[#edf2ff]",
                  nx.focusRing,
                  "focus-visible:ring-offset-[#0d1833]",
                )}
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-pressed={showConfirmPassword}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
            {confirmErr ? (
              <p id={confirmErrorId} className="mt-1.5 text-xs text-red-300/95">
                {confirmErr}
              </p>
            ) : null}
          </div>
        ) : null}

        {mode === "register" ? (
          <div className="pt-1">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-[#98a4bf]">
              <input
                id={termsId}
                name="terms"
                type="checkbox"
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0 rounded border border-white/[0.2] bg-[#0d1833] text-[#45e0d4]",
                  "focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141f42]",
                )}
                checked={agreeToTerms}
                disabled={pending}
                aria-invalid={termsErr ? true : undefined}
                aria-describedby={termsErr ? termsErrorId : undefined}
                onChange={(ev) => {
                  setAgreeToTerms(ev.target.checked);
                  if (termsErr) setTermsErr(null);
                }}
              />
              <span>
                I agree to the{" "}
                <span className="text-[#edf2ff]">Terms of Service</span>
                {" and "}
                <span className="text-[#edf2ff]">Privacy Policy</span>.
              </span>
            </label>
            {termsErr ? (
              <p id={termsErrorId} className="mt-2 text-xs text-red-300/95">
                {termsErr}
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className={cn(
            nx.primaryButton,
            "mt-1 flex h-11 w-full items-center justify-center text-[15px]",
            "disabled:pointer-events-none disabled:opacity-55",
          )}
        >
          {pending
            ? mode === "sign-in"
              ? "Signing in…"
              : "Creating account…"
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-xs font-medium uppercase tracking-[0.14em]">
          <span className="bg-[#141f42] px-3 text-[#7d89a6]">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className={socialButtonClass}
          disabled={busy}
          onClick={() => void onGoogle()}
        >
          <GoogleGlyph />
          {socialBusy === "google" ? "Connecting…" : "Continue with Google"}
        </button>
        <button
          type="button"
          className={socialButtonClass}
          disabled={busy}
          onClick={() => void onMicrosoft()}
        >
          <MicrosoftGlyph />
          {socialBusy === "microsoft"
            ? "Connecting…"
            : "Continue with Microsoft"}
        </button>
      </div>

      <p className="mt-7 text-center text-[12px] leading-relaxed text-[#7d89a6]">
        Protected health information requires a secure session. Only sign in on
        devices you trust.
      </p>
    </div>
  );
}

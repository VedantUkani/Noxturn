"use client";

import { useState } from "react";
import { signInWithGoogle, signInWithMicrosoft } from "@/lib/supabase";

export default function LoginPage() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    try {
      setLoadingGoogle(true);
      setError(null);
      await signInWithGoogle();
    } catch (e) {
      setError((e as Error).message);
      setLoadingGoogle(false);
    }
  }

  async function handleMicrosoftLogin() {
    try {
      setLoadingMicrosoft(true);
      setError(null);
      await signInWithMicrosoft();
    } catch (e) {
      setError((e as Error).message);
      setLoadingMicrosoft(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-10 shadow-2xl">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to Noxturn</h1>
          <p className="mt-1 text-sm text-gray-400">
            AI-powered fatigue management for shift workers
          </p>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loadingGoogle || loadingMicrosoft}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-700 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-100 disabled:opacity-60"
        >
          {loadingGoogle ? (
            <svg className="h-5 w-5 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {loadingGoogle ? "Redirecting..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-800" />
          <span className="text-xs text-gray-600">or</span>
          <div className="h-px flex-1 bg-gray-800" />
        </div>

        {/* Microsoft Sign In Button */}
        <button
          onClick={handleMicrosoftLogin}
          disabled={loadingGoogle || loadingMicrosoft}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-700 bg-[#2f2f2f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#404040] disabled:opacity-60"
        >
          {loadingMicrosoft ? (
            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 23 23">
              <rect x="1"  y="1"  width="10" height="10" fill="#f25022" />
              <rect x="12" y="1"  width="10" height="10" fill="#7fba00" />
              <rect x="1"  y="12" width="10" height="10" fill="#00a4ef" />
              <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
            </svg>
          )}
          {loadingMicrosoft ? "Redirecting..." : "Continue with Microsoft"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg bg-red-950 px-4 py-2 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          Sign in with Google to import from Google Calendar, or Microsoft to import from Outlook.
        </p>
      </div>
    </main>
  );
}

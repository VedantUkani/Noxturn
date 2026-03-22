"use client";

import { cn } from "@/lib/utils";

export type AuthMode = "sign-in" | "register";

type AuthModeToggleProps = {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
  disabled?: boolean;
  labelledBy?: string;
};

export function AuthModeToggle({
  mode,
  onChange,
  disabled,
  labelledBy,
}: AuthModeToggleProps) {
  return (
    <div
      role="tablist"
      aria-labelledby={labelledBy}
      className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.1] bg-[#0d1833]/80 p-1 shadow-inner shadow-black/30"
    >
      <button
        type="button"
        role="tab"
        id="auth-tab-sign-in"
        aria-selected={mode === "sign-in"}
        aria-controls="auth-panel-credentials"
        tabIndex={0}
        disabled={disabled}
        onClick={() => onChange("sign-in")}
        className={cn(
          "rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a142e]",
          mode === "sign-in"
            ? "bg-[#16264a] text-[#edf2ff] shadow-[inset_0_0_0_1px_rgba(69,224,212,0.18)]"
            : "text-[#98a4bf] hover:bg-white/[0.04] hover:text-[#edf2ff]",
        )}
      >
        Sign in
      </button>
      <button
        type="button"
        role="tab"
        id="auth-tab-register"
        aria-selected={mode === "register"}
        aria-controls="auth-panel-credentials"
        tabIndex={0}
        disabled={disabled}
        onClick={() => onChange("register")}
        className={cn(
          "rounded-xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a142e]",
          mode === "register"
            ? "bg-[#16264a] text-[#edf2ff] shadow-[inset_0_0_0_1px_rgba(69,224,212,0.18)]"
            : "text-[#98a4bf] hover:bg-white/[0.04] hover:text-[#edf2ff]",
        )}
      >
        Create account
      </button>
    </div>
  );
}

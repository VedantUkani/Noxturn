"use client";

import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size    = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:   "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-lg shadow-indigo-900/30",
  secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600",
  ghost:     "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 border border-transparent hover:border-slate-700",
  danger:    "bg-red-900/60 hover:bg-red-800/70 text-red-300 hover:text-red-200 border border-red-800/50",
  success:   "bg-emerald-900/60 hover:bg-emerald-800/70 text-emerald-300 hover:text-emerald-200 border border-emerald-800/50",
};

const SIZES: Record<Size, string> = {
  xs: "h-6  px-2 text-xs  rounded  gap-1",
  sm: "h-8  px-3 text-sm  rounded-md gap-1.5",
  md: "h-9  px-4 text-sm  rounded-lg gap-2",
  lg: "h-11 px-6 text-base rounded-xl gap-2",
};

type Props = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  children,
  className = "",
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "select-none cursor-pointer",
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

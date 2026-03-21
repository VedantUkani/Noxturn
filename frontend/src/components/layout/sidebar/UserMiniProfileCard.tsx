"use client";

import { useRouter } from "next/navigation";
import { DEMO_USER_NAME, DEMO_USER_ROLE } from "@/lib/constants";
import { clearAuthenticated } from "@/lib/auth-browser";
import { cn } from "@/lib/utils";

type UserMiniProfileCardProps = {
  className?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMiniProfileCard({ className }: UserMiniProfileCardProps) {
  const router = useRouter();

  function signOut() {
    clearAuthenticated();
    router.replace("/");
    router.refresh();
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-700/35 bg-[#0a1020]/85 p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400/40 via-teal-600/10 to-slate-900 text-[11px] font-semibold tracking-tight text-teal-50 ring-1 ring-teal-400/25"
          aria-hidden
        >
          {initials(DEMO_USER_NAME)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-tight text-slate-100">
            {DEMO_USER_NAME}
          </p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-slate-500">
            {DEMO_USER_ROLE}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="mt-2 w-full rounded-lg border border-slate-700/50 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/40 hover:text-slate-200"
      >
        Sign out
      </button>
    </div>
  );
}

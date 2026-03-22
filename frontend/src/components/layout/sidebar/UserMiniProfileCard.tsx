"use client";

import { useRouter } from "next/navigation";
import { DEMO_USER_NAME, DEMO_USER_ROLE } from "@/lib/constants";
import { clearAuthenticated } from "@/lib/auth-browser";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

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
        "rounded-xl border border-white/[0.08] bg-[#141f42]/90 p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#45e0d4]/15 text-[11px] font-semibold tracking-tight text-[#45e0d4] ring-1 ring-[#45e0d4]/25"
          aria-hidden
        >
          {initials(DEMO_USER_NAME)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-tight text-[#edf2ff]">
            {DEMO_USER_NAME}
          </p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-[#7d89a6]">
            {DEMO_USER_ROLE}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={signOut}
        className={cn(
          "mt-2 w-full rounded-lg border border-white/[0.08] py-1 text-[11px] font-medium text-[#98a4bf] transition-colors hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-[#edf2ff]",
          nx.focusRing,
        )}
      >
        Sign out
      </button>
    </div>
  );
}

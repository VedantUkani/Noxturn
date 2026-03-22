"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconBell } from "@/components/icons/NavIcons";
import { AccessibilityMenu } from "@/components/accessibility";
import { SettingsMenu } from "@/components/layout/top-bar/SettingsMenu";
import { cn } from "@/lib/utils";
import type { SettingsTopBarModel } from "./types";
import { IconSearchSettings } from "./settings-icons";
import { SETTINGS_LOGIN_HREF } from "./settings-routes";

const inset = "bg-[#0f1b3a]";
const iconBtn =
  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-[#98a4bf] transition-colors hover:bg-white/[0.06] hover:text-[#edf2ff] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/35";

type SettingsTopBarProps = {
  data: SettingsTopBarModel;
  className?: string;
};

export function SettingsTopBar({ data, className }: SettingsTopBarProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center justify-end pb-8 pt-1",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-end gap-3">
        <label className="sr-only" htmlFor="settings-preferences-search">
          Search preferences
        </label>
        <form
          className={cn(
            "flex w-[min(100%,20rem)] items-center gap-2.5 rounded-full border border-white/[0.08] px-4 py-2.5 sm:w-[22rem]",
            inset,
          )}
          onSubmit={(e) => {
            e.preventDefault();
            router.push(SETTINGS_LOGIN_HREF);
          }}
        >
          <IconSearchSettings className="shrink-0 text-[#7d89a6]" />
          <input
            id="settings-preferences-search"
            name="preferences"
            type="search"
            placeholder={data.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#edf2ff] placeholder:text-[#7d89a6] focus:outline-none"
            autoComplete="off"
          />
        </form>
        <Link href={SETTINGS_LOGIN_HREF} className={iconBtn} aria-label="Notifications">
          <IconBell className="h-[18px] w-[18px]" />
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0f1b3a]"
            aria-hidden
          />
        </Link>
        <AccessibilityMenu variant="compact" />
        <SettingsMenu />
      </div>
    </div>
  );
}

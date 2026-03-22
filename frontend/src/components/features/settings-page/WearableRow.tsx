import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { WearableIntegrationModel } from "./types";
import { SETTINGS_LOGIN_HREF } from "./settings-routes";
import { IconCheckSmall } from "./settings-icons";

type WearableRowProps = {
  data: WearableIntegrationModel;
  icon: ReactNode;
  /** Sync / connect flows: placeholder until OAuth is wired */
  actionHref?: string;
};

const actionClass =
  "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/35";

export function WearableRow({
  data,
  icon,
  actionHref = SETTINGS_LOGIN_HREF,
}: WearableRowProps) {
  const isSynced = data.status === "synced";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#0f1b3a] px-4 py-4",
      )}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#07142f] text-[#45e0d4]"
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#edf2ff]">{data.name}</p>
        <p className="mt-0.5 text-xs text-[#98a4bf]">{data.detail}</p>
      </div>
      <div className="shrink-0">
        {isSynced ? (
          <Link
            href={actionHref}
            className={cn(
              actionClass,
              "gap-1.5 border-[#45e0d4]/40 bg-[#45e0d4]/10 text-[#45e0d4] hover:bg-[#45e0d4]/15",
            )}
            aria-label={`${data.name}: manage sync (sign in)`}
          >
            <IconCheckSmall className="text-[#45e0d4]" aria-hidden />
            {data.syncedBadgeLabel ?? "Synced"}
          </Link>
        ) : (
          <Link
            href={actionHref}
            className={cn(
              actionClass,
              "border-[#45e0d4]/55 bg-transparent px-4 text-[#45e0d4] hover:bg-[#45e0d4]/10",
            )}
          >
            {data.connectLabel ?? "Connect"}
          </Link>
        )}
      </div>
    </div>
  );
}

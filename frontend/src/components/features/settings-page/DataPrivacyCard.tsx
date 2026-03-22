import Link from "next/link";
import { IconXMark } from "@/components/icons/NavIcons";
import { cn } from "@/lib/utils";
import type { DataPrivacyModel } from "./types";
import { IconDownloadJson, IconShieldCheck } from "./settings-icons";
import { SETTINGS_LOGIN_HREF } from "./settings-routes";

const card = "rounded-[22px] border border-white/[0.06] bg-[#141f42] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]";

type DataPrivacyCardProps = {
  data: DataPrivacyModel;
};

function ActionIcon({ kind }: { kind: DataPrivacyModel["actions"][0]["kind"] }) {
  if (kind === "export") {
    return <IconDownloadJson className="text-[#45e0d4]" />;
  }
  if (kind === "permissions") {
    return <IconShieldCheck className="text-[#45e0d4]" />;
  }
  return <IconXMark className="h-[18px] w-[18px] text-rose-400/90" />;
}

export function DataPrivacyCard({ data }: DataPrivacyCardProps) {
  return (
    <section
      className={cn("flex h-full min-h-0 flex-col p-6 sm:p-8", card)}
      aria-labelledby="data-privacy-heading"
    >
      <h2 id="data-privacy-heading" className="text-lg font-semibold text-[#edf2ff]">
        {data.cardTitle}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-[#98a4bf]">{data.intro}</p>

      <ul className="mt-6 flex flex-col gap-2">
        {data.actions.map((action) => (
          <li key={action.id}>
            <Link
              href={SETTINGS_LOGIN_HREF}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left text-sm font-medium text-[#edf2ff] transition-colors hover:border-white/[0.08] hover:bg-[#0f1b3a] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/35"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f1b3a]">
                <ActionIcon kind={action.kind} />
              </span>
              {action.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-6">
        <Link
          href={SETTINGS_LOGIN_HREF}
          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7d89a6] transition-colors hover:text-[#edf2ff] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/35"
        >
          {data.policyVersionLabel}
        </Link>
        <Link
          href={SETTINGS_LOGIN_HREF}
          className="inline-flex rounded-full border border-white/[0.08] bg-[#0f1b3a] px-3 py-1.5 text-[11px] font-semibold text-[#45e0d4] transition-colors hover:border-[#45e0d4]/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/35"
        >
          {data.secureNodeLabel}
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProfileAccountModel } from "./types";
import { SETTINGS_LOGIN_HREF } from "./settings-routes";
import { IconCarCommute } from "./settings-icons";

const card = "rounded-[22px] border border-white/[0.06] bg-[#141f42] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]";
const label = "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d89a6]";

type ProfileAccountCardProps = {
  data: ProfileAccountModel;
};

export function ProfileAccountCard({ data }: ProfileAccountCardProps) {
  return (
    <section className={cn("p-6 sm:p-8", card)} aria-labelledby="profile-account-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2
            id="profile-account-heading"
            className="text-lg font-semibold text-[#45e0d4]"
          >
            {data.cardTitle}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#98a4bf]">
            {data.cardSubtitle}
          </p>
        </div>
        <Link
          href={SETTINGS_LOGIN_HREF}
          className="shrink-0 self-start text-sm font-semibold text-[#45e0d4] underline-offset-4 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/35 sm:mt-1"
        >
          {data.editLabel}
        </Link>
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="space-y-8">
          <div>
            <p className={label}>{data.fullNameLabel}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-[#edf2ff]">
              {data.fullName}
            </p>
          </div>
          <div>
            <p className={label}>{data.commuteLabel}</p>
            <p className="mt-2 flex items-center gap-2 text-base font-medium text-[#45e0d4]">
              <IconCarCommute className="shrink-0" />
              <span>{data.commuteMinutes} Minutes</span>
            </p>
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <p className={label}>{data.clinicalRoleLabel}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-lg bg-[#6ea8ff]/25 px-2.5 py-1 text-xs font-semibold text-[#0c1a33]">
                {data.roleBadge}
              </span>
              <span className="text-base font-medium text-[#edf2ff]">
                {data.roleSpecialty}
              </span>
            </div>
          </div>
          <div>
            <p className={label}>{data.emailLabel}</p>
            <p className="mt-2 text-base text-[#98a4bf]">{data.email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

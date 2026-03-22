import { IconShieldPlus } from "./RecoveryIcons";
import type { RecoverySnapshotModel } from "./types";

type RhythmSnapshotCardProps = {
  snapshot: RecoverySnapshotModel;
};

export function RhythmSnapshotCard({ snapshot }: RhythmSnapshotCardProps) {
  return (
    <section
      aria-labelledby="recovery-snapshot-heading"
      className="rounded-[22px] border border-white/[0.06] bg-[#141f42] p-6 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] md:p-7"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex shrink-0 items-start gap-5 sm:items-center">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#0c2a3d] shadow-[inset_0_0_0_1px_rgba(69,224,212,0.25)]">
            <IconShieldPlus className="text-[#45e0d4]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h2 id="recovery-snapshot-heading" className="sr-only">
            Weekly stability snapshot
          </h2>
          <p className="text-[16px] font-medium leading-relaxed text-[#edf2ff] md:text-[17px] lg:text-[18px]">
            {snapshot.headlineLead}
            <span className="font-semibold text-[#45e0d4]">
              {snapshot.protectedCount}/{snapshot.protectedTotal}
            </span>
            {snapshot.headlineTrail}
          </p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d89a6]">
            {snapshot.microLabel}
          </p>
        </div>
      </div>
    </section>
  );
}

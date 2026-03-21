import { SectionCard } from "@/components/cards/SectionCard";

/** Recovery rhythm — non-punitive rhythm UI. */
export function RecoveryPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Recovery — rhythm, not streaks
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Wearable summaries and completed anchors inform whether recovery
          actually happened. Labels like <em>steady</em>,{" "}
          <em>rebuilding</em>, or <em>interrupted</em> describe state — not
          blame.
        </p>
      </div>
      <SectionCard title="What we avoid">
        <p>
          No “failed” days, no lost streaks, no guilt copy. If sleep was thin
          after nights, the UI should suggest the next protective block, not
          chide you for it.
        </p>
      </SectionCard>
      <SectionCard title="Coming next">
        <p>
          Optional wearable import and a compact rhythm readout tied to your
          plan mode will sit here once APIs are connected.
        </p>
      </SectionCard>
    </div>
  );
}

import { SectionCard } from "@/components/cards/SectionCard";

/** Shift sandbox — what-if. */
export function SandboxPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Sandbox — try a shift change
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Add, move, or drop a block and compare circadian strain to your current
          rota before you commit to a swap. Verdicts are advisory — they exist
          to support a conversation with yourself (and scheduling), not to nag.
        </p>
      </div>
      <SectionCard title="What you’ll see">
        <p>
          Original vs projected strain, delta, and a short explanation of the
          recovery bottleneck that moved. Backend route today:{" "}
          <code className="rounded bg-slate-800 px-1 text-xs text-slate-300">
            /simulate
          </code>
          .
        </p>
      </SectionCard>
    </div>
  );
}

import { SectionCard } from "@/components/cards/SectionCard";

export function EvidencePageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Evidence lens
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Short, clinical explanations for why Noxturn suggested a block or
          cutoff—grounded in references, not generic wellness language.
        </p>
      </div>
      <SectionCard title="When this is wired">
        <p>
          Selecting a task or banner on <strong className="text-slate-300">Today</strong>{" "}
          will open citations and plain-language rationale here (or in a
          slide-over). For now, this route holds the shell destination for the
          sidebar button.
        </p>
      </SectionCard>
    </div>
  );
}

"use client";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { type RagItem } from "@/lib/types";
import { useA11y } from "@/contexts/AccessibilityContext";

type Props = {
  open: boolean;
  onClose: () => void;
  taskTitle: string;
  cards: RagItem[];
  evidence: RagItem[];
  loading?: boolean;
};

function ConfidenceBadge({ score }: { score: number }) {
  if (score >= 0.75) return <Badge color="emerald" dot>High confidence</Badge>;
  if (score >= 0.45) return <Badge color="amber" dot>Medium confidence</Badge>;
  return <Badge color="slate" dot>Low confidence</Badge>;
}

function EvidenceItem({ item }: { item: RagItem }) {
  const title = item.title ?? item.name ?? "Unnamed";
  const body  = item.content ?? item.evidence_note ?? item.when_it_applies ?? "";

  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <ConfidenceBadge score={item.score} />
      </div>
      {body && <p className="text-xs text-slate-400 leading-relaxed">{body}</p>}
      <p className="text-xs text-slate-600 tabular-nums">similarity: {(item.score * 100).toFixed(0)}%</p>
    </div>
  );
}

export function EvidenceModal({ open, onClose, taskTitle, cards, evidence, loading = false }: Props) {
  const { t } = useA11y();
  const allItems = [...cards, ...evidence];

  return (
    <Modal open={open} onClose={onClose} title={t("dashboard", "evidenceLens")} size="md">
      <div className="space-y-4">
        {/* Task */}
        <div className="rounded-lg bg-indigo-950/40 border border-indigo-800/40 px-3 py-2.5">
          <p className="text-xs text-indigo-400 mb-1 uppercase tracking-wider">{t("dashboard", "task")}</p>
          <p className="text-sm font-semibold text-slate-100">{taskTitle}</p>
        </div>

        {/* Explanation */}
        <p className="text-sm text-slate-400">
          {t("dashboard", "evidenceReason")}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : allItems.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {allItems.length} matched {allItems.length === 1 ? "source" : "sources"}
            </p>
            {allItems.map((item) => (
              <EvidenceItem key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Card variant="flat" padding="md">
            <p className="text-sm text-slate-500 text-center">{t("dashboard", "noEvidenceText")}</p>
          </Card>
        )}
      </div>
    </Modal>
  );
}

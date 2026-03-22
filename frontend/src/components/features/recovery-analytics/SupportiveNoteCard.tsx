import { IconSparklesThree } from "./RecoveryIcons";
import type { RecoverySupportiveNoteModel } from "./types";

type SupportiveNoteCardProps = {
  data: RecoverySupportiveNoteModel;
};

export function SupportiveNoteCard({ data }: SupportiveNoteCardProps) {
  return (
    <section
      aria-labelledby="supportive-note-title"
      className="flex h-full min-h-[280px] flex-col rounded-[22px] border border-white/[0.06] bg-[#16264a] p-6 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] md:min-h-[320px] md:p-7"
    >
      <div className="flex items-center gap-2 text-[#edf2ff]">
        <IconSparklesThree />
      </div>
      <h2
        id="supportive-note-title"
        className="mt-4 text-lg font-semibold tracking-tight text-[#edf2ff] md:text-xl"
      >
        {data.title}
      </h2>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-[#98a4bf]">
        <p className="italic">&ldquo;{data.quote}&rdquo;</p>
      </blockquote>
      <div className="mt-6">
        <div className="h-px w-14 rounded-full bg-[#45e0d4]/90" />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d89a6]">
          {data.footerLabel}
        </p>
      </div>
    </section>
  );
}

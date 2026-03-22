"use client";

import { useRef, useState } from "react";
import type { OnboardingDraft } from "../types";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { nx } from "@/lib/ui-theme";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp";
const MAX_MB = 10;

type Props = {
  draft: OnboardingDraft;
  onChange: (patch: Partial<OnboardingDraft>) => void;
};

export function HealthReportStep({ draft, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);

    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadError(`File too large. Max size is ${MAX_MB} MB.`);
      return;
    }

    if (!supabase) {
      setUploadError("Supabase is not configured.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      setUploadError("You must be signed in to upload a health report.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${userId}/report.${ext}`;

      const { error } = await supabase.storage
        .from("health-reports")
        .upload(path, file, { upsert: true });

      if (error) throw new Error(error.message);

      onChange({
        healthReportPath: path,
        healthReportFileName: file.name,
        healthReportSkipped: false,
      });
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const handleRemove = async () => {
    if (!supabase || !draft.healthReportPath) return;
    await supabase.storage.from("health-reports").remove([draft.healthReportPath]);
    onChange({ healthReportPath: null, healthReportFileName: null });
  };

  const uploaded = !!draft.healthReportPath;

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        onChange={handleInputChange}
      />

      {uploaded ? (
        <div className="flex items-center gap-4 rounded-[22px] border border-[#45e0d4]/40 bg-[#0c2a3d] p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#45e0d4]/10">
            <svg className="h-5 w-5 text-[#45e0d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#45e0d4]">Report uploaded</p>
            <p className="mt-0.5 truncate text-xs text-[#7d89a6]">{draft.healthReportFileName}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-[#98a4bf] hover:text-[#edf2ff] transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-[#7d89a6] hover:text-[#ff8a8a] transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          disabled={uploading}
          className={cn(
            "w-full rounded-[22px] border-2 border-dashed border-white/[0.12] bg-[#0d1530]/50 px-6 py-10",
            "flex flex-col items-center gap-3 text-center transition-all",
            "hover:border-[#45e0d4]/30 hover:bg-[#0c1f3d]/40",
            uploading && "opacity-60 pointer-events-none",
            nx.focusRing,
          )}
        >
          {uploading ? (
            <>
              <svg className="h-8 w-8 animate-spin text-[#45e0d4]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-sm text-[#98a4bf]">Uploading…</p>
            </>
          ) : (
            <>
              <svg className="h-8 w-8 text-[#7d89a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[#edf2ff]">
                  Upload health report
                </p>
                <p className="mt-1 text-xs text-[#7d89a6]">
                  PDF, JPG, PNG up to {MAX_MB} MB — drag & drop or click
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {uploadError && (
        <p className="rounded-xl border border-red-800/40 bg-red-950/35 px-3 py-2.5 text-xs text-red-300">
          {uploadError}
        </p>
      )}

      {!uploaded && (
        <button
          type="button"
          onClick={() => onChange({ healthReportSkipped: true })}
          className="w-full rounded-[22px] border border-white/[0.06] bg-transparent py-3 text-sm text-[#7d89a6] hover:text-[#98a4bf] hover:border-white/[0.1] transition-all"
        >
          {draft.healthReportSkipped ? "✓ Skipping for now" : "I don't have one right now"}
        </button>
      )}
    </div>
  );
}

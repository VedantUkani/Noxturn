"use client";

import { useState } from "react";

import { postJson } from "@/lib/api";
import { getOrCreateUserId, getStoredScheduleBlocks, type ScheduleBlockInput } from "@/lib/session";

type SandboxResponse = {
  original_strain_score: number;
  projected_strain_score: number;
  strain_delta: number;
  verdict: string;
  explanation: string;
};

export default function SandboxPage() {
  const [userId] = useState(() => (typeof window === "undefined" ? "" : getOrCreateUserId()));
  const [currentBlocks] = useState<ScheduleBlockInput[]>(() =>
    typeof window === "undefined" ? [] : getStoredScheduleBlocks(),
  );
  const [commuteMinutes] = useState(() => {
    if (typeof window === "undefined") return 45;
    const stored = getStoredScheduleBlocks();
    return stored[0]?.commute_before_minutes || 45;
  });
  const [blockType, setBlockType] = useState<"day_shift" | "night_shift" | "evening_shift">("day_shift");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<SandboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function simulate() {
    if (!userId) {
      setError("Session not ready yet. Retry in a moment.");
      return;
    }
    if (!currentBlocks.length) {
      setError("No current schedule found. Import schedule on Onboarding first.");
      return;
    }
    if (!date || !start || !end) {
      setError("Enter a full hypothetical shift (date, start, and end).");
      return;
    }
    try {
      setError(null);
      const hypotheticalShift: ScheduleBlockInput = {
        block_type: blockType,
        title: title || "Hypothetical Shift",
        start_time: `${date}T${start}:00`,
        end_time: `${date}T${end}:00`,
        commute_before_minutes: commuteMinutes,
        commute_after_minutes: commuteMinutes,
      };
      const data = await postJson<SandboxResponse>("/simulate/shift-sandbox", {
        user_id: userId,
        current_blocks: currentBlocks,
        hypothetical_shifts: [hypotheticalShift],
        commute_minutes: commuteMinutes,
      });
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Shift Sandbox</h1>
      <section className="rounded border p-4">
        <h2 className="mb-2 font-semibold">Hypothetical shift</h2>
        <div className="grid gap-2 sm:grid-cols-5">
          <select
            className="rounded border px-2 py-1 text-sm"
            value={blockType}
            onChange={(e) => setBlockType(e.target.value as "day_shift" | "night_shift" | "evening_shift")}
          >
            <option value="day_shift">day_shift</option>
            <option value="night_shift">night_shift</option>
            <option value="evening_shift">evening_shift</option>
          </select>
          <input
            className="rounded border px-2 py-1 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <input type="date" className="rounded border px-2 py-1 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" className="rounded border px-2 py-1 text-sm" value={start} onChange={(e) => setStart(e.target.value)} />
          <input type="time" className="rounded border px-2 py-1 text-sm" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </section>
      <button className="w-fit rounded bg-black px-4 py-2 text-white" onClick={simulate}>
        Run Simulation
      </button>
      {error && <p className="text-red-600">{error}</p>}
      {result && (
        <pre className="overflow-auto rounded border bg-zinc-50 p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}

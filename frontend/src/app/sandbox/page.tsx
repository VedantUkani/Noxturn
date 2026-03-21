"use client";

import { useState } from "react";

import { postJson } from "@/lib/api";

type SandboxResponse = {
  original_strain_score: number;
  projected_strain_score: number;
  strain_delta: number;
  verdict: string;
  explanation: string;
};

export default function SandboxPage() {
  const [result, setResult] = useState<SandboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function simulate() {
    try {
      setError(null);
      const data = await postJson<SandboxResponse>("/simulate/shift-sandbox", {
        current_blocks: [
          {
            block_type: "night_shift",
            title: "Night",
            start_time: "2026-03-21T19:00:00",
            end_time: "2026-03-22T07:00:00",
            commute_before_minutes: 45,
            commute_after_minutes: 45,
          },
        ],
        hypothetical_shifts: [
          {
            block_type: "day_shift",
            title: "Potential Pick-up",
            start_time: "2026-03-22T15:00:00",
            end_time: "2026-03-22T23:00:00",
            commute_before_minutes: 45,
            commute_after_minutes: 45,
          },
        ],
        commute_minutes: 45,
      });
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Shift Sandbox</h1>
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

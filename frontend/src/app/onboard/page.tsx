"use client";

import { useState } from "react";

import { postJson } from "@/lib/api";

type ImportResponse = {
  blocks: Array<{ id: string; block_type: string; start_time: string; end_time: string }>;
  warnings: string[];
  parse_confidence: number;
};

type ManualBlock = {
  block_type: "day_shift" | "night_shift" | "evening_shift" | "off_day";
  title: string;
  date: string;
  start: string;
  end: string;
};

export default function OnboardPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("nurse");
  const [commute, setCommute] = useState(45);
  const [sleepConstraint, setSleepConstraint] = useState("cant_sleep_before_9am");
  const [buddyOptIn, setBuddyOptIn] = useState(true);
  const [text, setText] = useState("night_shift,2026-03-21T19:00:00,2026-03-22T07:00:00,ICU Night");
  const [manualBlocks, setManualBlocks] = useState<ManualBlock[]>([]);
  const [form, setForm] = useState<ManualBlock>({
    block_type: "night_shift",
    title: "Manual Shift",
    date: "2026-03-21",
    start: "19:00",
    end: "07:00",
  });
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onParse() {
    try {
      setError(null);
      const data = await postJson<ImportResponse>("/schedule/import", {
        raw_text: text,
        commute_minutes: commute,
      });
      setResult(data);
      setStep(4);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onSubmitManual() {
    try {
      setError(null);
      const blocks = manualBlocks.map((b) => {
        const startIso = `${b.date}T${b.start}:00`;
        const endIso = `${b.date}T${b.end}:00`;
        return {
          block_type: b.block_type,
          title: b.title,
          start_time: startIso,
          end_time: endIso,
          commute_before_minutes: commute,
          commute_after_minutes: commute,
        };
      });
      const data = await postJson<ImportResponse>("/schedule/import", {
        blocks,
        commute_minutes: commute,
      });
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Onboarding</h1>
      <p className="text-sm text-zinc-600">Step {step}/4</p>
      {step === 1 && (
        <section className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Role</h2>
          <div className="flex gap-2">
            {["nurse", "resident", "student"].map((r) => (
              <button
                key={r}
                className={`rounded border px-3 py-2 text-sm ${role === r ? "bg-black text-white" : ""}`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="mt-3 rounded bg-black px-4 py-2 text-white" onClick={() => setStep(2)}>
            Next
          </button>
        </section>
      )}
      {step === 2 && (
        <section className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Commute time (minutes)</h2>
          <input
            type="number"
            min="0"
            max="180"
            className="w-32 rounded border px-2 py-1"
            value={commute}
            onChange={(e) => setCommute(Number(e.target.value))}
          />
          <div className="mt-3 flex gap-2">
            <button className="rounded border px-4 py-2" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="rounded bg-black px-4 py-2 text-white" onClick={() => setStep(3)}>
              Next
            </button>
          </div>
        </section>
      )}
      {step === 3 && (
        <section className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Sleep constraints + buddy</h2>
          <label className="mb-3 flex flex-col gap-1 text-sm">
            Sleep constraint
            <select
              className="rounded border px-2 py-1"
              value={sleepConstraint}
              onChange={(e) => setSleepConstraint(e.target.value)}
            >
              <option value="cant_sleep_before_9am">Can&apos;t sleep before 9 AM after nights</option>
              <option value="light_sensitive">Light sensitive before sleep</option>
              <option value="short_sleep_risk">Frequently short sleep after shifts</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={buddyOptIn} onChange={(e) => setBuddyOptIn(e.target.checked)} />
            Buddy check-ins enabled
          </label>
          <div className="mt-3 flex gap-2">
            <button className="rounded border px-4 py-2" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="rounded bg-black px-4 py-2 text-white" onClick={() => setStep(4)}>
              Next
            </button>
          </div>
        </section>
      )}
      {step === 4 && (
        <section className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Schedule entry</h2>
          <p className="mb-2 text-sm text-zinc-600">Paste shifts text</p>
          <textarea
            className="min-h-40 w-full rounded border p-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-3 flex gap-2">
            <button className="rounded border px-4 py-2" onClick={() => setStep(3)}>
              Back
            </button>
            <button className="rounded bg-black px-4 py-2 text-white" onClick={onParse}>
              Parse Schedule
            </button>
          </div>
          <div className="mt-5 border-t pt-4">
            <p className="mb-2 text-sm text-zinc-600">Or add manual shifts</p>
            <div className="grid gap-2 sm:grid-cols-5">
              <select
                className="rounded border px-2 py-1 text-sm"
                value={form.block_type}
                onChange={(e) => setForm((s) => ({ ...s, block_type: e.target.value as ManualBlock["block_type"] }))}
              >
                <option value="day_shift">day_shift</option>
                <option value="night_shift">night_shift</option>
                <option value="evening_shift">evening_shift</option>
                <option value="off_day">off_day</option>
              </select>
              <input
                className="rounded border px-2 py-1 text-sm"
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                placeholder="Title"
              />
              <input
                type="date"
                className="rounded border px-2 py-1 text-sm"
                value={form.date}
                onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
              />
              <input
                type="time"
                className="rounded border px-2 py-1 text-sm"
                value={form.start}
                onChange={(e) => setForm((s) => ({ ...s, start: e.target.value }))}
              />
              <input
                type="time"
                className="rounded border px-2 py-1 text-sm"
                value={form.end}
                onChange={(e) => setForm((s) => ({ ...s, end: e.target.value }))}
              />
            </div>
            <div className="mt-2 flex gap-2">
              <button
                className="rounded border px-3 py-1 text-sm"
                onClick={() => setManualBlocks((list) => [...list, form])}
              >
                Add shift
              </button>
              <button className="rounded bg-black px-3 py-1 text-sm text-white" onClick={onSubmitManual}>
                Submit manual schedule
              </button>
            </div>
            {manualBlocks.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-xs text-zinc-700">
                {manualBlocks.map((b, i) => (
                  <li key={`${b.title}-${i}`}>
                    {b.block_type} | {b.date} {b.start}-{b.end} | {b.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
      {error && <p className="text-red-600">{error}</p>}
      <section className="rounded border bg-zinc-50 p-3 text-xs">
        <p>Role: {role}</p>
        <p>Commute: {commute} min</p>
        <p>Sleep constraint: {sleepConstraint}</p>
        <p>Buddy opt-in: {buddyOptIn ? "yes" : "no"}</p>
      </section>
      {result && (
        <pre className="overflow-auto rounded border bg-zinc-50 p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { postJson } from "@/lib/api";
import { getOrCreateUserId, storeScheduleBlocks } from "@/lib/session";
import { type ImportResponse, type BlockType } from "@/lib/types";
import { fetchGoogleCalendarEvents, fetchOutlookCalendarEvents, eventsToBlocks } from "@/lib/calendarImport";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea, RangeInput } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { IconCheck, IconAlertTriangle, IconChevronRight, IconChevronLeft, IconArrowRight } from "@/components/icons";

const STEPS = [
  { num: 1, label: "Role" },
  { num: 2, label: "Commute" },
  { num: 3, label: "Preferences" },
  { num: 4, label: "Schedule" },
];

const ROLES = [
  { id: "nurse",          label: "Nurse / RN",           emoji: "🏥", desc: "ICU, ER, or ward rotations" },
  { id: "paramedic",      label: "Paramedic / EMT",       emoji: "🚑", desc: "24-on / 48-off schedules" },
  { id: "factory_worker", label: "Factory / Shift Worker", emoji: "🏭", desc: "Rotating 8h or 12h shifts" },
  { id: "resident",       label: "Medical Resident",      emoji: "⚕️",  desc: "Long call rotations" },
  { id: "other",          label: "Other",                 emoji: "👤", desc: "Any rotating schedule" },
];

const SLEEP_CONSTRAINTS = [
  { value: "cant_sleep_before_9am",  label: "Can't sleep before 9 AM after nights" },
  { value: "light_sensitive",        label: "Light sensitive before sleep" },
  { value: "short_sleep_risk",       label: "Frequently short sleep after shifts" },
  { value: "none",                   label: "No specific constraint" },
];

type ManualBlock = {
  block_type: BlockType;
  title: string;
  date: string;
  start: string;
  end: string;
};

const EMPTY_BLOCK: ManualBlock = {
  block_type: "night_shift", title: "", date: "", start: "", end: "",
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map(({ num, label }) => (
        <div key={num} className="flex items-center gap-2">
          <div className={[
            "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold border transition-all",
            current === num
              ? "bg-indigo-600 border-indigo-500 text-white"
              : current > num
              ? "bg-emerald-900/60 border-emerald-700 text-emerald-400"
              : "bg-slate-800 border-slate-700 text-slate-500",
          ].join(" ")}>
            {current > num ? <IconCheck size={12} /> : num}
          </div>
          <span className={`text-xs hidden sm:inline ${current === num ? "text-slate-200 font-medium" : "text-slate-500"}`}>
            {label}
          </span>
          {num < STEPS.length && (
            <div className={`w-8 sm:w-12 h-px ${current > num ? "bg-indigo-700" : "bg-slate-800"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardPage() {
  const [userId]     = useState(() => typeof window === "undefined" ? "" : getOrCreateUserId());
  const [step, setStep] = useState(1);

  // Step 1
  const [role, setRole] = useState("nurse");
  // Step 2
  const [commute, setCommute] = useState(35);
  // Step 3
  const [sleepConstraint, setSleepConstraint] = useState("cant_sleep_before_9am");
  const [buddyOptIn, setBuddyOptIn]           = useState(true);
  // Step 4
  const [mode, setMode]           = useState<"text" | "manual">("text");
  const [text, setText]           = useState("");
  const [manualBlocks, setManualBlocks] = useState<ManualBlock[]>([]);
  const [form, setForm]           = useState<ManualBlock>(EMPTY_BLOCK);

  const [result, setResult]       = useState<ImportResponse | null>(null);
  const [loading, setLoading]     = useState(false);
  const [calLoading, setCalLoading] = useState<"google" | "outlook" | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [toast, setToast]         = useState<string | null>(null);

  async function parseText() {
    if (!userId) { setError("Session not ready."); return; }
    if (!text.trim()) { setError("Enter some schedule text first."); return; }
    setLoading(true); setError(null);
    try {
      const data = await postJson<ImportResponse>("/schedule/import", {
        user_id: userId, raw_text: text, commute_minutes: commute,
      });
      storeScheduleBlocks(data.blocks.map((b) => ({
        id: b.id,
        block_type: b.block_type as BlockType,
        title: b.title,
        start_time: b.start_time,
        end_time: b.end_time,
        commute_before_minutes: commute,
        commute_after_minutes: commute,
      })));
      setResult(data);
      setToast("Schedule imported successfully");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function importFromCalendar(source: "google" | "outlook") {
    if (!userId) { setError("Session not ready."); return; }
    setCalLoading(source); setError(null);
    try {
      const events = source === "google"
        ? await fetchGoogleCalendarEvents(14)
        : await fetchOutlookCalendarEvents(14);

      if (!events.length) {
        setError("No calendar events found in the next 14 days.");
        return;
      }

      const blocks = eventsToBlocks(events, commute);
      const data = await postJson<ImportResponse>("/schedule/import", {
        user_id: userId,
        blocks,
        commute_minutes: commute,
      });
      storeScheduleBlocks(data.blocks.map((b) => ({
        id: b.id,
        block_type: b.block_type as BlockType,
        title: b.title,
        start_time: b.start_time,
        end_time: b.end_time,
        commute_before_minutes: commute,
        commute_after_minutes: commute,
      })));
      setResult(data);
      setToast(`${events.length} events imported from ${source === "google" ? "Google Calendar" : "Outlook"}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCalLoading(null);
    }
  }

  async function submitManual() {
    if (!userId) { setError("Session not ready."); return; }
    if (!manualBlocks.length) { setError("Add at least one shift first."); return; }
    setLoading(true); setError(null);
    try {
      const blocks = manualBlocks.map((b) => ({
        block_type: b.block_type,
        title: b.title || b.block_type,
        start_time: `${b.date}T${b.start}:00`,
        end_time:   `${b.date}T${b.end}:00`,
        commute_before_minutes: commute,
        commute_after_minutes:  commute,
      }));
      const data = await postJson<ImportResponse>("/schedule/import", {
        user_id: userId, blocks, commute_minutes: commute,
      });
      storeScheduleBlocks(data.blocks.map((b) => ({
        id: b.id,
        block_type: b.block_type as BlockType,
        title: b.title,
        start_time: b.start_time,
        end_time: b.end_time,
        commute_before_minutes: commute,
        commute_after_minutes: commute,
      })));
      setResult(data);
      setToast("Schedule imported successfully");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function addBlock() {
    if (!form.date || !form.start || !form.end) {
      setError("Fill in date, start, and end time."); return;
    }
    setManualBlocks((list) => [...list, form]);
    setForm(EMPTY_BLOCK);
    setError(null);
  }

  return (
    <AppShell title="Onboarding">
      <div className="max-w-2xl mx-auto">
        <StepIndicator current={step} />

        {/* ── Step 1: Role ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">What&apos;s your role?</h2>
              <p className="text-sm text-slate-400">This helps us tailor your recovery plan and communication tone.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {ROLES.map(({ id, label, emoji, desc }) => (
                <button
                  key={id}
                  onClick={() => setRole(id)}
                  className={[
                    "flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150",
                    role === id
                      ? "bg-indigo-950/60 border-indigo-700 shadow-lg shadow-indigo-950/30"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700",
                  ].join(" ")}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  {role === id && (
                    <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <IconCheck size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setStep(2)}>
                Continue <IconChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Commute ── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">How long is your commute?</h2>
              <p className="text-sm text-slate-400">Used to calculate available rest time between shifts.</p>
            </div>
            <Card variant="default" padding="lg">
              <RangeInput
                label="One-way commute"
                value={commute}
                min={0}
                max={120}
                step={5}
                unit=" min"
                onChange={setCommute}
              />
              <div className="mt-4 rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2.5">
                <p className="text-xs text-slate-500">
                  With a <span className="text-slate-300 font-medium">{commute} minute</span> commute,
                  you need at least <span className="text-slate-300 font-medium">{11 + Math.round(commute / 30) * 0.5}h</span> between
                  shifts to avoid a short-turnaround risk episode.
                </p>
              </div>
            </Card>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <IconChevronLeft size={14} /> Back
              </Button>
              <Button variant="primary" onClick={() => setStep(3)}>
                Continue <IconChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preferences ── */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">Sleep preferences</h2>
              <p className="text-sm text-slate-400">Helps personalise your plan&apos;s sleep timing recommendations.</p>
            </div>
            <Card variant="default" padding="lg">
              <div className="space-y-5">
                <Select
                  label="Sleep constraint"
                  value={sleepConstraint}
                  onChange={(e) => setSleepConstraint(e.target.value)}
                >
                  {SLEEP_CONSTRAINTS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>

                <button
                  onClick={() => setBuddyOptIn((v) => !v)}
                  className={[
                    "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                    buddyOptIn
                      ? "bg-indigo-950/50 border-indigo-800/50"
                      : "bg-slate-900 border-slate-800",
                  ].join(" ")}
                >
                  <div className={[
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                    buddyOptIn ? "bg-indigo-600 border-indigo-500" : "border-slate-600",
                  ].join(" ")}>
                    {buddyOptIn && <IconCheck size={10} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Enable buddy check-ins</p>
                    <p className="text-xs text-slate-500 mt-0.5">Receive check-in reminders from your support network</p>
                  </div>
                </button>
              </div>
            </Card>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <IconChevronLeft size={14} /> Back
              </Button>
              <Button variant="primary" onClick={() => setStep(4)}>
                Continue <IconChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Schedule ── */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">Import your schedule</h2>
              <p className="text-sm text-slate-400">Connect your calendar, paste shift text, or add shifts manually.</p>
            </div>

            {/* ── Calendar import buttons ── */}
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Import from calendar</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Google Calendar */}
                <button
                  onClick={() => importFromCalendar("google")}
                  disabled={calLoading !== null}
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-slate-700 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  {calLoading === "google" ? (
                    <svg className="h-4 w-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  {calLoading === "google" ? "Importing..." : "Import from Google Calendar"}
                </button>

                {/* Outlook */}
                <button
                  onClick={() => importFromCalendar("outlook")}
                  disabled={calLoading !== null}
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-slate-700 bg-[#0078d4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#106ebe] disabled:opacity-50 transition-colors"
                >
                  {calLoading === "outlook" ? (
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="white">
                      <path d="M24 12.204C24 5.671 18.627 0 12 0S0 5.671 0 12.204C0 18.1 4.388 23.019 10.125 23.88V15.75H7.078v-3.546h3.047v-2.704c0-3.044 1.793-4.722 4.522-4.722 1.313 0 2.686.236 2.686.236v2.99H15.83c-1.491 0-1.956.935-1.956 1.893v2.307h3.328l-.532 3.546h-2.796v8.13C19.612 23.019 24 18.1 24 12.204z"/>
                    </svg>
                  )}
                  {calLoading === "outlook" ? "Importing..." : "Import from Outlook"}
                </button>
              </div>
              <p className="text-xs text-slate-500">Fetches next 14 days of events. You must be signed in with Google or Microsoft.</p>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1 gap-1">
              {(["text", "manual"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={[
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                    mode === m
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200",
                  ].join(" ")}
                >
                  {m === "text" ? "Paste text" : "Add manually"}
                </button>
              ))}
            </div>

            {mode === "text" && (
              <Card variant="default" padding="md">
                <Textarea
                  label="Schedule text"
                  hint='CSV format: block_type,start_ISO,end_ISO  e.g. "night_shift,2025-01-01T22:00:00,2025-01-02T06:00:00"'
                  placeholder={"night_shift,2025-01-10T22:00:00,2025-01-11T06:00:00\nday_shift,2025-01-12T07:00:00,2025-01-12T19:00:00"}
                  rows={6}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={loading}
                  onClick={parseText}
                  className="mt-3"
                >
                  Parse & import
                </Button>
              </Card>
            )}

            {mode === "manual" && (
              <Card variant="default" padding="md">
                <div className="space-y-3 mb-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Select
                      label="Shift type"
                      value={form.block_type}
                      onChange={(e) => setForm((s) => ({ ...s, block_type: e.target.value as BlockType }))}
                    >
                      <option value="day_shift">Day shift</option>
                      <option value="night_shift">Night shift</option>
                      <option value="evening_shift">Evening shift</option>
                      <option value="off_day">Day off</option>
                    </Select>
                    <Input
                      label="Title (optional)"
                      placeholder="e.g. ICU Ward A"
                      value={form.title}
                      onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
                    <Input label="Start" type="time" value={form.start} onChange={(e) => setForm((s) => ({ ...s, start: e.target.value }))} />
                    <Input label="End"   type="time" value={form.end}   onChange={(e) => setForm((s) => ({ ...s, end:   e.target.value }))} />
                  </div>
                  <Button variant="secondary" size="sm" onClick={addBlock}>
                    Add shift
                  </Button>
                </div>

                {manualBlocks.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Added shifts</p>
                    {manualBlocks.map((b, i) => (
                      <div key={`${b.date}-${i}`} className="flex items-center justify-between rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Badge color="indigo" size="xs">{b.block_type.replace("_", " ")}</Badge>
                          <span className="text-xs text-slate-300">{b.date} · {b.start}–{b.end}</span>
                        </div>
                        <button
                          onClick={() => setManualBlocks((list) => list.filter((_, j) => j !== i))}
                          className="text-slate-600 hover:text-red-400 text-xs transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={loading}
                  onClick={submitManual}
                  disabled={manualBlocks.length === 0}
                >
                  Import {manualBlocks.length} shift{manualBlocks.length !== 1 ? "s" : ""}
                </Button>
              </Card>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-800/40 px-3 py-2.5 text-sm text-red-300">
                <IconAlertTriangle size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Success result */}
            {result && (
              <Card variant="flat" padding="md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-900/60 border border-emerald-700 flex items-center justify-center">
                    <IconCheck size={11} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-100">
                    {result.blocks.length} shifts imported
                  </p>
                  <Badge color="emerald" size="xs">{Math.round(result.parse_confidence * 100)}% confidence</Badge>
                </div>
                {result.warnings.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {result.warnings.map((w) => (
                      <li key={w} className="text-xs text-amber-400 flex items-center gap-1.5">
                        <IconAlertTriangle size={11} className="shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/dashboard">
                  <Button variant="primary" fullWidth>
                    Go to Dashboard <IconArrowRight size={14} />
                  </Button>
                </Link>
              </Card>
            )}

            <div className="flex justify-start">
              <Button variant="ghost" onClick={() => setStep(3)}>
                <IconChevronLeft size={14} /> Back
              </Button>
            </div>
          </div>
        )}

        {/* Summary strip */}
        {step > 1 && (
          <div className="mt-8 rounded-xl bg-slate-900/50 border border-slate-800/50 px-4 py-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Role: <span className="text-slate-300">{role}</span></span>
            {step > 2 && <span>Commute: <span className="text-slate-300">{commute} min</span></span>}
            {step > 3 && <span>Constraint: <span className="text-slate-300">{sleepConstraint.replace(/_/g, " ")}</span></span>}
          </div>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </AppShell>
  );
}

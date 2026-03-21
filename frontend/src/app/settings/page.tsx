"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { IconCheck, IconUser, IconShield } from "@/components/icons";

const PERSONAS = [
  {
    id: "nurse_icu",
    label: "ICU / ER Nurse",
    emoji: "🏥",
    shift: "Rotating 12h (nights + days)",
    commute: "35 min",
    tone: "Clinical, supportive",
    priority: "Sleep protection, bright light, buddy check-in",
  },
  {
    id: "paramedic",
    label: "Paramedic / EMT",
    emoji: "🚑",
    shift: "24 on / 48 off",
    commute: "20 min",
    tone: "Direct, practical",
    priority: "Caffeine cutoff, movement, safe commute",
  },
  {
    id: "factory_worker",
    label: "Shift / Factory Worker",
    emoji: "🏭",
    shift: "Rotating 8h",
    commute: "25 min",
    tone: "Grounded, direct",
    priority: "Meal timing, decompression, consistency",
  },
];

export default function SettingsPage() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function savePersona() {
    if (!selectedPersona) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("noxturn_persona", selectedPersona);
    }
    setToast("Persona saved");
  }

  function clearSession() {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    setToast("Session cleared — reload the page");
  }

  return (
    <AppShell title="Settings">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Persona */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">Persona</h2>
            <p className="text-sm text-slate-400">
              Selecting a persona tailors Claude AI plans to your shift pattern, risk profile, and preferred communication tone.
            </p>
          </div>

          <div className="space-y-3">
            {PERSONAS.map(({ id, label, emoji, shift, commute, tone, priority }) => (
              <button
                key={id}
                onClick={() => setSelectedPersona(id)}
                className={[
                  "w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-150",
                  selectedPersona === id
                    ? "bg-indigo-950/60 border-indigo-700"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700",
                ].join(" ")}
              >
                <span className="text-3xl shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-100">{label}</p>
                    {selectedPersona === id && <Badge color="indigo" size="xs">selected</Badge>}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1 text-xs text-slate-500">
                    <span>Shift: {shift}</span>
                    <span>Commute: {commute}</span>
                    <span>Tone: {tone}</span>
                    <span className="sm:col-span-1 truncate">Focus: {priority.split(",")[0]}</span>
                  </div>
                </div>
                {selectedPersona === id && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <IconCheck size={10} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            disabled={!selectedPersona}
            onClick={savePersona}
          >
            Save persona
          </Button>
        </section>

        {/* Session */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">Session</h2>
            <p className="text-sm text-slate-400">
              Noxturn uses a local UUID stored in your browser. No account required.
            </p>
          </div>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                <IconUser size={14} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Local session</p>
                <p className="text-xs text-slate-500">Stored in localStorage · no server account</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={clearSession}>
              Clear session data
            </Button>
          </Card>
        </section>

        {/* About */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">About Noxturn</h2>
          </div>
          <Card variant="flat" padding="md">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <IconShield size={14} className="text-white" />
              </div>
              <div className="space-y-1 text-sm text-slate-400">
                <p>Noxturn is a circadian fatigue detection and recovery planning system built for healthcare and shift workers.</p>
                <p>Plans are grounded in clinical evidence from NIOSH, sleep medicine, and occupational health research.</p>
                <p className="text-slate-600 text-xs mt-2">Built for HackASU · FastAPI + Next.js 16 + Claude AI</p>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </AppShell>
  );
}

import Link from "next/link";
import {
  IconActivity, IconShield, IconZap, IconMoon, IconCalendar,
  IconArrowRight, IconChevronRight,
} from "@/components/icons";
import { AccessibilityButton } from "@/components/ui/AccessibilityButton";
import { NavAuthButtons } from "@/components/ui/NavAuthButtons";

const FEATURES = [
  {
    icon: IconShield,
    title: "4-Risk Detection",
    desc: "Detects rapid flips, short turnarounds, low recovery windows, and unsafe drive events in your shift schedule.",
    color: "text-indigo-400",
    bg: "bg-indigo-950/50 border-indigo-800/40",
  },
  {
    icon: IconActivity,
    title: "AI Recovery Plans",
    desc: "Rule-based and Claude AI planners generate personalised task schedules grounded in clinical circadian evidence.",
    color: "text-violet-400",
    bg: "bg-violet-950/50 border-violet-800/40",
  },
  {
    icon: IconZap,
    title: "RAG Evidence",
    desc: "Every recommendation is backed by real clinical research. View the source evidence for any task in one tap.",
    color: "text-amber-400",
    bg: "bg-amber-950/50 border-amber-800/40",
  },
  {
    icon: IconMoon,
    title: "Wearable Sync",
    desc: "Import sleep hours, restlessness, and resting HR to calculate your recovery score and rhythm status.",
    color: "text-cyan-400",
    bg: "bg-cyan-950/50 border-cyan-800/40",
  },
  {
    icon: IconCalendar,
    title: "Shift Sandbox",
    desc: "Test hypothetical schedule changes before accepting them. See the projected strain delta instantly.",
    color: "text-emerald-400",
    bg: "bg-emerald-950/50 border-emerald-800/40",
  },
  {
    icon: IconShield,
    title: "Persona-Aware",
    desc: "Plans adapt to your role — nurse, paramedic, or factory worker — with tone and priorities matched to your context.",
    color: "text-rose-400",
    bg: "bg-rose-950/50 border-rose-800/40",
  },
];

const STEPS = [
  { num: "01", title: "Import your shifts", desc: "Paste a schedule, add manually, or connect Google/Outlook Calendar." },
  { num: "02", title: "Detect risk episodes", desc: "The engine scans for 4 circadian risk patterns and calculates your strain score." },
  { num: "03", title: "Get your recovery plan", desc: "A clinical task schedule is generated — rule-based or via Claude AI with RAG." },
  { num: "04", title: "Track & adapt", desc: "Mark tasks done, log sleep data, and the plan proactively re-optimises." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 sm:px-10 h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <span className="font-semibold text-slate-100 text-sm">Noxturn</span>
        </div>
        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/onboard"   className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors">Onboard</Link>
          <Link href="/dashboard" className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors">Dashboard</Link>
          <Link href="/sandbox"   className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors">Sandbox</Link>
        </nav>
        <div className="flex items-center gap-2">
          <AccessibilityButton />
          <NavAuthButtons />
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 sm:px-10 pt-24 pb-20 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-950/60 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-xs font-medium text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Built for healthcare & shift workers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            <span className="gradient-text">Recover smarter</span>
            <br />
            between your shifts.
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Noxturn detects circadian risk in your shift schedule and builds an AI-powered recovery
            plan backed by clinical evidence — so you can protect your sleep, safety, and health.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/onboard"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-indigo-900/40 text-sm"
            >
              Start onboarding
              <IconArrowRight size={15} />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all duration-150 text-sm"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { val: "4", label: "Risk detectors" },
            { val: "12", label: "Intervention cards" },
            { val: "10", label: "Evidence chunks" },
            { val: "3", label: "Shift personas" },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold gradient-text">{val}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-20">
        <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3 text-center">Features</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          Everything you need to recover well
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div
              key={title}
              className={`rounded-xl border p-5 ${bg} hover:scale-[1.01] transition-transform duration-150`}
            >
              <Icon size={20} className={`${color} mb-3`} />
              <h3 className="text-sm font-semibold text-slate-100 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-20">
          <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3 text-center">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Four steps to better recovery</h2>
          <div className="space-y-6">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex items-start gap-5">
                <span className="text-3xl font-black text-slate-800 tabular-nums leading-none shrink-0 mt-0.5">{num}</span>
                <div className="flex-1 border-b border-slate-800 pb-6 last:border-none last:pb-0">
                  <h3 className="text-sm font-semibold text-slate-100 mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Import your schedule in under 2 minutes and get a clinically-grounded recovery plan.
        </p>
        <Link
          href="/onboard"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-150 shadow-lg shadow-indigo-900/30 text-sm"
        >
          Start now — it&apos;s free
          <IconChevronRight size={15} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 px-6 py-6 text-center text-xs text-slate-600">
        Noxturn — Circadian Recovery Planner · Built for HackASU
      </footer>
    </div>
  );
}

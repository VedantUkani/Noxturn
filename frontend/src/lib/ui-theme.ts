/**
 * Canonical Noxturn UI theme — aligned with the Recovery analytics screen.
 * Use these tokens/classes for surfaces, type, accents, and focus so Week / Today
 * match the same premium dark system (deep navy base, blue surfaces, teal accent).
 */

export const NOXTURN_COLORS = {
  pageBg: "#04112d",
  pageBgDeep: "#06173a",
  sidebarBg: "#08142f",
  navActiveBg: "#0c1f3d",
  topBarBg: "#04112d",
  card: "#141f42",
  cardRaised: "#16264a",
  inset: "#0d1833",
  insetDeep: "#07142f",
  primaryText: "#edf2ff",
  secondaryText: "#98a4bf",
  mutedText: "#7d89a6",
  accentTeal: "#45e0d4",
  accentLightBlue: "#86c9ff",
  accentYellow: "#f7c22c",
} as const;

/** Tailwind class fragments — compose with `cn()`. */
export const nx = {
  /** Root layout: page background + default text */
  page: "bg-[#04112d] text-[#edf2ff]",
  textPrimary: "text-[#edf2ff]",
  textSecondary: "text-[#98a4bf]",
  textMuted: "text-[#7d89a6]",
  /** Eyebrow / micro labels */
  labelUpper:
    "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d89a6]",
  /** Primary dashboard sidebar */
  sidebar:
    "border-r border-white/[0.06] bg-[#08142f] shadow-[8px_0_48px_-20px_rgba(0,0,0,0.85)]",
  sidebarWidthClass: "w-[260px] max-w-[270px]",
  sidebarPad: "px-5",
  /**
   * Horizontal gutters for the main column (shared by `<main>` and top bar).
   * Full viewport width minus sidebar; no max-width so content fills the area.
   */
  mainGutter: "px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10",
  /** Dashboard `<main>`: full width of content column + gutters (no max-width centering) */
  mainPad: "w-full px-4 py-8 sm:px-6 md:px-8 md:py-9 lg:px-8 lg:py-10 xl:px-10",
  /** Cards — default and raised metric-style */
  card:
    "rounded-[22px] border border-white/[0.06] bg-[#141f42] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)]",
  cardRaised:
    "rounded-[22px] border border-white/[0.06] bg-[#16264a] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.8)]",
  /** Focus rings — single accent family */
  focusRing: "focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#45e0d4]/50",
  /** Nav item — active (Recovery sidebar) */
  navActive:
    "rounded-2xl bg-[#0c1f3d] text-[#45e0d4] shadow-[inset_0_0_0_1px_rgba(69,224,212,0.12)]",
  navInactive:
    "rounded-2xl text-[#98a4bf] hover:bg-white/[0.04] hover:text-[#edf2ff]",
  navIconActive: "text-[#45e0d4]",
  navIconInactive: "text-[#7d89a6]",
  /** Primary CTA (solid teal) */
  primaryButton:
    "rounded-2xl bg-[#45e0d4] font-bold text-[#04112d] shadow-[0_8px_28px_-12px_rgba(69,224,212,0.55)] transition hover:brightness-105",
  /** Top bar under header strip */
  topBar:
    "border-b border-white/[0.06] bg-[#04112d]/92 backdrop-blur-md",
  /** Mobile menu overlay */
  overlay: "bg-[#04112d]/80 backdrop-blur-sm",
} as const;

/**
 * Marketing / home / pre-dashboard flows — same palette and rhythm as Week / Today / Recovery.
 * Use with `cn()`; do not introduce parallel slate/indigo landing themes.
 */
export const nxMarketing = {
  /** Sticky top bar (mirrors `nx.topBar` + header height) */
  header:
    "sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#04112d]/92 px-4 backdrop-blur-md sm:px-6",
  /** Marketing / landing — logo + utilities only (no center nav) */
  marketingHeaderMinimal:
    "sticky top-0 z-50 flex h-14 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#04112d]/95 px-4 backdrop-blur-md sm:px-8",
  /** Logo square — teal on navy (matches nav active family) */
  logoMark:
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#0c1f3d] text-sm font-bold text-[#45e0d4] shadow-[inset_0_0_0_1px_rgba(69,224,212,0.12)]",
  navLink:
    "rounded-xl px-3 py-1.5 text-sm text-[#98a4bf] transition-colors hover:bg-white/[0.04] hover:text-[#edf2ff]",
  /** Solid teal CTA — same intent as `nx.primaryButton` */
  primaryCta:
    "inline-flex items-center justify-center rounded-2xl bg-[#45e0d4] px-4 py-2.5 text-sm font-bold text-[#04112d] shadow-[0_8px_28px_-12px_rgba(69,224,212,0.55)] transition hover:brightness-105",
  primaryCtaLg:
    "inline-flex items-center justify-center rounded-2xl bg-[#45e0d4] px-6 py-3 text-sm font-bold text-[#04112d] shadow-[0_8px_28px_-12px_rgba(69,224,212,0.55)] transition hover:brightness-105",
  secondaryCta:
    "inline-flex items-center justify-center rounded-2xl border border-white/[0.1] bg-[#101c3c]/90 px-6 py-3 text-sm font-semibold text-[#edf2ff] shadow-[0_8px_24px_-16px_rgba(0,0,0,0.55)] transition hover:border-white/[0.16] hover:bg-[#141f42]",
  heroGlow:
    "pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#0c1f3d]/35 blur-3xl",
  pill:
    "inline-flex items-center gap-2 rounded-full border border-[#45e0d4]/20 bg-[#0c1f3d]/45 px-3 py-1.5 text-xs font-medium text-[#86c9ff]",
  sectionBand:
    "border-y border-white/[0.06] bg-[#08142f]/35",
  eyebrow:
    "mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d89a6]",
  heading2: "text-2xl font-bold tracking-tight text-[#edf2ff] sm:text-3xl",
  statNumber: "text-3xl font-bold tracking-tight text-[#45e0d4]",
  contentWide: "mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8",
  contentNarrow: "mx-auto w-full max-w-2xl px-4 sm:px-6 md:px-8",
  featureCard:
    "rounded-[22px] border border-white/[0.06] bg-[#141f42] p-5 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.85)] transition-transform duration-150 hover:scale-[1.01]",
  featureIcon:
    "mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-[#16264a] text-[#45e0d4]",
  stepWatermark:
    "mt-0.5 shrink-0 text-3xl font-black tabular-nums text-[#0c1f3d]",
  footer: "border-t border-white/[0.06] px-6 py-6 text-center text-xs text-[#7d89a6]",
  /** Header / toolbar — icon + label */
  a11yTrigger:
    "group inline-flex items-center gap-2 rounded-2xl border border-white/[0.09] bg-[#101c3c]/70 px-3 py-2 text-[13px] font-medium text-[#98a4bf] shadow-[0_6px_24px_-14px_rgba(0,0,0,0.75)] transition-[border-color,background-color,color,box-shadow] hover:border-[#45e0d4]/22 hover:bg-[#141f42]/90 hover:text-[#edf2ff] active:scale-[0.98]",
  /** Dense areas — icon only */
  a11yTriggerCompact:
    "group inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101c3c]/70 text-[#98a4bf] shadow-[0_6px_24px_-14px_rgba(0,0,0,0.75)] transition-[border-color,background-color,color,box-shadow] hover:border-[#45e0d4]/22 hover:bg-[#141f42]/90 hover:text-[#45e0d4] active:scale-[0.98]",
  /** Position set inline in `AccessibilityMenu` (portal + fixed). */
  a11yPanel:
    "max-h-[min(70vh,calc(100dvh-5rem))] overflow-y-auto rounded-[22px] border border-white/[0.08] bg-[#141f42] shadow-[0_24px_56px_-28px_rgba(0,0,0,0.92)]",
  a11yOptionSelected:
    "border-[#45e0d4]/40 bg-[#0c1f3d] text-[#45e0d4]",
  a11yOptionIdle:
    "border-white/[0.08] text-[#98a4bf] hover:bg-white/[0.04]",
} as const;

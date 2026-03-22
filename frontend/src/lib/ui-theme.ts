/**
 * Canonical Noxturn UI theme — aligned with the Recovery analytics screen.
 * Use these tokens/classes for surfaces, type, accents, and focus so Week / Today / Sandbox
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

/** Sidebar / shell opens the in-page Evidence Lens on Today via this event. */
export const NOXTURN_EVIDENCE_LENS_EVENT = "noxturn-open-evidence-lens";

export function dispatchOpenEvidenceLensOverview(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOXTURN_EVIDENCE_LENS_EVENT));
}

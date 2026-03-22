/** Legacy heuristic from static onboarding: rough “hours between shifts” hint from commute minutes. */
export function commuteRecoveryHintHours(commuteMinutes: number): number {
  return 11 + Math.round(commuteMinutes / 30) * 0.5;
}

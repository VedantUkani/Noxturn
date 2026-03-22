import { CircadianSandboxView, SANDBOX_MOCK_VIEW_MODEL } from "./circadian-sandbox";

/** Shift sandbox — scenario planning (reference UI). Data from mock; swap `SANDBOX_MOCK_VIEW_MODEL` for API-mapped view models later. */
export function SandboxPageContent() {
  return <CircadianSandboxView model={SANDBOX_MOCK_VIEW_MODEL} />;
}

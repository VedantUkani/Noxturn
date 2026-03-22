# Noxturn — frontend context

Single reference for extending the Noxturn web app. **Scope:** `frontend/` only; do not change backend code from this track.

---

## Product summary

Noxturn is a **schedule harm-reduction copilot** for rotating shift workers (nurses, residents, healthcare staff, and similar roles). It ingests a rota plus obligations, estimates **circadian injury risk**, checks whether **recovery actually happened** using wearable summaries and completed or missed actions, then **replans the next 12–72 hours** with one clear, humane **next step**.

### Core UI capabilities (build toward these)

| Capability | Purpose |
|------------|---------|
| **Circadian Injury Map** | Risky flips, short turnarounds, low recovery windows, unsafe fatigue windows. |
| **Reweave Engine** | Refresh today/tomorrow when tasks are completed, skipped, or missed. |
| **Recovery Rhythm** | Non-punitive rhythm state (not guilt metrics or streak loss). |
| **Shift Sandbox** | What-if simulator for picking up or swapping shifts. |
| **Evidence Lens** | Explain why a recommendation exists (RAG / refs). |

---

## Design principles

- **Calm, trustworthy, humane** — clinically clear without coldness; supportive without generic wellness fluff.
- **Low cognitive load** — one primary **next best action**; details (evidence, sandbox) one tap away.
- **Dark, fatigue-friendly** — e.g. deep slate background, muted borders, restrained accent (cool, not neon “gamified” greens).
- **Accessible & responsive** — semantic HTML, focus states, scalable type, sensible touch targets.
- **Demo-ready** — happy path works with real API **or** typed mocks behind the same client layer.
- **Production-grade TypeScript** — shared domain types; avoid `any` and ad-hoc string APIs.

### Tone & metaphor guardrails

- **Not** a fitness app or productivity guilt product — no scoreboards as identity, no streak shaming.
- **Avoid:** “failed”, “lost streak”, “bad user”, “you should have”.
- **Prefer:** “rebuilding”, “interrupted”, “protect this block”, “next best action”, “adjust the plan”.

---

## Tech stack (target)

- **Next.js** (App Router), **React**, **TypeScript**, **Tailwind CSS**.
- **shadcn/ui:** use the same *composition patterns* (card sections, accessible primitives) when adding UI; install the library only if the team standardizes on it — avoid duplicate primitive stacks.
- **Framer Motion** / **Recharts:** add only when motion or a chart clearly improves understanding; no dependency for its own sake.
- **API client:** thin `fetch` helpers + `NEXT_PUBLIC_API_BASE` (e.g. `http://127.0.0.1:8000`). If endpoints fail, **mock adapters** implement the same TypeScript types as the real client.

---

## Folder conventions (feature-friendly)

```
frontend/
  docs/
    noxturn-frontend-context.md   # this file
  src/
    app/                 # App Router routes
    components/
      layout/            # shell, nav
      ui/                # shared primitives (Button, Card, Modal, …)
      dashboard/         # dashboard feature slices
      injury-map/        # circadian injury visualization (when added)
      sandbox/           # shift simulator UI
      evidence/          # evidence lens UI
    contexts/            # a11y, theme, optional i18n
    lib/
      types.ts           # domain types (mirror backend JSON)
      api.ts             # HTTP + error handling
      mocks/             # optional mock implementations
```

Large features get their own folder under `components/`; **shared** pieces stay in `components/ui/`.

---

## Naming conventions

- **Routes:** filesystem paths under `src/app/` define URLs.
- **Components:** PascalCase files (`TaskCard.tsx`); default export or named export consistent with the rest of the file.
- **Types:** PascalCase; domain types centralized in `src/lib/types.ts` unless strictly local UI state.
- **Wire format:** backend JSON uses **snake_case** (`next_best_action`, `plan_mode`). Normalize in one mapper layer if you convert to camelCase in UI.
- **Copy / i18n:** if you add translations, stable keys grouped by area (`nav`, `dashboard`, `onboard`, …).

---

## Domain entities (align with backend)

Authoritative backend models: `backend/app/models/schemas.py`. Frontend types should match these shapes (UUIDs as strings in JSON is typical).

| Concept | Notes |
|---------|--------|
| **Schedule** | `ScheduleBlock`, `BlockType` (`day_shift`, `night_shift`, `evening_shift`, `off_day`, `transition_day`). |
| **Risk** | `RiskEpisode`, `RiskLabel` (`rapid_flip`, `short_turnaround`, `low_recovery`, `unsafe_drive`), `Severity`, `RiskComputeResponse` (`circadian_strain_score`, `risk_episodes`, `summary`). |
| **Plan** | `PlanGenerateResponse`: `plan_mode`, `tasks`, `avoid_list`, `next_best_action`, `evidence_refs`, `risk_summary`. |
| **Tasks** | `PlanTask` (`TaskCategory`, `TaskStatus`: planned / completed / skipped / expired), `anchor_flag`, `evidence_ref`. |
| **Reweave** | `TaskEventCreate` / `TaskEventResponse`, `ReplanRequest` / `ReplanResponse`. |
| **Dashboard** | `DashboardTodayResponse`: `plan_mode`, `next_best_action`, `anchor_tasks`, `recovery_rhythm_label`, `recovery_score`. |
| **Wearables** | `WearableImportRequest` / `WearableImportResponse` (`recovery_score`, etc.). |
| **Sandbox** | `ShiftSandboxRequest` / `ShiftSandboxResponse` (`strain_delta`, `verdict`, `explanation`, `recovery_bottleneck`). |
| **Evidence (RAG)** | `GET /rag/...` — mirror whatever the route returns in a dedicated type once wired. |

**Recovery rhythm labels** should stay **non-punitive** in copy (e.g. steady / rebuilding / interrupted / unknown) even if the backend sends a string enum — map to humane UI strings in one place.

---

## Backend route map (for client wiring)

| Prefix | Tags (rough) |
|--------|----------------|
| `/dashboard` | Today summary |
| `/plans` | Generate / replan |
| `/tasks` | Task events |
| `/risks` | Risk compute |
| `/schedule` | Import / calendar hooks |
| `/wearables` | Recovery input |
| `/simulate` | Shift sandbox (UI may live at `/sandbox`) |
| `/rag` | Evidence |
| `/personas` | Persona presets |

---

## Frontend route map (target)

| Path | Purpose |
|------|---------|
| `/` | Landing / product story |
| `/onboard` | Role, commute, constraints, schedule capture |
| `/dashboard` | Copilot home: next action, anchors, injury map slice, wearable hook, evidence entry |
| `/sandbox` | Shift what-if (calls `/simulate` on the API) |
| `/settings` | Preferences |

Nav items should stay in sync with this map (single source of truth in layout config).

---

## Component map (target)

Build toward this split; names can evolve but **responsibilities** should not blur.

| Area | Responsibility |
|------|------------------|
| **Layout** | App shell, sidebar or drawer, header, fatigue-safe page frame |
| **Injury map** | Week or horizon view of risk episodes / severity (Recharts only if it clarifies) |
| **Plan / Reweave** | Task list, next action hero, replan feedback after events |
| **Recovery rhythm** | Rhythm state UI (not streaks); ties to `recovery_rhythm_label` / wearable data |
| **Sandbox** | Diff current vs hypothetical blocks, show `strain_delta` + `verdict` |
| **Evidence lens** | Modal or panel: citations, short “why this” copy |
| **UI primitives** | Buttons, cards, modals, inputs — shared and a11y-reviewed |

---

## Copy & tone rules

1. Describe **state** and **options**, not moral failure.  
2. Prefer concrete clinical language: turnaround, recovery window, strain, evidence.  
3. Headline the **next best action**; one short “why now” line when space allows.  
4. New strings go through the same pipeline (constants or i18n), not scattered literals.

---

## Demo persona & flow

**Persona:** *Aisha* — ICU nurse, rotating days/nights, ~45 min commute, sometimes short sleep after nights.

**Happy path (~5–8 min):** Home → Onboard (role, commute, small rota with a short turnaround + a recovery gap) → Dashboard (generate plan, show mode + next action + anchors; complete or skip a task; open evidence on one row) → optional wearable numbers → point at injury visualization → Sandbox (add/move shift, show strain delta and verdict).

If the API is unavailable, swap in **mock JSON** that still type-checks against `PlanGenerateResponse`, `RiskComputeResponse`, `DashboardTodayResponse`, etc.

---

## Implementation guardrails

1. **Read callers and types** before changing shared components.  
2. **Frontend-only** in this track.  
3. **Extend `src/lib/types.ts`** when the wire model grows; keep views thin.  
4. **No dependency sprawl** — justify packages (bundle size, a11y, maintenance).  
5. **Avoid TODO graveyards** — ship a narrow working path over many stubs.  
6. **Self-check** after substantive edits: `npm run lint` and `npm run build` in `frontend/`, plus quick pass for broken imports, contrast, and focus order.

---

## Repository note

As of last check-in, `frontend/` may contain only a placeholder (e.g. `.gitkeep`) while the Next.js app is restored or recreated. **Conventions and API alignment above still apply** when files land; keep this document updated when routes or backend schemas change.

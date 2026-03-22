import json
import os
import re
from datetime import datetime, timezone
from typing import List, Optional
from uuid import uuid4

from anthropic import Anthropic

from app.models.schemas import (
    NextBestAction,
    PlanGenerateResponse,
    PlanTask,
    RiskComputeResponse,
    TaskCategory,
    TaskStatus,
)

SYSTEM_PROMPT = """You are Noxturn, a clinical circadian rhythm recovery advisor for shift workers (nurses, paramedics, factory workers).

You receive shift schedule risk analysis data and generate a personalized, actionable recovery plan.

Clinical priorities (in order):
1. Protect the main sleep block after night shifts — non-negotiable anchor
2. Strategic nap before long or dangerous commutes
3. Caffeine cutoff at least 6 hours before intended sleep
4. Bright light exposure after waking, dim light 1-2h before sleep
5. Meal timing reset to anchor the circadian clock
6. Movement and decompression to reduce cortisol after shifts
7. Mindfulness or relaxation to lower HPA-axis load after high-strain shifts
8. Social grounding contact on first off-day after a high-strain cluster

Plan mode rules:
- protect: strain ≥ 75 — severe disruption, prioritize sleep above everything
- recover: strain 50–74 — active recovery phase, anchor sleep + naps
- stabilize: strain 25–49 — moderate risk, prevention-focused
- perform: strain < 25 — low risk, maintain good habits

Allowed task categories and when to use each:
- sleep: main sleep block — use when rapid_flip or low_recovery risk present; always anchor_flag=true
- nap: strategic nap — use when short_turnaround risk present; anchor_flag=true
- light_timing: bright light on waking, dim light pre-sleep — use after any night-shift block
- caffeine_cutoff: stop caffeine ≥6h before sleep — use whenever any risk episode is present
- meal: fixed meal time as circadian anchor — include at least once per plan
- relaxation: decompression 10–15 min post-shift — use when shift end detected in risk window
- movement: 20-min light exercise in recovery window — include in every plan, optional_flag=true
- mindfulness: 10-min breathing/meditation — use when strain ≥ 75 or after high-strain cluster
- safety: do-not-drive / safe-transport task — use for unsafe_drive risk; anchor_flag=true
- social: brief positive social contact on first off-day — use when strain ≥ 50 and off-day follows cluster

You MUST respond with ONLY valid JSON — no markdown, no explanation, no code fences. Just the raw JSON object.

Schema:
{
  "plan_mode": "protect|recover|stabilize|perform",
  "tasks": [
    {
      "category": "sleep|nap|light_timing|caffeine_cutoff|meal|relaxation|movement|mindfulness|safety|social",
      "title": "short action title (max 8 words)",
      "description": "1-2 actionable sentences the worker can immediately follow",
      "scheduled_time": "ISO 8601 datetime e.g. 2026-03-22T08:00:00",
      "duration_minutes": 90,
      "anchor_flag": true,
      "optional_flag": false,
      "source_reason": "single sentence linking this task to the specific risk detected",
      "evidence_ref": "cite as [N] title — use the numbered evidence list provided, or null if none applies"
    }
  ],
  "avoid_list": ["specific thing to avoid (max 12 words)", ...],
  "next_best_action": {
    "category": "sleep",
    "title": "action title",
    "description": "what to do right now in 1 sentence",
    "why_now": "urgency reason in 1 sentence",
    "duration_minutes": 90
  }
}

MANDATORY COVERAGE RULE — your response MUST include at least one task from EACH of these groups:
  Group A: sleep OR nap
  Group B: light_timing OR caffeine_cutoff
  Group C: mindfulness OR relaxation
  Group D: movement

If any risk episode is present you MUST also include: meal.
Failure to cover all four groups is a hard error.

Additional rules:
- Generate 5–10 tasks to ensure full category coverage
- Only set anchor_flag=true for sleep, nap, and safety tasks
- All scheduled_times must be in the future relative to the context date provided
- Be specific: reference actual shift end times, commute durations, and risk labels from the input
- Avoid generic advice — every task must be directly traceable to a detected risk or clinical priority
- When evidence is provided, populate evidence_ref using the [N] citation format — do not invent citations"""


def _build_rag_query(risk_result: RiskComputeResponse) -> str:
    """Construct a semantic search query from detected risk labels and summary."""
    labels = " ".join(ep.label.value.replace("_", " ") for ep in risk_result.risk_episodes)
    return f"{labels} {risk_result.summary}".strip() or "shift worker circadian recovery"


def _build_evidence_section(rag_results: dict) -> tuple[str, list]:
    """
    Format retrieved evidence into a numbered list for the prompt.
    Returns (prompt_section, structured_refs).
    structured_refs is a list of dicts for PlanGenerateResponse.evidence_refs.
    """
    items = []
    refs = []
    n = 1

    for item in rag_results.get("cards", []):
        items.append(
            f"[{n}] INTERVENTION ({item.get('score', 0):.2f}): {item.get('title', '')}\n"
            f"    {item.get('content', '')[:300]}"
        )
        refs.append({
            "ref": f"[{n}]",
            "type": "intervention",
            "item_id": item.get("item_id", ""),
            "title": item.get("title", ""),
            "score": item.get("score", 0),
        })
        n += 1

    for item in rag_results.get("evidence", []):
        items.append(
            f"[{n}] EVIDENCE ({item.get('score', 0):.2f}): {item.get('title', '')}\n"
            f"    {item.get('content', '')[:300]}"
        )
        refs.append({
            "ref": f"[{n}]",
            "type": "evidence",
            "item_id": item.get("item_id", ""),
            "title": item.get("title", ""),
            "score": item.get("score", 0),
        })
        n += 1

    if not items:
        return "", []

    section = "\n\nRelevant clinical evidence (cite using [N] in evidence_ref fields):\n" + "\n".join(items)
    return section, refs


def _build_persona_section(persona: Optional[dict]) -> str:
    """Format persona context to append to the system prompt."""
    if not persona:
        return ""
    lines = [
        f"\n\n--- WORKER PERSONA: {persona.get('name', 'Unknown')} ---",
        f"Role: {persona.get('role', '')}",
        f"Shift pattern: {persona.get('shift_pattern', '')} ({persona.get('typical_shift_hours', '?')}h shifts)",
        f"Commute: {persona.get('typical_commute_minutes', 30)} min",
        f"Clinical context: {persona.get('clinical_context', '')}",
    ]
    risk_profile = persona.get("risk_profile", {})
    if risk_profile:
        lines.append(
            f"Risk profile: rapid_flip_sensitivity={risk_profile.get('rapid_flip_sensitivity','?')}, "
            f"sleep_minimum={risk_profile.get('sleep_minimum_hours','?')}h, "
            f"nap_tolerance={risk_profile.get('nap_tolerance','?')}"
        )
    priority = persona.get("priority_interventions", [])
    if priority:
        lines.append(f"Priority interventions for this worker: {', '.join(priority)}")
    avoid = persona.get("avoid_patterns", [])
    if avoid:
        lines.append("Patterns this persona must avoid:")
        for a in avoid:
            lines.append(f"  - {a}")
    tone = persona.get("plan_tone", "")
    if tone:
        lines.append(f"Communication tone: {tone} (adapt task descriptions to this tone)")
    return "\n".join(lines)


def _build_user_message(
    risk_result: RiskComputeResponse,
    plan_hours: int,
    persona: Optional[dict] = None,
    evidence_section: str = "",
) -> str:
    now = datetime.now(timezone.utc)
    episodes_text = []
    for ep in risk_result.risk_episodes:
        episodes_text.append(
            f"- [{ep.severity.value.upper()}] {ep.label.value}: {ep.explanation.get('message', '')} "
            f"(score {ep.severity_score}/100, window {ep.start_time.isoformat()} to {ep.end_time.isoformat()})"
        )

    persona_line = ""
    if persona:
        persona_line = f"\nWorker role: {persona.get('name', '')} ({persona.get('shift_pattern', '')})\n"

    return f"""Current datetime: {now.isoformat()}
Plan window: next {plan_hours} hours
Circadian strain score: {risk_result.circadian_strain_score}/100
{persona_line}
Risk episodes detected ({len(risk_result.risk_episodes)} total):
{chr(10).join(episodes_text) if episodes_text else "None detected"}

Overall summary: {risk_result.summary}{evidence_section}

Generate a recovery plan for this shift worker."""


def _extract_json(text: str) -> dict:
    """
    Extract JSON from Claude response robustly:
    1. Try regex for complete code fences  ``` ... ```
    2. Strip opening fence and parse from first { (handles max_tokens truncation)
    3. Try raw parse (Claude returned bare JSON)
    """
    text = text.strip()

    # 1. Complete code fence present
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        return json.loads(match.group(1).strip())

    # 2. Opening fence without closing (response truncated at max_tokens)
    fence_stripped = re.sub(r"^```(?:json)?\s*", "", text).strip()
    start = fence_stripped.find("{")
    if start != -1:
        candidate = fence_stripped[start:]
        # Walk backwards from end to find last valid closing brace
        end = len(candidate)
        while end > 0:
            try:
                return json.loads(candidate[:end])
            except json.JSONDecodeError:
                end -= 1

    # 3. Bare JSON with no fences
    return json.loads(text)


_KNOWN_CATEGORIES = {c.value for c in TaskCategory}

def _best_effort_category(raw_value: str) -> TaskCategory:
    """
    3d: When Claude returns an unrecognised category string, try a substring
    match against known category values before falling back to relaxation.
    """
    raw_lower = raw_value.lower()
    for cat in TaskCategory:
        if cat.value in raw_lower or raw_lower in cat.value:
            print(f"[Claude] Unknown category '{raw_value}' — matched to '{cat.value}'")
            return cat
    print(f"[Claude] Unknown category '{raw_value}' — defaulted to relaxation")
    return TaskCategory.relaxation


def _parse_response(raw: dict, risk_result: RiskComputeResponse, evidence_refs: list = None) -> PlanGenerateResponse:
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    tasks: List[PlanTask] = []
    for idx, t in enumerate(raw.get("tasks", [])[:10]):
        try:
            category = TaskCategory(t["category"])
        except (ValueError, KeyError):
            # 3d: smart fallback — try substring match before defaulting to relaxation
            category = _best_effort_category(t.get("category", ""))

        try:
            scheduled_time = datetime.fromisoformat(t["scheduled_time"])
        except (KeyError, ValueError):
            scheduled_time = now + timedelta(hours=1 + idx)

        # 3a: clamp past-dated tasks to the future
        if scheduled_time.tzinfo is None:
            cmp_now = datetime.now()
        else:
            cmp_now = now
        if scheduled_time < cmp_now:
            hours_behind = int((cmp_now - scheduled_time).total_seconds() / 3600) + 1
            scheduled_time = scheduled_time + timedelta(hours=hours_behind)

        tasks.append(
            PlanTask(
                id=uuid4(),
                category=category,
                title=t.get("title", "Recovery task"),
                description=t.get("description"),
                scheduled_time=scheduled_time,
                duration_minutes=int(t.get("duration_minutes", 30)),
                anchor_flag=bool(t.get("anchor_flag", False)),
                optional_flag=bool(t.get("optional_flag", False)),
                source_reason=t.get("source_reason"),
                evidence_ref=t.get("evidence_ref"),
                status=TaskStatus.planned,
                sort_order=idx,
            )
        )

    tasks = sorted(tasks, key=lambda t: t.scheduled_time)

    nba_raw = raw.get("next_best_action", {})
    if tasks:
        first = tasks[0]
        nba = NextBestAction(
            task_id=first.id,
            category=first.category,
            title=nba_raw.get("title", first.title),
            description=nba_raw.get("description", first.description or first.title),
            why_now=nba_raw.get("why_now", first.source_reason or "Highest priority recovery action."),
            duration_minutes=nba_raw.get("duration_minutes", first.duration_minutes),
        )
    else:
        nba = NextBestAction(
            task_id=uuid4(),
            category=TaskCategory.relaxation,
            title=nba_raw.get("title", "Take a short decompression break"),
            description=nba_raw.get("description", "No urgent risks — stay steady."),
            why_now=nba_raw.get("why_now", "No active high-risk episode."),
            duration_minutes=nba_raw.get("duration_minutes", 15),
        )

    return PlanGenerateResponse(
        plan_mode=raw.get("plan_mode", "stabilize"),
        risk_summary={
            "circadian_strain_score": risk_result.circadian_strain_score,
            "episodes": len(risk_result.risk_episodes),
            "summary": risk_result.summary,
            "generated_by": "claude",
        },
        tasks=tasks,
        avoid_list=raw.get("avoid_list", []),
        next_best_action=nba,
        evidence_refs=evidence_refs or [],
    )


class ClaudePlanner:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set in environment")
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-haiku-4-5-20251001"

    def generate(
        self,
        risk_result: RiskComputeResponse,
        plan_hours: int = 48,
        user_id: str = "anonymous",
        persona: Optional[dict] = None,
    ) -> PlanGenerateResponse:
        from app.services.token_tracker import record as track_tokens
        from app.rag.retriever import retrieve

        # Retrieve relevant evidence for this risk context
        evidence_refs = []
        evidence_section = ""
        try:
            query = _build_rag_query(risk_result)
            rag_results = retrieve(query, top_k=3)
            evidence_section, evidence_refs = _build_evidence_section(rag_results)
        except Exception as e:
            print(f"[RAG] Evidence retrieval failed (non-fatal): {e}")

        system_prompt = SYSTEM_PROMPT + _build_persona_section(persona)
        user_msg = _build_user_message(risk_result, plan_hours, persona, evidence_section)

        message = self.client.messages.create(
            model=self.model,
            max_tokens=2500,
            system=system_prompt,
            messages=[{"role": "user", "content": user_msg}],
        )

        # Track token usage
        usage = message.usage
        track_tokens(
            user_id=user_id,
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            model=self.model,
        )

        raw_text = message.content[0].text

        # 3c: retry once on JSON parse failure, then fall back to rule planner
        try:
            raw = _extract_json(raw_text)
        except (json.JSONDecodeError, KeyError, ValueError):
            print("[Claude] JSON parse failed, retrying...")
            retry_messages = [
                {"role": "user", "content": user_msg},
                {"role": "assistant", "content": raw_text},
                {
                    "role": "user",
                    "content": (
                        "Your previous response was not valid JSON. "
                        "Respond with ONLY the raw JSON object, no other text."
                    ),
                },
            ]
            retry_msg = self.client.messages.create(
                model=self.model,
                max_tokens=2500,
                system=system_prompt,
                messages=retry_messages,
            )
            track_tokens(
                user_id=user_id,
                input_tokens=retry_msg.usage.input_tokens,
                output_tokens=retry_msg.usage.output_tokens,
                model=self.model,
            )
            retry_text = retry_msg.content[0].text
            try:
                raw = _extract_json(retry_text)
            except (json.JSONDecodeError, KeyError, ValueError):
                # Both attempts failed — fall back to rule planner
                print("[Claude] Retry also failed — falling back to rule planner")
                from app.planner.rule_planner import RulePlanner
                fallback_plan = RulePlanner().generate(risk_result, plan_hours=plan_hours)
                fallback_plan.risk_summary["generated_by"] = "rule_planner_fallback"
                return fallback_plan

        return _parse_response(raw, risk_result, evidence_refs)

from datetime import timedelta
from typing import Dict, List
from uuid import uuid4

from app.models.schemas import (
    NextBestAction,
    PlanGenerateResponse,
    PlanTask,
    RiskComputeResponse,
    TaskCategory,
)


class RulePlanner:
    def generate(self, risk_result: RiskComputeResponse, plan_hours: int = 48) -> PlanGenerateResponse:
        tasks = self._tasks_from_risks(risk_result)
        tasks = sorted(tasks, key=lambda t: t.scheduled_time)
        avoid_list = self._avoid_list(risk_result)
        plan_mode = self._plan_mode(risk_result.circadian_strain_score)
        nba = self._next_best_action(tasks)

        return PlanGenerateResponse(
            plan_mode=plan_mode,
            risk_summary={
                "circadian_strain_score": risk_result.circadian_strain_score,
                "episodes": len(risk_result.risk_episodes),
                "summary": risk_result.summary,
                "plan_hours": plan_hours,
            },
            tasks=tasks,
            avoid_list=avoid_list,
            next_best_action=nba,
            evidence_refs=[],
        )

    def _tasks_from_risks(self, risk_result: RiskComputeResponse) -> List[PlanTask]:
        tasks: List[PlanTask] = []
        for idx, ep in enumerate(risk_result.risk_episodes[:6]):
            when = ep.start_time + timedelta(minutes=30 + idx * 20)
            label = ep.label.value

            if label in {"rapid_flip", "low_recovery"}:
                category = TaskCategory.sleep
                title = "Protect main sleep block"
                duration = 90
                anchor = True
            elif label == "short_turnaround":
                category = TaskCategory.nap
                title = "Take a strategic 25-minute nap"
                duration = 25
                anchor = True
            else:
                category = TaskCategory.safety
                title = "Use safe commute plan"
                duration = 15
                anchor = True

            tasks.append(
                PlanTask(
                    id=uuid4(),
                    category=category,
                    title=title,
                    description=f"Recommended due to {label.replace('_', ' ')} risk.",
                    scheduled_time=when,
                    duration_minutes=duration,
                    anchor_flag=anchor,
                    optional_flag=False,
                    source_reason=ep.explanation.get("message", ""),
                    evidence_ref=None,
                    sort_order=idx,
                )
            )
        return tasks

    @staticmethod
    def _avoid_list(risk_result: RiskComputeResponse) -> List[str]:
        hints = []
        labels = {e.label.value for e in risk_result.risk_episodes}
        if "rapid_flip" in labels:
            hints.append("Avoid accepting immediate day/night flip shifts without transition.")
        if "short_turnaround" in labels:
            hints.append("Avoid back-to-back shifts with less than 11h rest.")
        if "unsafe_drive" in labels:
            hints.append("Avoid driving drowsy after night shifts.")
        if "low_recovery" in labels:
            hints.append("Avoid scheduling non-critical obligations in recovery windows.")
        return hints

    @staticmethod
    def _plan_mode(strain: float) -> str:
        if strain >= 75:
            return "protect"
        if strain >= 50:
            return "recover"
        if strain >= 25:
            return "stabilize"
        return "perform"

    @staticmethod
    def _next_best_action(tasks: List[PlanTask]) -> NextBestAction:
        if not tasks:
            task_id = uuid4()
            return NextBestAction(
                task_id=task_id,
                category=TaskCategory.relaxation,
                title="Take a short decompression break",
                description="No urgent risks detected. Stay steady.",
                why_now="No active high-risk episode.",
                duration_minutes=15,
            )
        first = tasks[0]
        return NextBestAction(
            task_id=first.id,
            category=first.category,
            title=first.title,
            description=first.description or first.title,
            why_now=first.source_reason or "Highest-priority upcoming task.",
            duration_minutes=first.duration_minutes,
        )

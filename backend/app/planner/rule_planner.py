from datetime import datetime, timedelta, timezone
from typing import List, Set
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
        tasks = self._tasks_from_risks(risk_result, plan_hours)
        # 3a: clamp any past-dated tasks to the future
        tasks = [self._clamp_to_future(t) for t in tasks]
        # 3b: anchors first (0–99), then non-anchors (100+), each group sorted by scheduled_time
        tasks = self._sort_tasks(tasks)
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

    def _tasks_from_risks(self, risk_result: RiskComputeResponse, plan_hours: int) -> List[PlanTask]:
        tasks: List[PlanTask] = []
        labels: Set[str] = {ep.label.value for ep in risk_result.risk_episodes}
        strain = risk_result.circadian_strain_score
        episodes = risk_result.risk_episodes[:6]

        # ── Core tasks: one per risk episode (sleep / nap / safety) ──────────
        for idx, ep in enumerate(episodes):
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
            else:  # unsafe_drive
                category = TaskCategory.safety
                title = "Use safe commute plan"
                duration = 15
                anchor = True

            tasks.append(PlanTask(
                id=uuid4(),
                category=category,
                title=title,
                description=f"Recommended due to {label.replace('_', ' ')} risk.",
                scheduled_time=when,
                duration_minutes=duration,
                anchor_flag=anchor,
                optional_flag=False,
                source_reason=ep.explanation.get("message", ""),
                sort_order=idx,
            ))

        # ── New categories (Part 4) ────────────────────────────────────────

        # Reference point: earliest episode start, or fallback to first task time
        ref_time = (
            min(ep.start_time for ep in episodes)
            if episodes
            else tasks[0].scheduled_time if tasks
            else None
        )
        ep_end = (
            max(ep.end_time for ep in episodes)
            if episodes else None
        )

        base_idx = len(tasks)

        # 1. caffeine_cutoff — 6h before earliest risk window when any risk present
        if episodes and ref_time:
            cutoff_time = ref_time - timedelta(hours=6)
            tasks.append(PlanTask(
                id=uuid4(),
                category=TaskCategory.caffeine_cutoff,
                title="Stop caffeine now",
                description=(
                    "Avoid all caffeine from this point. Caffeine has a 5-6h half-life "
                    "and will fragment your upcoming sleep window."
                ),
                scheduled_time=cutoff_time,
                duration_minutes=5,
                anchor_flag=False,
                optional_flag=False,
                source_reason="Caffeine cutoff must precede sleep anchor by ≥6 hours.",
                sort_order=base_idx,
            ))
            base_idx += 1

        # 2. light_timing — context-aware: avoid light when heading to bed during the day
        #    (night shift ending 03:00–12:59), seek light at estimated wake time.
        #    For day/evening shifts ending in the afternoon or night, standard morning-light task.
        if labels & {"rapid_flip", "low_recovery"} and ep_end:
            ep_end_hour = ep_end.hour  # 0-23

            if 3 <= ep_end_hour < 13:
                # Night shift ending: worker is going to sleep during the day.
                # Step 1 — avoid bright light immediately (blocks melatonin).
                tasks.append(PlanTask(
                    id=uuid4(),
                    category=TaskCategory.light_timing,
                    title="Block out light — going to sleep now",
                    description=(
                        "Close blackout curtains and wear an eye mask before lying down. "
                        "Bright daylight suppresses melatonin and will prevent you from falling "
                        "asleep — darkness is the priority right now."
                    ),
                    scheduled_time=ep_end + timedelta(minutes=15),
                    duration_minutes=5,
                    anchor_flag=False,
                    optional_flag=False,
                    source_reason=(
                        "Night shift ends during daylight hours — bright light exposure now "
                        "would suppress melatonin and block recovery sleep onset."
                    ),
                    sort_order=base_idx,
                ))
                base_idx += 1

                # Step 2 — seek bright light at estimated wake (ep_end + ~7.5 h).
                estimated_wake = ep_end + timedelta(hours=7, minutes=30)
                tasks.append(PlanTask(
                    id=uuid4(),
                    category=TaskCategory.light_timing,
                    title="Bright light on waking — 15 min outdoors",
                    description=(
                        "Step outside or sit by a bright window for 15 minutes as soon as you wake. "
                        "This anchors your circadian clock to the correct local time and makes "
                        "tonight's sleep easier to initiate at a sensible hour."
                    ),
                    scheduled_time=estimated_wake,
                    duration_minutes=15,
                    anchor_flag=False,
                    optional_flag=False,
                    source_reason=(
                        "Bright light on waking after night-shift recovery sleep resets "
                        "the circadian phase and accelerates realignment."
                    ),
                    sort_order=base_idx,
                ))
                base_idx += 1
            else:
                # Day/evening shift — seek bright natural light shortly after waking.
                light_time = ep_end + timedelta(minutes=30)
                tasks.append(PlanTask(
                    id=uuid4(),
                    category=TaskCategory.light_timing,
                    title="Bright light exposure on waking",
                    description=(
                        "Get 15–20 min of bright natural or lamp light (≥10,000 lux) after waking. "
                        "This resets your circadian anchor after shift disruption."
                    ),
                    scheduled_time=light_time,
                    duration_minutes=20,
                    anchor_flag=False,
                    optional_flag=False,
                    source_reason=(
                        "Bright light after recovery sleep accelerates circadian realignment."
                    ),
                    sort_order=base_idx,
                ))
                base_idx += 1

        # 3. relaxation — decompression within 1h of shift end (before sleep for night workers)
        if episodes and ep_end:
            relax_time = ep_end + timedelta(minutes=30)
            relax_desc = (
                "10-minute decompression: dim lights, avoid screens, do light stretching "
                "or breathing exercises. Cortisol needs time to drop before sleep."
            )
            # Night shift ending during the day: decompression is pre-sleep, make that explicit
            ep_end_hour = ep_end.hour
            if 3 <= ep_end_hour < 13:
                relax_desc = (
                    "10-minute wind-down before bed: dim all lights, avoid phone screens, "
                    "do slow breathing or light stretching. Your body is still in shift mode — "
                    "cortisol needs 20–30 min to drop enough for sleep to start."
                )
            tasks.append(PlanTask(
                id=uuid4(),
                category=TaskCategory.relaxation,
                title="Decompression wind-down before sleep",
                description=relax_desc,
                scheduled_time=relax_time,
                duration_minutes=10,
                anchor_flag=False,
                optional_flag=True,
                source_reason="Post-shift cortisol spike delays sleep onset without a decompression buffer.",
                sort_order=base_idx,
            ))
            base_idx += 1

        # 4. movement — 20-min block in recovery window (low-risk gap)
        if episodes and ep_end:
            move_time = ep_end + timedelta(hours=2)
            tasks.append(PlanTask(
                id=uuid4(),
                category=TaskCategory.movement,
                title="Light movement block",
                description=(
                    "20-minute walk or gentle exercise during your recovery window. "
                    "Moderate movement improves sleep quality without raising core temperature too much."
                ),
                scheduled_time=move_time,
                duration_minutes=20,
                anchor_flag=False,
                optional_flag=True,
                source_reason="Light movement in the recovery window improves next-sleep quality.",
                sort_order=base_idx,
            ))
            base_idx += 1

        # 5. mindfulness — 10-min block after high-strain cluster (strain ≥ 75)
        if strain >= 75 and ep_end:
            mind_time = ep_end + timedelta(hours=3)
            tasks.append(PlanTask(
                id=uuid4(),
                category=TaskCategory.mindfulness,
                title="Mindfulness recovery session",
                description=(
                    "10-minute guided breathing or body-scan meditation. "
                    "High circadian strain elevates cortisol — mindfulness accelerates HPA-axis recovery."
                ),
                scheduled_time=mind_time,
                duration_minutes=10,
                anchor_flag=False,
                optional_flag=True,
                source_reason=f"Circadian strain score {strain:.0f}/100 indicates high physiological load.",
                sort_order=base_idx,
            ))
            base_idx += 1

        # 6. meal — one meal timing anchor per 24-hour window
        if ref_time:
            meal_time = ref_time + timedelta(hours=4)
            tasks.append(PlanTask(
                id=uuid4(),
                category=TaskCategory.meal,
                title="Timed meal anchor",
                description=(
                    "Eat a balanced meal at this fixed time each recovery day. "
                    "Consistent meal timing is a secondary zeitgeber that reinforces circadian rhythm."
                ),
                scheduled_time=meal_time,
                duration_minutes=30,
                anchor_flag=False,
                optional_flag=False,
                source_reason="Meal timing anchors support circadian realignment alongside sleep.",
                sort_order=base_idx,
            ))
            base_idx += 1

        # 7. social — brief positive social contact on first off-day after high-strain cluster
        #    3f: emit when strain >= 50 AND episode set contains rapid_flip or low_recovery
        if strain >= 50 and labels & {"rapid_flip", "low_recovery"} and ep_end:
            social_time = ep_end + timedelta(hours=5)
            tasks.append(PlanTask(
                id=uuid4(),
                category=TaskCategory.social,
                title="Brief positive social contact",
                description=(
                    "Call a friend or have a short conversation with family. "
                    "Brief positive social contact on your first recovery day anchors your "
                    "emotional circadian rhythm and reduces allostatic load."
                ),
                scheduled_time=social_time,
                duration_minutes=20,
                anchor_flag=False,
                optional_flag=True,
                source_reason=(
                    f"Strain {strain:.0f}/100 with {'rapid_flip' if 'rapid_flip' in labels else 'low_recovery'} "
                    "risk — social grounding supports emotional recovery."
                ),
                sort_order=base_idx,
            ))

        return tasks

    @staticmethod
    def _clamp_to_future(task: PlanTask) -> PlanTask:
        """
        3a: If a task's scheduled_time is in the past, advance it by the minimum
        number of whole hours needed to put it in the future.
        Modifies in place and returns the task for convenience.
        """
        now = datetime.now(timezone.utc)
        # Make now timezone-aware if scheduled_time is naive
        scheduled = task.scheduled_time
        if scheduled.tzinfo is None:
            now_ref = datetime.now()
        else:
            now_ref = now
        if scheduled < now_ref:
            hours_behind = int((now_ref - scheduled).total_seconds() / 3600) + 1
            task.scheduled_time = scheduled + timedelta(hours=hours_behind)
        return task

    @staticmethod
    def _sort_tasks(tasks: List[PlanTask]) -> List[PlanTask]:
        """
        3b: Sort anchor tasks first (sort_order 0–99, by scheduled_time),
        then optional/non-anchor tasks (sort_order 100+, by scheduled_time).
        """
        anchors = sorted([t for t in tasks if t.anchor_flag], key=lambda t: t.scheduled_time)
        non_anchors = sorted([t for t in tasks if not t.anchor_flag], key=lambda t: t.scheduled_time)
        for i, t in enumerate(anchors):
            t.sort_order = i
        for i, t in enumerate(non_anchors):
            t.sort_order = 100 + i
        return anchors + non_anchors

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

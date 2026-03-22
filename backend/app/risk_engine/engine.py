from datetime import timedelta
from typing import List, Optional

from app.models.schemas import RiskComputeResponse, RiskEpisode, ScheduleBlock
from app.risk_engine.detectors import (
    detect_low_recovery,
    detect_rapid_flip,
    detect_short_turnaround,
    detect_unsafe_drive,
)


class RiskEngine:
    def compute(
        self,
        blocks: List[ScheduleBlock],
        risk_profile: Optional[dict] = None,
    ) -> RiskComputeResponse:
        # 4d: extract personalization settings from risk_profile
        profile = risk_profile or {}
        sleep_minimum_hours: float = float(profile.get("sleep_minimum_hours", 7.0))
        rapid_flip_sensitivity: str = profile.get("rapid_flip_sensitivity", "normal")

        episodes: List[RiskEpisode] = []
        episodes.extend(detect_rapid_flip(blocks, rapid_flip_sensitivity=rapid_flip_sensitivity))
        episodes.extend(detect_short_turnaround(blocks))
        episodes.extend(detect_low_recovery(blocks, sleep_minimum_hours=sleep_minimum_hours))
        episodes.extend(detect_unsafe_drive(blocks))

        # 4a: temporal clustering — apply 1.2x multiplier to episodes in ≥3-episode clusters
        episodes = self._apply_cluster_multiplier(episodes)

        # 4c: overlap deduplication — merge episode pairs with ≥50% window overlap
        episodes = self._deduplicate_overlapping(episodes)

        episodes.sort(key=lambda e: (-e.severity_score, e.start_time))
        strain = self._compute_strain_score(episodes)
        summary = self._summary(episodes, strain)
        return RiskComputeResponse(
            circadian_strain_score=strain,
            risk_episodes=episodes,
            summary=summary,
        )

    @staticmethod
    def _apply_cluster_multiplier(episodes: List[RiskEpisode]) -> List[RiskEpisode]:
        """
        4a: Group episodes by label. If ≥3 episodes of the same label occur
        within any 7-day window, mark them as clustered and apply a 1.2×
        severity score multiplier.
        """
        _7_days = timedelta(days=7)
        by_label: dict[str, List[RiskEpisode]] = {}
        for ep in episodes:
            by_label.setdefault(ep.label.value, []).append(ep)

        for label, eps in by_label.items():
            sorted_eps = sorted(eps, key=lambda e: e.start_time)
            # Sliding window check: any 7-day span containing ≥3 episodes
            cluster_ids: set = set()
            for i, ep_i in enumerate(sorted_eps):
                window = [ep_i]
                for ep_j in sorted_eps[i + 1:]:
                    if (ep_j.start_time - ep_i.start_time) <= _7_days:
                        window.append(ep_j)
                if len(window) >= 3:
                    for ep in window:
                        cluster_ids.add(ep.id)

            for ep in eps:
                if ep.id in cluster_ids:
                    ep.cluster_flag = True
                    ep.severity_score = min(100.0, round(ep.severity_score * 1.2, 1))
                    ep.explanation["cluster"] = f"{len(cluster_ids)} {label} episodes (clustered)"

        return episodes

    @staticmethod
    def _deduplicate_overlapping(episodes: List[RiskEpisode]) -> List[RiskEpisode]:
        """
        4c: When two episodes from different detectors have windows that overlap
        by ≥50%, keep the higher-severity one and merge the other's interventions.
        Removes duplicate confusing warnings from the dashboard.
        """
        if len(episodes) < 2:
            return episodes

        def overlap_pct(a: RiskEpisode, b: RiskEpisode) -> float:
            latest_start = max(a.start_time, b.start_time)
            earliest_end = min(a.end_time, b.end_time)
            overlap_secs = max(0.0, (earliest_end - latest_start).total_seconds())
            dur_a = max(1, (a.end_time - a.start_time).total_seconds())
            dur_b = max(1, (b.end_time - b.start_time).total_seconds())
            # overlap as fraction of the shorter episode
            return overlap_secs / min(dur_a, dur_b)

        remove_ids: set = set()
        eps = sorted(episodes, key=lambda e: e.start_time)
        for i in range(len(eps)):
            if eps[i].id in remove_ids:
                continue
            for j in range(i + 1, len(eps)):
                if eps[j].id in remove_ids:
                    continue
                if eps[i].label == eps[j].label:
                    continue  # same detector — don't dedup within detector
                if overlap_pct(eps[i], eps[j]) >= 0.5:
                    # Keep higher severity, merge interventions into it
                    keep, drop = (eps[i], eps[j]) if eps[i].severity_score >= eps[j].severity_score else (eps[j], eps[i])
                    merged = list({*keep.suggested_interventions, *drop.suggested_interventions})
                    keep.suggested_interventions = merged
                    keep.explanation["merged_with"] = keep.explanation.get("merged_with", []) + [str(drop.id)]
                    remove_ids.add(drop.id)

        return [ep for ep in episodes if ep.id not in remove_ids]

    @staticmethod
    def _compute_strain_score(episodes: List[RiskEpisode]) -> float:
        if not episodes:
            return 0.0
        capped = episodes[:10]
        avg = sum(e.severity_score for e in capped) / len(capped)
        multiplier = min(1.6, 1.0 + (len(capped) - 1) * 0.06)
        return round(min(100.0, avg * multiplier), 1)

    @staticmethod
    def _summary(episodes: List[RiskEpisode], strain: float) -> str:
        if not episodes:
            return "No significant circadian risks detected."
        labels = {}
        for e in episodes:
            labels[e.label.value] = labels.get(e.label.value, 0) + 1
        top = sorted(labels.items(), key=lambda kv: kv[1], reverse=True)[:3]
        top_text = ", ".join([f"{k} ({v})" for k, v in top])
        return f"Circadian strain score: {strain}/100. Top risks: {top_text}."

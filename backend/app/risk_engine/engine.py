from typing import List

from app.models.schemas import RiskComputeResponse, RiskEpisode, ScheduleBlock
from app.risk_engine.detectors import (
    detect_low_recovery,
    detect_rapid_flip,
    detect_short_turnaround,
    detect_unsafe_drive,
)


class RiskEngine:
    def compute(self, blocks: List[ScheduleBlock]) -> RiskComputeResponse:
        episodes: List[RiskEpisode] = []
        episodes.extend(detect_rapid_flip(blocks))
        episodes.extend(detect_short_turnaround(blocks))
        episodes.extend(detect_low_recovery(blocks))
        episodes.extend(detect_unsafe_drive(blocks))

        episodes.sort(key=lambda e: (-e.severity_score, e.start_time))
        strain = self._compute_strain_score(episodes)
        summary = self._summary(episodes, strain)
        return RiskComputeResponse(
            circadian_strain_score=strain,
            risk_episodes=episodes,
            summary=summary,
        )

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

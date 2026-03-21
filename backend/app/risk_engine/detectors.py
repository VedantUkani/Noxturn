from datetime import timedelta
from typing import List
from uuid import uuid4

from app.models.schemas import RiskEpisode, RiskLabel, ScheduleBlock, Severity


def detect_rapid_flip(blocks: List[ScheduleBlock]) -> List[RiskEpisode]:
    episodes: List[RiskEpisode] = []
    ordered = sorted(blocks, key=lambda b: b.start_time)

    for i in range(len(ordered) - 1):
        current = ordered[i]
        nxt = ordered[i + 1]
        is_flip = (
            (current.block_type.value == "night_shift" and nxt.block_type.value == "day_shift")
            or (current.block_type.value == "day_shift" and nxt.block_type.value == "night_shift")
        )
        if not is_flip:
            continue

        gap_hours = (nxt.start_time - current.end_time).total_seconds() / 3600
        if gap_hours >= 48:
            continue
        if gap_hours < 24:
            severity, score = Severity.critical, 95.0
        elif gap_hours < 36:
            severity, score = Severity.high, 75.0
        else:
            severity, score = Severity.moderate, 50.0

        episodes.append(
            RiskEpisode(
                id=uuid4(),
                label=RiskLabel.rapid_flip,
                severity=severity,
                severity_score=score,
                start_time=current.end_time,
                end_time=nxt.start_time,
                explanation={"message": f"Rapid shift flip with only {round(gap_hours, 1)}h transition."},
                contributing_features={"block_ids": [str(current.id), str(nxt.id)]},
                suggested_interventions=["int_post_night_sleep_protection", "int_bright_light_after_wake"],
            )
        )
    return episodes


def detect_short_turnaround(blocks: List[ScheduleBlock]) -> List[RiskEpisode]:
    episodes: List[RiskEpisode] = []
    ordered = sorted([b for b in blocks if b.block_type.value != "off_day"], key=lambda b: b.start_time)

    for i in range(len(ordered) - 1):
        current = ordered[i]
        nxt = ordered[i + 1]
        end = current.end_time + timedelta(minutes=current.commute_after_minutes)
        start = nxt.start_time - timedelta(minutes=nxt.commute_before_minutes)
        rest_hours = (start - end).total_seconds() / 3600
        if rest_hours >= 11:
            continue

        if rest_hours < 6:
            severity, score = Severity.critical, 90.0
        elif rest_hours < 8:
            severity, score = Severity.high, 70.0
        else:
            severity, score = Severity.moderate, 50.0

        episodes.append(
            RiskEpisode(
                id=uuid4(),
                label=RiskLabel.short_turnaround,
                severity=severity,
                severity_score=score,
                start_time=current.end_time,
                end_time=nxt.start_time,
                explanation={"message": f"Only {round(rest_hours, 1)}h rest between shifts (target 11h+)."},
                contributing_features={"block_ids": [str(current.id), str(nxt.id)]},
                suggested_interventions=["int_nap_protection", "int_caffeine_cutoff"],
            )
        )
    return episodes


def detect_low_recovery(blocks: List[ScheduleBlock]) -> List[RiskEpisode]:
    episodes: List[RiskEpisode] = []
    ordered = sorted([b for b in blocks if b.block_type.value != "off_day"], key=lambda b: b.start_time)

    for i in range(len(ordered) - 1):
        current = ordered[i]
        nxt = ordered[i + 1]
        total_gap_hours = (nxt.start_time - current.end_time).total_seconds() / 3600
        available_sleep = total_gap_hours - 1.5  # personal baseline buffer
        if available_sleep >= 7:
            continue

        if available_sleep < 4:
            severity, score = Severity.critical, 90.0
        elif available_sleep < 5.5:
            severity, score = Severity.high, 70.0
        else:
            severity, score = Severity.moderate, 45.0

        episodes.append(
            RiskEpisode(
                id=uuid4(),
                label=RiskLabel.low_recovery,
                severity=severity,
                severity_score=score,
                start_time=current.end_time,
                end_time=nxt.start_time,
                explanation={"message": f"Only {round(available_sleep, 1)}h realistic sleep opportunity."},
                contributing_features={"block_ids": [str(current.id), str(nxt.id)]},
                suggested_interventions=["int_post_night_sleep_protection", "int_warm_shower_wind_down"],
            )
        )
    return episodes


def detect_unsafe_drive(blocks: List[ScheduleBlock]) -> List[RiskEpisode]:
    episodes: List[RiskEpisode] = []
    for block in blocks:
        if block.block_type.value != "night_shift":
            continue
        if block.commute_after_minutes < 30:
            continue

        if block.commute_after_minutes >= 60:
            severity, score = Severity.critical, 90.0
        elif block.commute_after_minutes >= 45:
            severity, score = Severity.high, 75.0
        else:
            severity, score = Severity.moderate, 55.0

        episodes.append(
            RiskEpisode(
                id=uuid4(),
                label=RiskLabel.unsafe_drive,
                severity=severity,
                severity_score=score,
                start_time=block.end_time,
                end_time=block.end_time + timedelta(minutes=block.commute_after_minutes),
                explanation={"message": "Post-night-shift commute increases drowsy driving risk."},
                contributing_features={"block_ids": [str(block.id)]},
                suggested_interventions=["int_nap_protection", "int_caffeine_strategic"],
            )
        )
    return episodes

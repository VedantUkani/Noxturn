from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class BlockType(str, Enum):
    day_shift = "day_shift"
    night_shift = "night_shift"
    evening_shift = "evening_shift"
    off_day = "off_day"
    transition_day = "transition_day"


class RiskLabel(str, Enum):
    rapid_flip = "rapid_flip"
    short_turnaround = "short_turnaround"
    low_recovery = "low_recovery"
    unsafe_drive = "unsafe_drive"


class Severity(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    critical = "critical"


class TaskCategory(str, Enum):
    sleep = "sleep"
    nap = "nap"
    light_timing = "light_timing"
    caffeine_cutoff = "caffeine_cutoff"
    meal = "meal"
    social = "social"
    relaxation = "relaxation"
    movement = "movement"
    mindfulness = "mindfulness"
    safety = "safety"
    buddy_checkin = "buddy_checkin"


class TaskStatus(str, Enum):
    planned = "planned"
    completed = "completed"
    skipped = "skipped"
    expired = "expired"


class ScheduleBlock(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    block_type: BlockType
    title: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_hours: Optional[float] = None
    commute_before_minutes: int = 0
    commute_after_minutes: int = 0


class RiskEpisode(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    label: RiskLabel
    severity: Severity
    severity_score: float = Field(ge=0, le=100)
    start_time: datetime
    end_time: datetime
    explanation: Dict
    contributing_features: Optional[Dict] = None
    suggested_interventions: List[str] = []


class PlanTask(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    category: TaskCategory
    title: str
    description: Optional[str] = None
    scheduled_time: datetime
    duration_minutes: int
    anchor_flag: bool = False
    optional_flag: bool = False
    source_reason: Optional[str] = None
    evidence_ref: Optional[str] = None
    status: TaskStatus = TaskStatus.planned
    sort_order: int = 0


class ScheduleImportRequest(BaseModel):
    raw_text: Optional[str] = None
    blocks: Optional[List[ScheduleBlock]] = None
    commute_minutes: int = 30


class ScheduleImportResponse(BaseModel):
    blocks: List[ScheduleBlock]
    warnings: List[str] = []
    parse_confidence: float = 1.0

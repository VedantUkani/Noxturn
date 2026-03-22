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
    user_id: Optional[UUID] = None
    raw_text: Optional[str] = None
    blocks: Optional[List[ScheduleBlock]] = None
    commute_minutes: int = 30


class ScheduleImportResponse(BaseModel):
    blocks: List[ScheduleBlock]
    warnings: List[str] = []
    parse_confidence: float = 1.0
    replan_recommended: bool = False
    change_summary: List[str] = []


class RiskComputeRequest(BaseModel):
    user_id: Optional[UUID] = None
    blocks: List[ScheduleBlock]
    commute_minutes: int = 30


class RiskComputeResponse(BaseModel):
    circadian_strain_score: float = Field(ge=0, le=100)
    risk_episodes: List[RiskEpisode]
    summary: str


class PlanGenerateRequest(BaseModel):
    user_id: Optional[UUID] = None
    blocks: List[ScheduleBlock]
    commute_minutes: int = 30
    plan_hours: int = 48
    persona_id: Optional[str] = None


class NextBestAction(BaseModel):
    """Hero + ordering hint for Today; authored by Claude (plan JSON) or rule planner."""

    task_id: UUID
    category: TaskCategory
    title: str
    description: str
    why_now: str
    duration_minutes: int


class PlanGenerateResponse(BaseModel):
    plan_mode: str
    risk_summary: Dict
    tasks: List[PlanTask]
    avoid_list: List[str]
    next_best_action: NextBestAction
    evidence_refs: List[Dict] = []


class TaskEventType(str, Enum):
    completed = "completed"
    skipped = "skipped"
    expired = "expired"


class TaskEventCreate(BaseModel):
    user_id: Optional[UUID] = None
    task_id: UUID
    status: TaskEventType
    notes: Optional[str] = None


class TaskEventResponse(BaseModel):
    task_id: UUID
    old_status: TaskStatus
    new_status: TaskStatus
    trigger_replan: bool
    message: str


class ReplanRequest(BaseModel):
    user_id: Optional[UUID] = None
    blocks: List[ScheduleBlock]
    commute_minutes: int = 30
    trigger: str = "task_event"
    task_event: Optional[TaskEventCreate] = None
    use_claude: bool = False
    persona_id: Optional[str] = None


class ReplanResponse(BaseModel):
    updated_plan: PlanGenerateResponse
    changes_summary: str
    what_changed: List[str]
    why_changed: str


class WearableImportRequest(BaseModel):
    user_id: Optional[UUID] = None
    sleep_hrs: float
    sleep_start: datetime
    sleep_end: datetime
    restlessness: Optional[float] = None
    resting_hr: Optional[float] = None


class WearableImportResponse(BaseModel):
    sleep_hrs: float
    sleep_start: datetime
    sleep_end: datetime
    restlessness: Optional[float] = None
    resting_hr: Optional[float] = None
    recovery_score: float = Field(ge=0, le=100)
    source: str = "wearable_import"


class DashboardTodayResponse(BaseModel):
    """Today surface: plan mode, next-best, anchors, and recovery fields from the planner agent."""

    user_id: Optional[UUID] = None
    plan_mode: str
    next_best_action: NextBestAction
    anchor_tasks: List[PlanTask]
    recovery_rhythm_label: str
    recovery_score: Optional[float] = None


class ShiftSandboxRequest(BaseModel):
    user_id: Optional[UUID] = None
    current_blocks: List[ScheduleBlock]
    hypothetical_shifts: List[ScheduleBlock]
    remove_shift_ids: Optional[List[UUID]] = None
    commute_minutes: int = 30


class ShiftSandboxResponse(BaseModel):
    original_strain_score: float = Field(ge=0, le=100)
    projected_strain_score: float = Field(ge=0, le=100)
    strain_delta: float
    recovery_bottleneck: Dict
    verdict: str
    explanation: str

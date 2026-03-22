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
    cluster_flag: bool = False  # 4a: True if part of a ≥3-episode cluster in 7 days


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
    raw_text: Optional[str] = Field(None, max_length=50_000)  # 8b: input length limit
    blocks: Optional[List[ScheduleBlock]] = None
    commute_minutes: int = 30
    merge_mode: str = Field("replace", pattern="^(replace|merge)$")  # 8c: replace or merge existing blocks


class ScheduleImportResponse(BaseModel):
    blocks: List[ScheduleBlock]
    warnings: List[str] = []
    parse_confidence: float = 1.0
    replan_recommended: bool = False
    change_summary: List[str] = []
    updated_plan: Optional["PlanGenerateResponse"] = None


class RiskComputeRequest(BaseModel):
    user_id: Optional[UUID] = None
    blocks: List[ScheduleBlock]
    commute_minutes: int = 30
    risk_profile: Optional[Dict] = None  # 4d: personalization — sleep_minimum_hours, rapid_flip_sensitivity


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
    plan_diff: Optional[List[str]] = None  # 3e: what changed vs previous plan


class TaskEventType(str, Enum):
    completed = "completed"
    skipped = "skipped"
    expired = "expired"


class TaskEventCreate(BaseModel):
    user_id: Optional[UUID] = None
    task_id: UUID
    status: TaskEventType
    notes: Optional[str] = Field(None, max_length=2_000)  # 8b: input length limit


class TaskEventResponse(BaseModel):
    task_id: UUID
    old_status: TaskStatus
    new_status: TaskStatus
    trigger_replan: bool
    message: str
    updated_plan: Optional["PlanGenerateResponse"] = None


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
    data_source: str = "memory"  # 7b: "memory" | "db_fallback"


class StreakResponse(BaseModel):
    user_id: str
    current_streak: int          # consecutive days with ≥1 anchor completed
    longest_streak: int          # all-time longest
    last_completed_date: Optional[str] = None  # ISO date string


class WeeklySummaryResponse(BaseModel):
    user_id: str
    week_start: str              # ISO date of Monday
    tasks_completed: int
    tasks_skipped: int
    tasks_expired: int
    protected_blocks_held: int   # anchor tasks completed
    recovery_rhythm_trend: str   # "improving" | "steady" | "declining" | "insufficient_data"
    anomaly_flag: Optional[str] = None  # 6d: "sharp_drop" | "zero_anchors" | "streak_broken" | None


class RecoveryConsistencyResponse(BaseModel):
    user_id: str
    period_days: int             # always 7
    anchors_total: int
    anchors_completed: int
    consistency_pct: float       # 0-100
    label: str                   # "strong" | "moderate" | "low" | "none"


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


# ── Auth ──────────────────────────────────────────────────────────────────────

class AuthRegisterRequest(BaseModel):
    email: str
    name: str
    role: Optional[str] = "nurse"
    commute_minutes: Optional[int] = 45
    timezone: Optional[str] = "UTC"


class AuthLoginRequest(BaseModel):
    email: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    expires_in_days: int = 7

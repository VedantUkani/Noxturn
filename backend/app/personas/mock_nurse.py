from datetime import datetime
from typing import List
from uuid import uuid4

from app.models.schemas import ScheduleBlock


def get_mock_nurse_blocks() -> List[ScheduleBlock]:
    # Scenario:
    # - 3 consecutive night shifts
    # - short recovery window
    # - rapid flip into a day shift
    return [
        ScheduleBlock(
            id=uuid4(),
            block_type="night_shift",
            title="ICU Night Shift 1",
            start_time=datetime.fromisoformat("2026-03-23T19:00:00"),
            end_time=datetime.fromisoformat("2026-03-24T07:00:00"),
            commute_before_minutes=45,
            commute_after_minutes=45,
        ),
        ScheduleBlock(
            id=uuid4(),
            block_type="night_shift",
            title="ICU Night Shift 2",
            start_time=datetime.fromisoformat("2026-03-24T19:00:00"),
            end_time=datetime.fromisoformat("2026-03-25T07:00:00"),
            commute_before_minutes=45,
            commute_after_minutes=45,
        ),
        ScheduleBlock(
            id=uuid4(),
            block_type="night_shift",
            title="ICU Night Shift 3",
            start_time=datetime.fromisoformat("2026-03-25T19:00:00"),
            end_time=datetime.fromisoformat("2026-03-26T07:00:00"),
            commute_before_minutes=45,
            commute_after_minutes=45,
        ),
        ScheduleBlock(
            id=uuid4(),
            block_type="day_shift",
            title="ICU Day Shift (Rapid Flip)",
            start_time=datetime.fromisoformat("2026-03-26T15:00:00"),
            end_time=datetime.fromisoformat("2026-03-26T23:00:00"),
            commute_before_minutes=45,
            commute_after_minutes=45,
        ),
    ]

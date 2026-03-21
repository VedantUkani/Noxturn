"""
Schedule upload — Feature 1: Excel / CSV file upload.

Supported formats:
  .csv  — comma or semicolon separated
  .xlsx — Excel workbook (first sheet used)
  .xls  — Legacy Excel (via openpyxl fallback)

Column detection (case-insensitive, tries header names first then position):
  block_type  → "type", "block_type", "shift_type", "shift"
  start_time  → "start", "start_time", "from", "begin"
  end_time    → "end",   "end_time",   "to",   "finish"
  title       → "title", "name", "description", "label"   (optional)

Block type aliases (common names hospital workers use):
  night / n / night shift  → night_shift
  day   / d / day shift    → day_shift
  eve   / evening          → evening_shift
  off   / rest / off day   → off_day
  transition               → transition_day
"""

import csv
import io
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.middleware.auth import require_user

from app.models.schemas import ScheduleBlock, ScheduleImportResponse
from app.services.persistence import save_schedule_blocks
from app.services.schedule_change_detector import detect_changes

router = APIRouter(prefix="/schedule", tags=["Schedule"])

# ── Block type alias map ───────────────────────────────────────────────────────

_BLOCK_TYPE_ALIASES = {
    "night": "night_shift",
    "night shift": "night_shift",
    "night_shift": "night_shift",
    "n": "night_shift",
    "day": "day_shift",
    "day shift": "day_shift",
    "day_shift": "day_shift",
    "d": "day_shift",
    "evening": "evening_shift",
    "evening shift": "evening_shift",
    "evening_shift": "evening_shift",
    "eve": "evening_shift",
    "e": "evening_shift",
    "off": "off_day",
    "off day": "off_day",
    "off_day": "off_day",
    "rest": "off_day",
    "transition": "transition_day",
    "transition day": "transition_day",
    "transition_day": "transition_day",
}

_BLOCK_TYPE_COL_NAMES = {"type", "block_type", "shift_type", "shift"}
_START_COL_NAMES      = {"start", "start_time", "from", "begin", "starttime", "start time"}
_END_COL_NAMES        = {"end", "end_time", "to", "finish", "endtime", "end time"}
_TITLE_COL_NAMES      = {"title", "name", "description", "label", "note"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _resolve_block_type(raw: str) -> str:
    key = raw.strip().lower()
    resolved = _BLOCK_TYPE_ALIASES.get(key)
    if not resolved:
        raise ValueError(f"Unknown block_type '{raw}'. Valid: night_shift, day_shift, evening_shift, off_day, transition_day")
    return resolved


def _parse_datetime(raw: str) -> datetime:
    raw = str(raw).strip()
    for fmt in (
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d %H:%M",
        "%d/%m/%Y %H:%M",
        "%m/%d/%Y %H:%M",
        "%d-%m-%Y %H:%M",
    ):
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    raise ValueError(f"Cannot parse datetime '{raw}'. Use ISO format: YYYY-MM-DDTHH:MM:SS")


def _find_col(headers: List[str], candidates: set) -> Optional[int]:
    for i, h in enumerate(headers):
        if h.strip().lower() in candidates:
            return i
    return None


def _rows_to_blocks(
    headers: List[str],
    rows: List[List[str]],
    commute_minutes: int,
) -> tuple[List[ScheduleBlock], List[str]]:
    """Convert header + data rows into ScheduleBlock list. Returns (blocks, warnings)."""

    bt_idx = _find_col(headers, _BLOCK_TYPE_COL_NAMES)
    st_idx = _find_col(headers, _START_COL_NAMES)
    en_idx = _find_col(headers, _END_COL_NAMES)
    ti_idx = _find_col(headers, _TITLE_COL_NAMES)

    # Fallback: use positional columns if no named headers match
    if bt_idx is None and st_idx is None and en_idx is None:
        bt_idx, st_idx, en_idx = 0, 1, 2
        ti_idx = 3 if len(headers) > 3 else None

    if bt_idx is None or st_idx is None or en_idx is None:
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not identify required columns. "
                "Expected headers: block_type (or 'type'/'shift'), "
                "start_time (or 'start'/'from'), end_time (or 'end'/'to'). "
                "Or provide columns in that order without headers."
            ),
        )

    blocks: List[ScheduleBlock] = []
    warnings: List[str] = []

    for line_num, row in enumerate(rows, start=2):
        if not any(str(c).strip() for c in row):
            continue  # skip blank rows
        try:
            raw_bt = str(row[bt_idx]).strip()
            raw_st = str(row[st_idx]).strip()
            raw_en = str(row[en_idx]).strip()
            if not raw_bt or not raw_st or not raw_en:
                warnings.append(f"Row {line_num}: empty required cell — skipped")
                continue

            block_type = _resolve_block_type(raw_bt)
            start_time = _parse_datetime(raw_st)
            end_time   = _parse_datetime(raw_en)

            if end_time <= start_time:
                warnings.append(f"Row {line_num}: end_time must be after start_time — skipped")
                continue

            title = str(row[ti_idx]).strip() if (ti_idx is not None and ti_idx < len(row)) else None
            duration_hours = (end_time - start_time).total_seconds() / 3600

            blocks.append(
                ScheduleBlock(
                    id=uuid4(),
                    block_type=block_type,
                    title=title or None,
                    start_time=start_time,
                    end_time=end_time,
                    duration_hours=round(duration_hours, 2),
                    commute_before_minutes=commute_minutes,
                    commute_after_minutes=commute_minutes,
                )
            )
        except ValueError as exc:
            warnings.append(f"Row {line_num}: {exc} — skipped")

    return blocks, warnings


# ── CSV parser ────────────────────────────────────────────────────────────────

def _looks_like_header(row: List[str]) -> bool:
    """Return True if the first row appears to be column headers (not data)."""
    combined = {c.strip().lower() for c in row}
    known = (
        _BLOCK_TYPE_COL_NAMES | _START_COL_NAMES | _END_COL_NAMES | _TITLE_COL_NAMES
    )
    return bool(combined & known)


def _parse_csv(content: bytes, commute_minutes: int) -> tuple[List[ScheduleBlock], List[str]]:
    text = content.decode("utf-8-sig")  # strip BOM if present
    dialect = csv.Sniffer().sniff(text[:2048], delimiters=",;\t")
    reader = csv.reader(io.StringIO(text), dialect)
    all_rows = [row for row in reader if row]
    if not all_rows:
        raise HTTPException(status_code=422, detail="CSV file is empty")

    if _looks_like_header(all_rows[0]):
        headers   = all_rows[0]
        data_rows = all_rows[1:]
    else:
        # No header row — use positional mode, treat all rows as data
        headers   = all_rows[0]   # passed to _rows_to_blocks for column detection
        data_rows = all_rows      # include first row as data; positional fallback will kick in
    return _rows_to_blocks(headers, data_rows, commute_minutes)


# ── Excel parser ──────────────────────────────────────────────────────────────

def _parse_excel(content: bytes, commute_minutes: int) -> tuple[List[ScheduleBlock], List[str]]:
    try:
        import openpyxl
    except ImportError:
        raise HTTPException(status_code=500, detail="openpyxl not installed. Run: pip install openpyxl")

    wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
    ws = wb.active

    all_rows = []
    for row in ws.iter_rows(values_only=True):
        all_rows.append([str(cell) if cell is not None else "" for cell in row])

    if not all_rows:
        raise HTTPException(status_code=422, detail="Excel file is empty")

    # Skip fully-empty leading rows
    while all_rows and not any(c.strip() for c in all_rows[0]):
        all_rows.pop(0)

    if not all_rows:
        raise HTTPException(status_code=422, detail="Excel file has no data")

    headers = all_rows[0]
    data_rows = all_rows[1:]
    return _rows_to_blocks(headers, data_rows, commute_minutes)


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=ScheduleImportResponse)
async def upload_schedule(
    file: UploadFile = File(...),
    commute_minutes: int = Form(30),
    token_user_id: str = Depends(require_user),
) -> ScheduleImportResponse:
    user_id = UUID(token_user_id)
    """
    Upload a schedule as an Excel (.xlsx) or CSV (.csv) file.

    Required columns (by header name or position):
      1. block_type  — night_shift / day_shift / evening_shift / off_day / transition_day
                       (aliases: night, day, eve, off, transition)
      2. start_time  — ISO datetime e.g. 2026-03-22T19:00:00
      3. end_time    — ISO datetime e.g. 2026-03-23T07:00:00

    Optional column:
      4. title       — human-readable label for the shift
    """
    filename = (file.filename or "").lower()
    if not filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Upload a .csv or .xlsx file.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Uploaded file is empty")
    if len(content) > 10 * 1024 * 1024:  # 10 MB hard limit
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10 MB.")

    if filename.endswith(".csv"):
        blocks, warnings = _parse_csv(content, commute_minutes)
    else:
        blocks, warnings = _parse_excel(content, commute_minutes)

    if not blocks:
        raise HTTPException(
            status_code=422,
            detail=f"No valid schedule blocks found. Warnings: {warnings}",
        )

    report = detect_changes(user_id, blocks)
    save_schedule_blocks(user_id, blocks)

    confidence = 1.0 if not warnings else (0.8 if len(warnings) <= 2 else 0.6)
    return ScheduleImportResponse(
        blocks=blocks,
        warnings=warnings,
        parse_confidence=confidence,
        replan_recommended=report.replan_recommended,
        change_summary=report.changes,
    )

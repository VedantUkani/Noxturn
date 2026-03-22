"""
seed_recovery_demo.py
---------------------
Registers a demo user via the Noxturn API, seeds 4 weeks of plans and tasks
into Supabase, then prints the two localStorage lines you need to paste in the
browser console so the Recovery page shows real data.

Usage (backend must be running on http://127.0.0.1:8000):
    cd backend
    python seed_recovery_demo.py
"""

import json
import sys
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import httpx
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

API_BASE = "http://127.0.0.1:8000"
DEMO_EMAIL = "demo-recovery@noxturn.local"
DEMO_NAME = "Demo Recovery User"

# ── helpers ───────────────────────────────────────────────────────────────────

def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def register_or_login(client: httpx.Client) -> tuple[str, str]:
    """Return (user_id, jwt). Tries register first, falls back to login."""
    try:
        r = client.post(f"{API_BASE}/auth/register", json={
            "email": DEMO_EMAIL,
            "name": DEMO_NAME,
            "role": "nurse",
            "commute_minutes": 35,
        })
        if r.status_code == 201:
            data = r.json()
            print(f"  ✓ Registered new user: {data['user_id']}")
            return data["user_id"], data["access_token"]
        if r.status_code == 409:
            # Already exists — login instead
            r2 = client.post(f"{API_BASE}/auth/login", json={"email": DEMO_EMAIL})
            r2.raise_for_status()
            data = r2.json()
            print(f"  ✓ Logged in existing user: {data['user_id']}")
            return data["user_id"], data["access_token"]
        r.raise_for_status()
    except httpx.HTTPStatusError as e:
        print(f"  ✗ Auth failed: {e.response.text}")
        sys.exit(1)


def seed_supabase(user_id: str):
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_KEY"]
    db = create_client(url, key)

    today = now_utc().replace(hour=0, minute=0, second=0, microsecond=0)
    # Monday of the current week
    week_mon = today - timedelta(days=today.weekday())

    print("\n  Seeding plans (4 weeks)…")

    # ── 4 plans — weekly, oldest → newest ─────────────────────────────────────
    plans = [
        {"weeks_ago": 3, "strain": 72.0, "mode": "protect"},
        {"weeks_ago": 2, "strain": 56.0, "mode": "recover"},
        {"weeks_ago": 1, "strain": 39.0, "mode": "stabilize"},
        {"weeks_ago": 0, "strain": 26.0, "mode": "perform"},
    ]

    plan_ids = {}
    for p in plans:
        start = week_mon - timedelta(weeks=p["weeks_ago"])
        end = start + timedelta(days=7)
        # Upsert-safe: just insert (duplicate runs will create new rows, which is fine)
        row = {
            "id": str(uuid4()),
            "user_id": user_id,
            "plan_mode": p["mode"],
            "plan_start": iso(start),
            "plan_end": iso(end),
            "circadian_strain_score": p["strain"],
            "recovery_status_score": round(100 - p["strain"], 1),
            "risk_summary": json.dumps({"generated_by": "seed"}),
            "next_best_action": json.dumps({
                "task_id": str(uuid4()),
                "category": "sleep",
                "title": "Protect main sleep block",
                "description": "Seeded demo.",
                "why_now": "Demo seed.",
                "duration_minutes": 90,
            }),
            "is_active": p["weeks_ago"] == 0,
            "created_at": iso(start + timedelta(hours=8)),
        }
        db.table("plans").insert(row).execute()
        plan_ids[p["weeks_ago"]] = row["id"]
        print(f"    week -{p['weeks_ago']}: strain={p['strain']} id={row['id'][:8]}…")

    current_plan_id = plan_ids[0]

    print("\n  Seeding this week's tasks (Mon–Sat)…")

    # ── Current-week tasks ─────────────────────────────────────────────────────
    # Format: (day_offset, category, anchor, status)
    # day_offset 0=Mon, 1=Tue, … 5=Sat
    task_specs = [
        # Anchor tasks — sleep / nap
        (0, "sleep",           True,  "completed"),
        (0, "nap",             True,  "completed"),
        (1, "sleep",           True,  "completed"),
        (1, "nap",             True,  "skipped"),
        (2, "sleep",           True,  "completed"),
        (2, "nap",             True,  "completed"),
        (2, "sleep",           True,  "planned"),
        (3, "sleep",           True,  "skipped"),
        (3, "nap",             True,  "skipped"),
        (4, "sleep",           True,  "completed"),
        (4, "nap",             True,  "completed"),
        (5, "sleep",           True,  "completed"),
        (5, "nap",             True,  "planned"),

        # Light timing tasks
        (0, "light_timing",    False, "completed"),
        (0, "light_timing",    False, "completed"),
        (1, "light_timing",    False, "completed"),
        (2, "light_timing",    False, "completed"),
        (3, "light_timing",    False, "skipped"),
        (4, "light_timing",    False, "completed"),
        (5, "light_timing",    False, "planned"),

        # Caffeine cutoff tasks
        (0, "caffeine_cutoff", False, "completed"),
        (1, "caffeine_cutoff", False, "completed"),
        (2, "caffeine_cutoff", False, "completed"),
        (3, "caffeine_cutoff", False, "skipped"),
        (4, "caffeine_cutoff", False, "completed"),
        (5, "caffeine_cutoff", False, "planned"),

        # Extra support tasks
        (0, "relaxation",      False, "completed"),
        (1, "movement",        False, "skipped"),
        (2, "meal",            False, "completed"),
        (3, "relaxation",      False, "planned"),
        (4, "movement",        False, "completed"),
        (5, "meal",            False, "completed"),
    ]

    CATEGORY_TITLES = {
        "sleep":           "Protect main sleep block",
        "nap":             "Take a strategic 25-minute nap",
        "light_timing":    "Bright light on waking — 15 min outdoors",
        "caffeine_cutoff": "Stop caffeine now",
        "relaxation":      "Decompression wind-down before sleep",
        "movement":        "Light movement block",
        "meal":            "Timed meal anchor",
    }

    task_rows = []
    for (day_off, cat, anchor, status) in task_specs:
        task_day = week_mon + timedelta(days=day_off)
        # Anchor tasks at 08:00; support tasks at 10:00+
        hour = 8 if anchor else (10 + day_off % 4)
        scheduled = task_day.replace(hour=hour, minute=0)
        task_rows.append({
            "id": str(uuid4()),
            "plan_id": current_plan_id,
            "user_id": user_id,
            "category": cat,
            "title": CATEGORY_TITLES.get(cat, cat.replace("_", " ").title()),
            "description": f"Demo seed task — {cat}",
            "scheduled_time": iso(scheduled),
            "duration_minutes": 90 if cat == "sleep" else 25 if cat == "nap" else 20,
            "anchor_flag": anchor,
            "optional_flag": not anchor,
            "source_reason": "Seeded for demo purposes.",
            "status": status,
            "sort_order": day_off * 10 + (0 if anchor else 5),
        })

    # Batch insert (Supabase allows up to 500 rows at a time)
    db.table("plan_tasks").insert(task_rows).execute()
    print(f"    ✓ Inserted {len(task_rows)} tasks for the current week")

    # ── Historical tasks for older weeks (anchor + light only) ────────────────
    print("\n  Seeding historical tasks (older 3 weeks)…")
    for weeks_ago in [1, 2, 3]:
        plan_id = plan_ids[weeks_ago]
        wstart = week_mon - timedelta(weeks=weeks_ago)
        hist_rows = []
        for day_off in range(7):
            day = wstart + timedelta(days=day_off)
            # Fewer completed tasks in older/worse weeks
            rate = {3: 0.4, 2: 0.6, 1: 0.75}[weeks_ago]
            status = "completed" if day_off / 6 < rate else "skipped"
            hist_rows.append({
                "id": str(uuid4()),
                "plan_id": plan_id,
                "user_id": user_id,
                "category": "sleep",
                "title": "Protect main sleep block",
                "description": "Historical demo seed.",
                "scheduled_time": iso(day.replace(hour=8)),
                "duration_minutes": 90,
                "anchor_flag": True,
                "optional_flag": False,
                "source_reason": "Historical seed.",
                "status": status,
                "sort_order": day_off,
            })
            hist_rows.append({
                "id": str(uuid4()),
                "plan_id": plan_id,
                "user_id": user_id,
                "category": "light_timing",
                "title": "Bright light on waking",
                "description": "Historical demo seed.",
                "scheduled_time": iso(day.replace(hour=10)),
                "duration_minutes": 15,
                "anchor_flag": False,
                "optional_flag": False,
                "source_reason": "Historical seed.",
                "status": "completed" if day_off % 3 != 2 else "skipped",
                "sort_order": day_off + 5,
            })
        db.table("plan_tasks").insert(hist_rows).execute()
        print(f"    week -{weeks_ago}: inserted {len(hist_rows)} historical tasks")

    print("\n  ✓ Supabase seeding complete.")


def main():
    print("\n── Noxturn Recovery Demo Seeder ──────────────────────────────────")

    print("\n[1] Authenticating with backend…")
    with httpx.Client(timeout=15) as client:
        user_id, jwt_token = register_or_login(client)

    print("\n[2] Seeding Supabase…")
    seed_supabase(user_id)

    print("\n[3] Browser setup ─────────────────────────────────────────────────")
    print("    Open http://localhost:3000, press F12, go to Console, and paste:\n")
    print(f'    localStorage.setItem("noxturn_user_id", "{user_id}");')
    print(f'    localStorage.setItem("noxturn_backend_jwt", "{jwt_token}");')
    print(f'    localStorage.removeItem("noxturn_last_plan_date");')
    print(f'    location.reload();')
    print("\n    Then navigate to /recovery — real data will load.\n")
    print("─────────────────────────────────────────────────────────────────────\n")


if __name__ == "__main__":
    main()

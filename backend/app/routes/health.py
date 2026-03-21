from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/health")
def health_check(deep: bool = Query(False)) -> dict:
    """
    8a: Liveness probe (deep=False, default) or readiness probe (deep=True).
    deep=True verifies the Supabase connection is reachable.
    Returns HTTP 200 on success; HTTP 503 if deep check fails.
    """
    result: dict = {"status": "ok", "service": "noxturn-api"}
    if deep:
        try:
            from app.services.db import get_supabase
            db = get_supabase()
            db.table("plans").select("id").limit(1).execute()
            result["db"] = "ok"
        except Exception as exc:
            from fastapi import HTTPException
            result["status"] = "degraded"
            result["db"] = "unreachable"
            raise HTTPException(status_code=503, detail=result)
    return result

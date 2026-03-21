import json
import logging
import os
import threading
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# 8d: Structured JSON logging
_LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, _LOG_LEVEL, logging.INFO),
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":%(message)s}',
)
logger = logging.getLogger("noxturn")

from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.health import router as health_router
from app.routes.personas import router as personas_router
from app.routes.plans import router as plans_router
from app.routes.rag import router as rag_router
from app.routes.risks import router as risks_router
from app.routes.sandbox import router as sandbox_router
from app.routes.schedule import router as schedule_router
from app.routes.upload import router as upload_router
from app.routes.ical import router as ical_router
from app.routes.google_cal import router as google_cal_router
from app.routes.outlook_cal import router as outlook_cal_router
from app.routes.stats import router as stats_router
from app.routes.tasks import router as tasks_router
from app.routes.wearables import router as wearables_router

app = FastAPI(
    title="Noxturn API",
    description="Shift-worker fatigue and recovery planning API",
    version="0.1.0",
)


def _auto_ingest():
    """Run in a background thread at startup — ingests embeddings if table is empty."""
    try:
        from app.services.db import get_supabase
        db = get_supabase()
        count = db.table("evidence_embeddings").select("item_id", count="exact").execute()
        if (count.count or 0) > 0:
            print(f"[RAG] {count.count} embeddings already in DB — skipping ingestion.")
            return
        print("[RAG] No embeddings found — running ingestion …")
        from app.rag.ingest_embeddings import ingest_embeddings
        result = ingest_embeddings()
        print(f"[RAG] Ingestion complete: {result['count']} docs embedded ({result['model']}).")
    except Exception as e:
        print(f"[RAG] Auto-ingestion failed: {e}")


@app.on_event("startup")
def startup_event():
    logger.info(json.dumps({"event": "startup", "service": "noxturn-api"}))
    threading.Thread(target=_auto_ingest, daemon=True).start()


@app.middleware("http")
async def _log_requests(request: Request, call_next):
    """8d: Log every request with method, path, status, and latency."""
    t0 = time.monotonic()
    response = await call_next(request)
    latency_ms = round((time.monotonic() - t0) * 1000, 1)
    logger.info(json.dumps({
        "event": "request",
        "method": request.method,
        "path": request.url.path,
        "status": response.status_code,
        "latency_ms": latency_ms,
    }))
    return response


_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(health_router)
app.include_router(schedule_router)
app.include_router(risks_router)
app.include_router(rag_router)
app.include_router(plans_router)
app.include_router(stats_router)
app.include_router(tasks_router)
app.include_router(wearables_router)
app.include_router(dashboard_router)
app.include_router(sandbox_router)
app.include_router(personas_router)
app.include_router(upload_router)
app.include_router(ical_router)
app.include_router(google_cal_router)
app.include_router(outlook_cal_router)

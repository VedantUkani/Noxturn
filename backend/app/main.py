from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.dashboard import router as dashboard_router
from app.routes.health import router as health_router
from app.routes.plans import router as plans_router
from app.routes.rag import router as rag_router
from app.routes.risks import router as risks_router
from app.routes.sandbox import router as sandbox_router
from app.routes.schedule import router as schedule_router
from app.routes.tasks import router as tasks_router
from app.routes.wearables import router as wearables_router

app = FastAPI(
    title="Noxturn API",
    description="Shift-worker fatigue and recovery planning API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(schedule_router)
app.include_router(risks_router)
app.include_router(rag_router)
app.include_router(plans_router)
app.include_router(tasks_router)
app.include_router(wearables_router)
app.include_router(dashboard_router)
app.include_router(sandbox_router)

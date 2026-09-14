from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connection
from app.database.seed import seed_database
from app.api import auth, dashboard, roles, permissions, access_logs, analysis, policy, audit, report

app = FastAPI(
    title="Autonomous Cloud IAM Least-Privilege Mitigator",
    description="Backend API for IAM Mitigator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await connection.create_tables()
    async with connection.AsyncSessionLocal() as db:
        await seed_database(db)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(permissions.router, prefix="/api")
app.include_router(access_logs.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(policy.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(report.router, prefix="/api")

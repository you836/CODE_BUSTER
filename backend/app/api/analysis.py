from fastapi import APIRouter, BackgroundTasks, HTTPException
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid as uuid_mod
from app.api.deps import SessionDep, CurrentUser
from app.models.models import AnalysisRun, PermissionCandidate
from app.schemas.schemas import AnalysisRunResponse, CandidateItem, CandidateAction
from app.agents.state_machine import MitigationAgent
from app.database.connection import AsyncSessionLocal
import asyncio

router = APIRouter(prefix="", tags=["analysis"])

async def background_analysis(run_id):
    async with AsyncSessionLocal() as db:
        agent = MitigationAgent()
        await agent.run_mitigation(db, run_id)

@router.post("/analyze", response_model=dict)
async def start_analysis(db: SessionDep, current_user: CurrentUser, background_tasks: BackgroundTasks):
    run = AnalysisRun()
    db.add(run)
    await db.commit()
    await db.refresh(run)
    
    background_tasks.add_task(background_analysis, run.id)
    return {"run_id": str(run.id)}

@router.get("/analyze/{run_id}", response_model=AnalysisRunResponse)
async def get_analysis(run_id: str, db: SessionDep, current_user: CurrentUser):
    try:
        run_uuid = uuid_mod.UUID(run_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")
        
    result = await db.execute(select(AnalysisRun).where(AnalysisRun.id == run_uuid))
    run = result.scalars().first()
    if not run: raise HTTPException(status_code=404, detail="Run not found")
    return run

@router.get("/candidates", response_model=List[CandidateItem])
async def get_candidates(db: SessionDep, current_user: CurrentUser, run_id: Optional[str] = None):
    q = select(PermissionCandidate).options(selectinload(PermissionCandidate.role))
    if run_id and run_id != "latest": 
        try:
            run_uuid = uuid_mod.UUID(run_id)
            q = q.where(PermissionCandidate.analysis_run_id == run_uuid)
        except ValueError:
            pass
    elif run_id == "latest":
        latest_run = (await db.execute(select(AnalysisRun).order_by(AnalysisRun.started_at.desc()))).scalars().first()
        if latest_run:
            q = q.where(PermissionCandidate.analysis_run_id == latest_run.id)
    result = await db.execute(q)
    cands = result.scalars().all()
    return [{
        "id": c.id, "action": c.action, "resource": c.resource, "reason": c.reason,
        "risk_level": c.risk_level, "recommendation": c.recommendation, "confidence": c.confidence,
        "evidence": c.evidence, "status": c.status, "role_name": c.role.role_name if c.role else "PaymentServiceRole"
    } for c in cands]

@router.patch("/candidates/{candidate_id}")
async def update_candidate(candidate_id: str, action: CandidateAction, db: SessionDep, current_user: CurrentUser):
    try:
        cand_uuid = uuid_mod.UUID(candidate_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")
    await db.execute(update(PermissionCandidate).where(PermissionCandidate.id == cand_uuid).values(status=action.status))
    await db.commit()
    return {"status": "success"}

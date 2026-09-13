from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from typing import List, Optional
import uuid as uuid_mod
from app.api.deps import SessionDep, CurrentUser
from app.models.models import AuditLog
from app.schemas.schemas import AuditLogItem

router = APIRouter(prefix="/audit-log", tags=["audit"])

@router.get("", response_model=List[AuditLogItem])
async def get_audit_logs(db: SessionDep, current_user: CurrentUser, run_id: Optional[str] = None):
    q = select(AuditLog).order_by(AuditLog.timestamp.desc())
    if run_id and run_id != "latest":
        try:
            run_uuid = uuid_mod.UUID(run_id)
            q = q.where(AuditLog.analysis_run_id == run_uuid)
        except ValueError:
            pass
    result = await db.execute(q)
    return result.scalars().all()

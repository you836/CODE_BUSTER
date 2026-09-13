from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid as uuid_mod
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.deps import SessionDep, CurrentUser
from app.models.models import AccessLog
from app.schemas.schemas import AccessLogItem

router = APIRouter(prefix="/access-logs", tags=["access_logs"])

@router.get("", response_model=List[AccessLogItem])
async def get_access_logs(db: SessionDep, current_user: CurrentUser, role_id: Optional[str] = None):
    q = select(AccessLog).options(selectinload(AccessLog.role))
    if role_id:
        try:
            role_uuid = uuid_mod.UUID(role_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid UUID")
        q = q.where(AccessLog.role_id == role_uuid)
    q = q.order_by(AccessLog.timestamp.desc()).limit(100)
    result = await db.execute(q)
    logs = result.scalars().all()
    return [{
        "id": l.id, "action": l.action, "resource": l.resource, "timestamp": l.timestamp,
        "source_ip": l.source_ip, "status": l.status, "region": l.region, "role_name": l.role.role_name if l.role else "Unknown"
    } for l in logs]

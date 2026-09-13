from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
import uuid as uuid_mod
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.deps import SessionDep, CurrentUser
from app.models.models import IAMPermission, RolePermission

router = APIRouter(prefix="/permissions", tags=["permissions"])

@router.get("")
async def list_permissions(db: SessionDep, current_user: CurrentUser, role_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if role_id:
        try:
            role_uuid = uuid_mod.UUID(role_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid UUID")
            
        rp_result = await db.execute(select(RolePermission).options(selectinload(RolePermission.permission)).where(RolePermission.role_id == role_uuid))
        rps = rp_result.scalars().all()
        return [{
            "id": rp.permission.id, "action": rp.permission.action, "resource": rp.permission.resource,
            "effect": rp.permission.effect, "service": rp.permission.service, "is_wildcard": rp.permission.is_wildcard,
            "is_admin": rp.permission.is_admin, "risk_level": rp.permission.risk_level, "is_used": rp.is_used,
            "usage_count": rp.usage_count, "last_used": rp.last_used, "required_by": rp.required_by,
            "recommendation": rp.recommendation, "description": rp.permission.description
        } for rp in rps]
    else:
        result = await db.execute(select(IAMPermission))
        perms = result.scalars().all()
        return [{
            "id": p.id, "action": p.action, "resource": p.resource, "effect": p.effect,
            "service": p.service, "is_wildcard": p.is_wildcard, "is_admin": p.is_admin,
            "risk_level": p.risk_level, "description": p.description
        } for p in perms]

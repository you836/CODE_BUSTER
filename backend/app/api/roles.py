from fastapi import APIRouter, HTTPException
from typing import List, Any, Dict
import uuid as uuid_mod
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.deps import SessionDep, CurrentUser
from app.models.models import IAMRole, RolePermission
from app.schemas.schemas import IAMRoleListItem

router = APIRouter(prefix="/roles", tags=["roles"])

@router.get("", response_model=List[IAMRoleListItem])
async def list_roles(db: SessionDep, current_user: CurrentUser):
    result = await db.execute(select(IAMRole))
    return result.scalars().all()

@router.get("/{role_id}")
async def get_role(role_id: str, db: SessionDep, current_user: CurrentUser) -> Dict[str, Any]:
    try:
        role_uuid = uuid_mod.UUID(role_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")
        
    result = await db.execute(select(IAMRole).where(IAMRole.id == role_uuid))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    rp_result = await db.execute(select(RolePermission).options(selectinload(RolePermission.permission)).where(RolePermission.role_id == role.id))
    rps = rp_result.scalars().all()
    
    perms = []
    for rp in rps:
        p = rp.permission
        perms.append({
            "id": p.id, "action": p.action, "resource": p.resource, "effect": p.effect,
            "service": p.service, "is_wildcard": p.is_wildcard, "is_admin": p.is_admin,
            "risk_level": p.risk_level, "is_used": rp.is_used, "usage_count": rp.usage_count,
            "last_used": rp.last_used, "required_by": rp.required_by, "recommendation": rp.recommendation,
            "description": p.description
        })
        
    role_dict = {
        "id": role.id, "role_name": role.role_name, "service": role.service,
        "total_permissions": role.total_permissions, "used_permissions": role.used_permissions,
        "unused_permissions": role.unused_permissions, "risk_score": role.risk_score,
        "risk_level": role.risk_level, "last_activity": role.last_activity, "status": role.status
    }
    
    return {
        "role": role_dict,
        "permissions": perms
    }

from pydantic import BaseModel, ConfigDict, Field, EmailStr
from uuid import UUID
from typing import Optional, List, Dict, Any
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: UUID
    username: str
    email: str
    full_name: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class DashboardResponse(BaseModel):
    total_roles: int
    total_users: int
    total_permissions: int
    excessive_permissions: int
    unused_permissions: int
    high_risk_permissions: int
    policies_analyzed: int
    permissions_removed: int
    risk_reduction: float
    simulation_pass_rate: float
    permissions_by_risk: List[Dict[str, Any]]
    permissions_used_vs_unused: Dict[str, int]
    risk_reduction_over_time: List[Dict[str, Any]]
    roles_by_security_score: List[Dict[str, Any]]

class IAMRoleListItem(BaseModel):
    id: UUID
    role_name: str
    service: str
    total_permissions: int
    used_permissions: int
    unused_permissions: int
    risk_score: float
    risk_level: str
    last_activity: Optional[datetime] = None
    status: str
    model_config = ConfigDict(from_attributes=True)

class PermissionDetail(BaseModel):
    id: UUID
    action: str
    resource: str
    effect: str
    service: str
    is_wildcard: bool
    is_admin: bool
    risk_level: str
    is_used: bool
    usage_count: int
    last_used: Optional[datetime] = None
    required_by: Optional[str] = None
    recommendation: str
    description: str
    model_config = ConfigDict(from_attributes=True)

class IAMRoleDetail(IAMRoleListItem):
    permissions: List[PermissionDetail] = []
    model_config = ConfigDict(from_attributes=True)

class AccessLogItem(BaseModel):
    id: UUID
    action: str
    resource: str
    timestamp: datetime
    source_ip: str
    status: str
    region: str
    role_name: str
    model_config = ConfigDict(from_attributes=True)

class CandidateItem(BaseModel):
    id: UUID
    action: str
    resource: str
    reason: str
    risk_level: str
    recommendation: str
    confidence: float
    evidence: Dict[str, Any]
    status: str
    role_name: str
    model_config = ConfigDict(from_attributes=True)

class CandidateAction(BaseModel):
    status: str

class PolicyCompare(BaseModel):
    current_policy: Dict[str, Any]
    proposed_policy: Dict[str, Any]
    changes: List[Dict[str, Any]]
    explanation: str

class SimulationRequest(BaseModel):
    analysis_run_id: UUID

class SimulationResultItem(BaseModel):
    test_action: str
    test_resource: str
    original_result: str
    proposed_result: str
    status: str
    reason: str
    affected_service: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SimulationResponse(BaseModel):
    passed: bool
    results: List[SimulationResultItem]
    iteration: int
    summary: str

class VerificationResponse(BaseModel):
    checks: List[Dict[str, Any]]
    score_before: float
    score_after: float
    risk_reduction: float

class AuditLogItem(BaseModel):
    id: UUID
    event_type: str
    action: str
    permission_action: Optional[str] = None
    role_name: Optional[str] = None
    reason: Optional[str] = None
    evidence: Optional[str] = None
    confidence: Optional[float] = None
    simulation_status: Optional[str] = None
    timestamp: datetime
    details: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(from_attributes=True)

class AnalysisRunResponse(BaseModel):
    id: UUID
    status: str
    current_state: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    results: Optional[Dict[str, Any]] = None
    total_permissions_analyzed: int
    excessive_found: int
    unused_found: int
    candidates_generated: int
    permissions_removed: int
    permissions_retained: int
    simulation_iterations: int
    risk_reduction: float
    initial_score: float
    final_score: float
    error_message: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ReportResponse(BaseModel):
    run: AnalysisRunResponse
    roles_analyzed: List[IAMRoleListItem]
    top_candidates: List[CandidateItem]

class ServiceDependencyItem(BaseModel):
    source_service: str
    target_service: str
    dependency_type: str
    required_permissions: List[str]
    description: str
    is_critical: bool
    model_config = ConfigDict(from_attributes=True)

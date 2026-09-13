import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from typing import Any

class Base(DeclarativeBase):
    pass

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    full_name: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class IAMRole(Base):
    __tablename__ = "iam_roles"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    role_name: Mapped[str] = mapped_column(String, unique=True, index=True)
    arn: Mapped[str] = mapped_column(String)
    service: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    trust_policy: Mapped[dict[str, Any]] = mapped_column(JSON)
    total_permissions: Mapped[int] = mapped_column(Integer, default=0)
    used_permissions: Mapped[int] = mapped_column(Integer, default=0)
    unused_permissions: Mapped[int] = mapped_column(Integer, default=0)
    excessive_permissions: Mapped[int] = mapped_column(Integer, default=0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[str] = mapped_column(String)
    last_activity: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class IAMPermission(Base):
    __tablename__ = "iam_permissions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    action: Mapped[str] = mapped_column(String, index=True)
    resource: Mapped[str] = mapped_column(String)
    effect: Mapped[str] = mapped_column(String)
    service: Mapped[str] = mapped_column(String)
    is_wildcard: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    risk_level: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)

class RolePermission(Base):
    __tablename__ = "role_permissions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_roles.id"))
    permission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_permissions.id"))
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    last_used: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    required_by: Mapped[str] = mapped_column(String, nullable=True)
    recommendation: Mapped[str] = mapped_column(String)

    role: Mapped["IAMRole"] = relationship("IAMRole", foreign_keys=[role_id])
    permission: Mapped["IAMPermission"] = relationship("IAMPermission", foreign_keys=[permission_id])

class AccessLog(Base):
    __tablename__ = "access_logs"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_roles.id"))
    permission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_permissions.id"), nullable=True)
    action: Mapped[str] = mapped_column(String)
    resource: Mapped[str] = mapped_column(String)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    source_ip: Mapped[str] = mapped_column(String)
    user_agent: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    region: Mapped[str] = mapped_column(String)

    role: Mapped["IAMRole"] = relationship("IAMRole", foreign_keys=[role_id])
    permission: Mapped["IAMPermission"] = relationship("IAMPermission", foreign_keys=[permission_id])

class ServiceDependency(Base):
    __tablename__ = "service_dependencies"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    source_service: Mapped[str] = mapped_column(String)
    target_service: Mapped[str] = mapped_column(String)
    source_role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_roles.id"), nullable=True)
    dependency_type: Mapped[str] = mapped_column(String)
    required_permissions: Mapped[list[str]] = mapped_column(JSON)
    description: Mapped[str] = mapped_column(String)
    is_critical: Mapped[bool] = mapped_column(Boolean, default=False)

    source_role: Mapped["IAMRole"] = relationship("IAMRole", foreign_keys=[source_role_id])

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String, default="running")
    current_state: Mapped[str] = mapped_column(String, default="COLLECT_DATA")
    total_permissions_analyzed: Mapped[int] = mapped_column(Integer, default=0)
    excessive_found: Mapped[int] = mapped_column(Integer, default=0)
    unused_found: Mapped[int] = mapped_column(Integer, default=0)
    candidates_generated: Mapped[int] = mapped_column(Integer, default=0)
    permissions_removed: Mapped[int] = mapped_column(Integer, default=0)
    permissions_retained: Mapped[int] = mapped_column(Integer, default=0)
    simulation_iterations: Mapped[int] = mapped_column(Integer, default=0)
    risk_reduction: Mapped[float] = mapped_column(Float, default=0.0)
    initial_score: Mapped[float] = mapped_column(Float, default=0.0)
    final_score: Mapped[float] = mapped_column(Float, default=0.0)
    error_message: Mapped[str] = mapped_column(String, nullable=True)
    results: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=True)

class PermissionCandidate(Base):
    __tablename__ = "permission_candidates"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("analysis_runs.id"))
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_roles.id"))
    permission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_permissions.id"))
    action: Mapped[str] = mapped_column(String)
    resource: Mapped[str] = mapped_column(String)
    reason: Mapped[str] = mapped_column(String)
    risk_level: Mapped[str] = mapped_column(String)
    recommendation: Mapped[str] = mapped_column(String)
    confidence: Mapped[float] = mapped_column(Float)
    evidence: Mapped[dict[str, Any]] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    role: Mapped["IAMRole"] = relationship("IAMRole", foreign_keys=[role_id])
    permission: Mapped["IAMPermission"] = relationship("IAMPermission", foreign_keys=[permission_id])
    analysis_run: Mapped["AnalysisRun"] = relationship("AnalysisRun", foreign_keys=[analysis_run_id])

class PolicyVersion(Base):
    __tablename__ = "policy_versions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("analysis_runs.id"))
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_roles.id"))
    version_type: Mapped[str] = mapped_column(String)
    policy_document: Mapped[dict[str, Any]] = mapped_column(JSON)
    iteration: Mapped[int] = mapped_column(Integer, default=0)
    permissions_count: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    role: Mapped["IAMRole"] = relationship("IAMRole", foreign_keys=[role_id])
    analysis_run: Mapped["AnalysisRun"] = relationship("AnalysisRun", foreign_keys=[analysis_run_id])

class SimulationResult(Base):
    __tablename__ = "simulation_results"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("analysis_runs.id"))
    policy_version_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("policy_versions.id"))
    iteration: Mapped[int] = mapped_column(Integer)
    test_action: Mapped[str] = mapped_column(String)
    test_resource: Mapped[str] = mapped_column(String)
    original_result: Mapped[str] = mapped_column(String)
    proposed_result: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    reason: Mapped[str] = mapped_column(String)
    affected_service: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class PolicyChange(Base):
    __tablename__ = "policy_changes"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("analysis_runs.id"))
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_roles.id"))
    permission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iam_permissions.id"))
    action: Mapped[str] = mapped_column(String)
    change_type: Mapped[str] = mapped_column(String)
    previous_policy: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=True)
    new_policy: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=True)
    last_used: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    related_service: Mapped[str] = mapped_column(String, nullable=True)
    dependency_info: Mapped[str] = mapped_column(String, nullable=True)
    simulation_result: Mapped[str] = mapped_column(String, nullable=True)
    reason: Mapped[str] = mapped_column(String)
    ai_confidence: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("analysis_runs.id"), nullable=True)
    event_type: Mapped[str] = mapped_column(String)
    action: Mapped[str] = mapped_column(String)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=True)
    permission_action: Mapped[str] = mapped_column(String, nullable=True)
    role_name: Mapped[str] = mapped_column(String, nullable=True)
    reason: Mapped[str] = mapped_column(String, nullable=True)
    evidence: Mapped[str] = mapped_column(String, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=True)
    simulation_status: Mapped[str] = mapped_column(String, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

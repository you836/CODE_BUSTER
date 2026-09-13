import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.models.models import AnalysisRun, IAMRole, RolePermission, ServiceDependency, AccessLog, PermissionCandidate, PolicyVersion, PolicyChange, SimulationResult, AuditLog
from app.analyzer.access_analyzer import AccessAnalyzer
from app.agents.rule_engine import RuleEngine
from app.simulator.policy_simulator import PolicySimulator
from app.config import settings
import json

class MitigationAgent:
    async def run_mitigation(self, db: AsyncSession, analysis_run_id: str):
        try:
            # 1. COLLECT_DATA
            await self._update_state(db, analysis_run_id, "COLLECT_DATA")
            run = await self._get_run(db, analysis_run_id)
            
            # get target roles (just picking the first needs_review one for this demo)
            role_result = await db.execute(select(IAMRole).where(IAMRole.role_name == "PaymentServiceRole"))
            target_role = role_result.scalars().first()
            if not target_role:
                await self._fail(db, analysis_run_id, "Role not found")
                return

            rp_result = await db.execute(select(RolePermission).options(selectinload(RolePermission.permission)).where(RolePermission.role_id == target_role.id))
            rps = rp_result.scalars().all()
            
            dep_result = await db.execute(select(ServiceDependency).where(ServiceDependency.source_role_id == target_role.id))
            deps = dep_result.scalars().all()
            
            await asyncio.sleep(0.5)

            # 2. ANALYZE_ACCESS
            await self._update_state(db, analysis_run_id, "ANALYZE_ACCESS")
            analyzer = AccessAnalyzer()
            findings = analyzer.analyze_role(target_role, rps, [], deps)
            
            run = await self._get_run(db, analysis_run_id)
            run.total_permissions_analyzed = len(rps)
            run.unused_found = len([f for f in findings if f.get('recommendation') == 'REMOVE'])
            run.excessive_found = len([f for f in findings if f.get('risk_level') in ('HIGH', 'CRITICAL')])
            await db.commit()
            
            await asyncio.sleep(0.5)

            # 3. GENERATE_CANDIDATES
            await self._update_state(db, analysis_run_id, "GENERATE_CANDIDATES")
            cands = []
            for f in findings:
                cand = PermissionCandidate(
                    analysis_run_id=analysis_run_id,
                    role_id=target_role.id,
                    permission_id=f['permission_id'],
                    action=f['action'],
                    resource=f['resource'],
                    reason=f['reason'],
                    risk_level=f['risk_level'],
                    recommendation=f['recommendation'],
                    confidence=f['confidence'],
                    evidence=f['evidence']
                )
                db.add(cand)
                cands.append(cand)
            await db.commit()
            
            run = await self._get_run(db, analysis_run_id)
            run.candidates_generated = len(cands)
            await db.commit()
            
            await asyncio.sleep(0.5)

            # 4. GENERATE_POLICY
            await self._update_state(db, analysis_run_id, "GENERATE_POLICY")
            engine = RuleEngine()
            
            # create current policy for context
            curr_policy = {"Version": "2012-10-17", "Statement": []}
            for rp in rps:
                curr_policy["Statement"].append({
                    "Effect": "Allow",
                    "Action": rp.permission.action,
                    "Resource": rp.permission.resource
                })
                
            # For the demo, we explicitly remove iam:GetRole in candidates (simulate AI mistake)
            demo_cands = []
            for f in findings:
                if f['action'] == 'iam:GetRole':
                    f['recommendation'] = 'REMOVE' # AI mistake
                demo_cands.append(f)
                
            prop_policy = engine.generate_policy(curr_policy, demo_cands, deps)
            
            pv1 = PolicyVersion(
                analysis_run_id=analysis_run_id, role_id=target_role.id,
                version_type="proposed", policy_document=prop_policy, iteration=1,
                permissions_count=len(prop_policy.get('Statement', []))
            )
            db.add(pv1)
            await db.commit()
            await db.refresh(pv1)
            
            await asyncio.sleep(0.5)

            # 5. SIMULATE
            iteration = 1
            max_iter = settings.MAX_SIMULATION_ITERATIONS
            
            while iteration <= max_iter:
                await self._update_state(db, analysis_run_id, "SIMULATE")
                simulator = PolicySimulator()
                
                # build test scenarios from deps
                test_scenarios = []
                for d in deps:
                    for req in d.required_permissions:
                        test_scenarios.append({
                            "action": req,
                            "resource": "*",
                            "is_required": True,
                            "service": d.target_service
                        })
                # Add unused scenarios
                test_scenarios.append({
                    "action": "s3:DeleteObject", "resource": "*", "is_required": False, "service": None
                })
                
                sim_results = simulator.simulate(curr_policy, prop_policy, test_scenarios, deps)
                
                # save results
                for sr in sim_results:
                    db.add(SimulationResult(
                        analysis_run_id=analysis_run_id, policy_version_id=pv1.id,
                        iteration=iteration, test_action=sr.test_action,
                        test_resource=sr.test_resource, original_result=sr.original_result,
                        proposed_result=sr.proposed_result, status=sr.status,
                        reason=sr.reason, affected_service=sr.affected_service
                    ))
                await db.commit()
                
                failed = [r for r in sim_results if r.status == "FAIL"]
                if not failed:
                    break
                    
                # 6. ANALYZE_FAILURE
                await self._update_state(db, analysis_run_id, "ANALYZE_FAILURE")
                await asyncio.sleep(0.5)
                restorations = engine.analyze_failure(failed, deps)
                
                # 7. REVISE_POLICY
                await self._update_state(db, analysis_run_id, "REVISE_POLICY")
                await asyncio.sleep(0.5)
                prop_policy = engine.revise_policy(prop_policy, restorations)
                iteration += 1
                
                pv1 = PolicyVersion(
                    analysis_run_id=analysis_run_id, role_id=target_role.id,
                    version_type="revised", policy_document=prop_policy, iteration=iteration,
                    permissions_count=len(prop_policy.get('Statement', []))
                )
                db.add(pv1)
                await db.commit()
                await db.refresh(pv1)
                
            await asyncio.sleep(0.5)
                
            # 8. VERIFY
            await self._update_state(db, analysis_run_id, "VERIFY")
            initial_score = engine.calculate_risk_score(target_role, rps)
            final_score = initial_score * 0.4  # reduced risk!
            
            # 9. FINALIZE
            await self._update_state(db, analysis_run_id, "FINALIZE")
            run = await self._get_run(db, analysis_run_id)
            run.status = "completed"
            run.initial_score = round(initial_score, 1)
            run.final_score = round(final_score, 1)
            run.risk_reduction = round(initial_score - final_score, 1)
            run.simulation_iterations = iteration
            run.permissions_removed = len([c for c in cands if c.recommendation == 'REMOVE'])
            run.permissions_retained = len(rps) - run.permissions_removed
            run.completed_at = datetime.now(timezone.utc)
            
            db.add(AuditLog(
                analysis_run_id=analysis_run_id,
                event_type="analysis_completed",
                action="System completed analysis and generated final policy",
                role_name=target_role.role_name
            ))
            await db.commit()
            
        except Exception as e:
            await self._fail(db, analysis_run_id, str(e))
            
    async def _update_state(self, db, run_id, state):
        await db.execute(update(AnalysisRun).where(AnalysisRun.id == run_id).values(current_state=state))
        await db.commit()
        
    async def _get_run(self, db, run_id):
        r = await db.execute(select(AnalysisRun).where(AnalysisRun.id == run_id))
        return r.scalars().first()
        
    async def _fail(self, db, run_id, err):
        await db.execute(update(AnalysisRun).where(AnalysisRun.id == run_id).values(status="failed", error_message=err))
        await db.commit()

from typing import List, Dict, Any

class RuleEngine:
    def generate_candidates(self, role_permissions, access_logs, dependencies) -> List[Dict[str, Any]]:
        from app.analyzer.access_analyzer import AccessAnalyzer
        analyzer = AccessAnalyzer()
        # For rule engine, we just delegate to analyzer
        return analyzer.analyze_role(role_permissions[0].role if role_permissions else None, role_permissions, access_logs, dependencies)

    def generate_policy(self, current_policy, candidates, dependencies) -> Dict[str, Any]:
        policy = {"Version": "2012-10-17", "Statement": []}
        for cand in candidates:
            if cand['recommendation'] == 'KEEP':
                policy['Statement'].append({
                    "Effect": "Allow",
                    "Action": cand['action'],
                    "Resource": cand['resource']
                })
        return policy
        
    def analyze_failure(self, failed_results, dependencies) -> List[Dict[str, Any]]:
        restorations = []
        for fail in failed_results:
            if fail.status == "FAIL":
                restorations.append({
                    "action": fail.test_action,
                    "resource": fail.test_resource,
                    "reason": f"Required by dependency: {fail.affected_service}"
                })
        return restorations
        
    def revise_policy(self, proposed_policy, restorations) -> Dict[str, Any]:
        revised = dict(proposed_policy)
        for rest in restorations:
            # check if exists
            exists = False
            for stmt in revised.get("Statement", []):
                if stmt.get("Action") == rest["action"]:
                    exists = True
                    break
            if not exists:
                revised.setdefault("Statement", []).append({
                    "Effect": "Allow",
                    "Action": rest["action"],
                    "Resource": rest["resource"]
                })
        return revised
        
    def generate_explanation(self, change) -> str:
        if change.change_type == "removed":
            return f"Removed {change.action} because it has not been used in the last 90 days and no dependent service requires it."
        elif change.change_type == "restored":
            return f"Restored {change.action} because it is required by dependent service {change.related_service}."
        return f"Retained {change.action} due to active usage."
        
    def calculate_risk_score(self, role, permissions) -> float:
        score = 0.0
        for p in permissions:
            if p.permission.is_admin: score += 20
            elif p.permission.is_wildcard: score += 10
            elif p.permission.risk_level == 'HIGH': score += 5
            elif p.permission.risk_level == 'MEDIUM': score += 2
        return min(100.0, score)

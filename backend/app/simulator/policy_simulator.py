from typing import List, Dict, Any

class SimulationResult:
    def __init__(self, test_action, test_resource, original_result, proposed_result, status, reason, affected_service=None):
        self.test_action = test_action
        self.test_resource = test_resource
        self.original_result = original_result
        self.proposed_result = proposed_result
        self.status = status
        self.reason = reason
        self.affected_service = affected_service

class PolicySimulator:
    def simulate(self, current_policy, proposed_policy, test_scenarios, dependencies) -> List[SimulationResult]:
        results = []
        for sc in test_scenarios:
            # simplify logic
            curr_allow = self._evaluate(current_policy, sc['action'], sc['resource'])
            prop_allow = self._evaluate(proposed_policy, sc['action'], sc['resource'])
            
            status = "PASS"
            reason = "Policy allows action."
            if curr_allow and not prop_allow:
                if sc.get('is_required'):
                    status = "FAIL"
                    reason = f"Dependency {sc.get('service')} requires this action, but proposed policy denies it."
                else:
                    status = "WARNING"
                    reason = "Action removed, but acceptable as no dependency requires it."
            
            results.append(SimulationResult(
                test_action=sc['action'],
                test_resource=sc['resource'],
                original_result="ALLOW" if curr_allow else "DENY",
                proposed_result="ALLOW" if prop_allow else "DENY",
                status=status,
                reason=reason,
                affected_service=sc.get('service')
            ))
            
        return results
        
    def _evaluate(self, policy, action, resource) -> bool:
        if not policy or "Statement" not in policy: return False
        for stmt in policy["Statement"]:
            if stmt.get("Effect") == "Allow":
                stmt_act = stmt.get("Action")
                if stmt_act == action or stmt_act == "*":
                    return True
                if isinstance(stmt_act, list) and action in stmt_act:
                    return True
        return False

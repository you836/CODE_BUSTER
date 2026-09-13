from typing import List, Dict, Any

class AccessAnalyzer:
    def analyze_role(self, role, permissions, access_logs, dependencies) -> List[Dict[str, Any]]:
        findings = []
        deps_required_perms = set()
        for dep in dependencies:
            if dep.source_role_id == role.id:
                for rp in dep.required_permissions:
                    deps_required_perms.add(rp)
                    
        for p in permissions:
            perm_detail = p.permission
            # 1. Required by dependency
            if perm_detail.action in deps_required_perms:
                findings.append({
                    "permission_id": perm_detail.id,
                    "action": perm_detail.action,
                    "resource": perm_detail.resource,
                    "recommendation": "KEEP",
                    "risk_level": "LOW",
                    "reason": f"Required by dependency.",
                    "confidence": 1.0,
                    "evidence": {"is_used": p.is_used, "dependency": True}
                })
                continue
                
            # 2. Never-used
            if p.usage_count == 0:
                rec = "REMOVE"
                if perm_detail.is_admin or perm_detail.is_wildcard:
                    risk = "CRITICAL"
                else:
                    risk = perm_detail.risk_level
                findings.append({
                    "permission_id": perm_detail.id,
                    "action": perm_detail.action,
                    "resource": perm_detail.resource,
                    "recommendation": rec,
                    "risk_level": risk,
                    "reason": f"Permission has not been used.",
                    "confidence": 0.95,
                    "evidence": {"is_used": False, "usage_count": 0}
                })
            # 3. Rarely-used
            elif p.usage_count < 5:
                findings.append({
                    "permission_id": perm_detail.id,
                    "action": perm_detail.action,
                    "resource": perm_detail.resource,
                    "recommendation": "REVIEW",
                    "risk_level": perm_detail.risk_level,
                    "reason": f"Rarely used ({p.usage_count} times).",
                    "confidence": 0.7,
                    "evidence": {"is_used": True, "usage_count": p.usage_count}
                })
            # 4. Wildcard
            elif perm_detail.is_wildcard:
                findings.append({
                    "permission_id": perm_detail.id,
                    "action": perm_detail.action,
                    "resource": perm_detail.resource,
                    "recommendation": "RESTRICT",
                    "risk_level": "HIGH",
                    "reason": f"Wildcard permission should be restricted.",
                    "confidence": 0.9,
                    "evidence": {"is_wildcard": True}
                })
            else:
                findings.append({
                    "permission_id": perm_detail.id,
                    "action": perm_detail.action,
                    "resource": perm_detail.resource,
                    "recommendation": "KEEP",
                    "risk_level": perm_detail.risk_level,
                    "reason": f"Actively used and specific.",
                    "confidence": 0.9,
                    "evidence": {"is_used": True, "usage_count": p.usage_count}
                })
        return findings

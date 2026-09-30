"""Attribute-Based Access Control (ABAC) Engine for Bayora.

Enforces cross-tenant isolation invariants:
1. Blue team cannot read raw red payloads while run is RUNNING.
2. Red team cannot inspect blue defensive classifiers/weights at any time.
3. Model sandbox cannot be accessed directly by Red or Blue (must route via Gateway).
4. All denials are audited as security anomalies.
"""

from typing import Dict, Any, Optional, Tuple, List
from pydantic import BaseModel, Field
import time


class ABACSubject(BaseModel):
    user_id: str
    role: str       # "admin", "auditor", "red_lead", "blue_lead", "gateway_internal"
    tenant: str     # "admin", "auditor", "red", "blue", "gateway", "model"


class ABACResource(BaseModel):
    resource_type: str  # "payload", "defense_logic", "model_endpoint", "audit_log", "metric"
    resource_id: str
    run_phase: str      # "SETUP", "RUNNING", "CONCLUDED"
    owner_tenant: Optional[str] = None


class ABACDecision(BaseModel):
    allowed: bool
    reason: str
    evaluated_at: float = Field(default_factory=time.time)
    subject: ABACSubject
    action: str
    resource: ABACResource


class ABACPolicyEngine:
    """Evaluates attribute-based rules and maintains a denial history for anomaly reporting."""

    def __init__(self):
        self.decision_log: List[ABACDecision] = []

    def evaluate(self, subject: ABACSubject, action: str, resource: ABACResource) -> Tuple[bool, str]:
        # Rule 0: Super-admin override
        if subject.role == "admin":
            return self._record(True, "Admin unrestricted access granted", subject, action, resource)

        # Rule 1: Zero Early Redaction Leakage Invariant
        # Blue team attempting to read payload during active testing
        if resource.resource_type == "payload":
            if action in ("read_raw", "inspect"):
                if subject.tenant == "blue" and resource.run_phase != "CONCLUDED":
                    return self._record(
                        False,
                        "DENIED: Blue team cannot observe Red payload during active RUNNING phase (Zero-Early-Leakage policy)",
                        subject, action, resource
                    )
                if subject.tenant not in ("red", "auditor", "admin", "gateway") and resource.run_phase != "CONCLUDED":
                    return self._record(
                        False,
                        f"DENIED: Tenant '{subject.tenant}' unauthorized to view unrevealed payload",
                        subject, action, resource
                    )

        # Rule 2: Defense Opacity Invariant
        # Red team cannot inspect blue team filters, classifiers, or heuristics
        if resource.resource_type == "defense_logic":
            if action in ("inspect_rules", "export_weights", "read_source"):
                if subject.tenant == "red":
                    return self._record(
                        False,
                        "DENIED: Red team is prohibited from inferring or inspecting Blue defensive logic (Defense-Opacity policy)",
                        subject, action, resource
                    )

        # Rule 3: Network Direct Access Prohibition
        # Model endpoint can only be invoked by the Gateway or Admin
        if resource.resource_type == "model_endpoint":
            if action == "invoke_direct":
                if subject.tenant not in ("gateway", "admin"):
                    return self._record(
                        False,
                        f"DENIED: Direct model invocation disallowed for '{subject.tenant}'. Egress policy requires Gateway proxy.",
                        subject, action, resource
                    )

        # Rule 4: Sealed commit reveal restriction
        if action == "reveal_payload":
            if resource.run_phase != "CONCLUDED":
                return self._record(
                    False,
                    "DENIED: Cannot reveal payload while test run is still in RUNNING phase",
                    subject, action, resource
                )
            if subject.tenant != "red" and subject.role not in ("admin", "auditor"):
                return self._record(
                    False,
                    f"DENIED: Tenant '{subject.tenant}' not authorized to reveal Red payload",
                    subject, action, resource
                )

        # Rule 5: Audit log access
        if resource.resource_type == "audit_log":
            if action in ("tamper", "delete", "truncate"):
                return self._record(
                    False,
                    "DENIED: Audit logs are append-only and cryptographically immutable",
                    subject, action, resource
                )

        return self._record(True, "Access authorized under active ABAC policies", subject, action, resource)

    def _record(self, allowed: bool, reason: str, subject: ABACSubject, action: str, resource: ABACResource) -> Tuple[bool, str]:
        decision = ABACDecision(
            allowed=allowed,
            reason=reason,
            subject=subject,
            action=action,
            resource=resource
        )
        self.decision_log.append(decision)
        # Keep recent 200 decisions in memory
        if len(self.decision_log) > 200:
            self.decision_log.pop(0)
        return allowed, reason

    def get_recent_denials(self, limit: int = 50) -> List[ABACDecision]:
        """Returns recent policy denials for security telemetry."""
        denials = [d for d in self.decision_log if not d.allowed]
        return denials[-limit:]

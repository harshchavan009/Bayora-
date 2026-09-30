"""Real-time anomaly detection rules engine and alert feed for Bayora."""

import time
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AnomalyAlert(BaseModel):
    alert_id: str = Field(default_factory=lambda: f"alrt-{uuid.uuid4().hex[:8]}")
    timestamp: float = Field(default_factory=time.time)
    rule_name: str
    severity: str    # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    tenant: str
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    acknowledged: bool = False


class AnomalyEngine:
    """Evaluates real-time anomaly heuristics across isolation, access, and LLM surfaces."""

    def __init__(self):
        self.alerts: List[AnomalyAlert] = []

    def record_anomaly(
        self,
        rule_name: str,
        severity: str,
        tenant: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AnomalyAlert:
        alert = AnomalyAlert(
            rule_name=rule_name,
            severity=severity,
            tenant=tenant,
            description=description,
            metadata=metadata or {}
        )
        self.alerts.append(alert)
        if len(self.alerts) > 100:
            self.alerts.pop(0)
        return alert

    # Specific anomaly rule triggers
    def trigger_canary_leak(self, canary_str: str, source_tenant: str, leak_tenant: str, session_id: str):
        return self.record_anomaly(
            rule_name="CANARY_STRING_CROSS_TENANT_EXFILTRATION",
            severity="CRITICAL",
            tenant=leak_tenant,
            description=f"Canary token from {source_tenant} leaked into egress stream of session {session_id}",
            metadata={"canary_fragment": canary_str[:16] + "...", "session_id": session_id}
        )

    def trigger_cross_boundary_route(self, source: str, destination: str, protocol: str):
        return self.record_anomaly(
            rule_name="NETWORK_SEGMENTATION_LATERAL_PROBE",
            severity="HIGH",
            tenant=source,
            description=f"Unauthorized direct network connection attempted from '{source}' to '{destination}' via {protocol}",
            metadata={"source": source, "destination": destination, "protocol": protocol}
        )

    def trigger_policy_denial(self, tenant: str, action: str, resource_type: str, reason: str):
        return self.record_anomaly(
            rule_name="ABAC_POLICY_VIOLATION_ATTEMPT",
            severity="MEDIUM",
            tenant=tenant,
            description=f"Access denied for tenant '{tenant}' performing '{action}' on '{resource_type}': {reason}",
            metadata={"action": action, "resource_type": resource_type}
        )

    def trigger_audit_tamper(self, block_index: int, details: str):
        return self.record_anomaly(
            rule_name="AUDIT_LOG_TAMPER_DETECTED",
            severity="CRITICAL",
            tenant="system",
            description=f"Cryptographic hash chain violation at block #{block_index}: {details}",
            metadata={"block_index": block_index}
        )

    def trigger_rate_spike(self, tenant: str, req_count: int, limit: int):
        return self.record_anomaly(
            rule_name="FAIR_QUEUE_BURST_THROTTLE",
            severity="LOW",
            tenant=tenant,
            description=f"Tenant '{tenant}' triggered concurrency/burst throttling ({req_count}/{limit})",
            metadata={"tenant": tenant, "limit": limit}
        )

    def get_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        return [a.dict() for a in reversed(self.alerts[-limit:])]

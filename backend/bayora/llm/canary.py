"""Canary token generation, context injection, and egress leakage scanning."""

import hashlib
import re
import uuid
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel, Field
import time


class CanaryToken(BaseModel):
    token_id: str
    token_str: str
    session_id: str
    tenant: str
    created_at: float = Field(default_factory=time.time)
    injected_location: str  # "system_prompt", "rag_context", "metadata"


class CanaryLeakAlert(BaseModel):
    leak_id: str
    canary_str: str
    original_session: str
    original_tenant: str
    detected_in_session: str
    detected_in_tenant: str
    egress_destination: str
    timestamp: float = Field(default_factory=time.time)
    severity: str = "CRITICAL"


class CanaryManager:
    """Manages the lifecycle of high-entropy synthetic canary strings."""

    def __init__(self):
        self.active_canaries: Dict[str, CanaryToken] = {}
        self.leak_alerts: List[CanaryLeakAlert] = []

    def generate_canary(self, session_id: str, tenant: str, location: str = "system_prompt") -> CanaryToken:
        """Generates a unique synthetic canary token formatted as CANARY-<UUID>-<CRC>."""
        raw_uuid = uuid.uuid4().hex[:12]
        checksum = hashlib.sha256(f"{raw_uuid}:{session_id}".encode("ascii")).hexdigest()[:6]
        token_str = f"BAYORA_CANARY_{raw_uuid.upper()}_{checksum.upper()}"

        token = CanaryToken(
            token_id=f"canary-{raw_uuid}",
            token_str=token_str,
            session_id=session_id,
            tenant=tenant,
            injected_location=location
        )
        self.active_canaries[token_str] = token
        return token

    def scan_for_leaks(
        self,
        text: str,
        current_session_id: str,
        current_tenant: str,
        egress_dest: str = "model_output"
    ) -> List[CanaryLeakAlert]:
        """Scans output text for any canary token originating from a DIFFERENT session or tenant."""
        found_leaks: List[CanaryLeakAlert] = []
        if not text:
            return found_leaks

        for canary_str, canary in self.active_canaries.items():
            if canary_str in text:
                # If canary appears in the same session and same tenant context, it's expected internal echo
                if canary.session_id == current_session_id and canary.tenant == current_tenant:
                    continue

                # Cross-session or cross-tenant leakage detected!
                alert = CanaryLeakAlert(
                    leak_id=f"leak-{uuid.uuid4().hex[:8]}",
                    canary_str=canary_str,
                    original_session=canary.session_id,
                    original_tenant=canary.tenant,
                    detected_in_session=current_session_id,
                    detected_in_tenant=current_tenant,
                    egress_destination=egress_dest
                )
                found_leaks.append(alert)
                self.leak_alerts.append(alert)
                if len(self.leak_alerts) > 100:
                    self.leak_alerts.pop(0)

        return found_leaks

    def get_stats(self) -> Dict[str, Any]:
        return {
            "total_canaries_active": len(self.active_canaries),
            "total_leaks_detected": len(self.leak_alerts),
            "recent_alerts": [a.dict() for a in self.leak_alerts[-10:]]
        }

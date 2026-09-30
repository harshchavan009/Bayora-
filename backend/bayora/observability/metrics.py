"""Metrics, system health aggregation, and privacy-preserving redaction pipeline."""

import hashlib
import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


def redact_payload_for_viewer(
    raw_payload: Optional[str],
    commitment_hash: str,
    run_phase: str,
    viewer_role: str,
    is_revealed: bool
) -> Dict[str, Any]:
    """Applies strict role-based redaction to prevent payload or defense leakage."""
    role = viewer_role.lower()

    # Red team always sees their own payload
    if role in ("red", "red_lead"):
        return {
            "display_text": raw_payload or "[Payload not provided]",
            "is_redacted": False,
            "reason": "Authorized creator access",
            "commitment_hash": commitment_hash
        }

    # Blue team: must NEVER see raw payload until test run concludes AND is revealed
    if role in ("blue", "blue_lead"):
        if run_phase != "CONCLUDED" or not is_revealed:
            return {
                "display_text": f"[SEALED ADVERSARIAL PAYLOAD — SHA256: {commitment_hash[:16]}... Hidden until run conclusion]",
                "is_redacted": True,
                "reason": "Zero-Early-Leakage policy: Red team payload is cryptographically sealed during active evaluation",
                "commitment_hash": commitment_hash
            }
        else:
            return {
                "display_text": raw_payload or "[Payload revealed]",
                "is_redacted": False,
                "reason": "Run concluded & payload revealed by Red team",
                "commitment_hash": commitment_hash
            }

    # Auditor / Admin: can see revealed payload if concluded, or sealed placeholder if running
    if run_phase == "CONCLUDED" and is_revealed:
        return {
            "display_text": raw_payload or "[Revealed payload]",
            "is_redacted": False,
            "reason": "Auditor view: Post-run verified",
            "commitment_hash": commitment_hash
        }

    return {
        "display_text": f"[SEALED ADVERSARIAL PAYLOAD — SHA256: {commitment_hash[:16]}...]",
        "is_redacted": True,
        "reason": "Run in progress",
        "commitment_hash": commitment_hash
    }


def redact_defense_for_viewer(
    defense_rule: Optional[str],
    viewer_role: str
) -> Dict[str, Any]:
    """Applies defense-opacity redactions to prevent Red team from learning Blue heuristics."""
    role = viewer_role.lower()
    if role in ("red", "red_lead"):
        return {
            "display_text": "[DEFENSIVE HEURISTIC OPAQUE — Countermeasure details hidden to prevent side-channel probing]",
            "is_redacted": True,
            "reason": "Defense-Opacity invariant"
        }
    return {
        "display_text": defense_rule or "None triggered",
        "is_redacted": False,
        "reason": "Authorized view"
    }


class SystemMetricsCollector:
    """Aggregates system-wide telemetry and calculates isolation health scores."""

    def __init__(self):
        self.start_time = time.time()
        self.total_runs_executed = 0
        self.total_jailbreak_attempts = 0
        self.total_defenses_triggered = 0

    def compute_isolation_score(
        self,
        unauthorized_routes_blocked: int,
        canary_leaks: int,
        audit_tampers: int,
        policy_denials: int
    ) -> float:
        """Computes a 0-100% composite isolation and security health score."""
        score = 100.0
        # Deductions
        score -= (canary_leaks * 25.0)     # Critical LLM state leak
        score -= (audit_tampers * 35.0)    # Cryptographic integrity breach
        # Bounded minimum
        return max(0.0, min(100.0, score))

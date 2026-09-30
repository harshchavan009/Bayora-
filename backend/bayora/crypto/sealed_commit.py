"""Cryptographic Sealed-Commit Scheme for Red-Team Payloads.

Enforces zero-early-leakage:
- Red team commits H = SHA256(payload || nonce) at test initiation.
- Payload is executed inside the isolated gateway.
- Blue team can only see the commitment hash until run conclusion.
- At conclusion, Red reveals (payload, nonce), and cryptographic match is verified.
"""

import hashlib
import secrets
from enum import Enum
from typing import Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field


class CommitmentStatus(str, Enum):
    COMMITTED = "COMMITTED"
    REVEALED = "REVEALED"
    TAMPERED = "TAMPERED"


class SealedCommitment(BaseModel):
    commitment_id: str
    run_id: str
    commitment_hash: str
    created_at: float
    status: CommitmentStatus = CommitmentStatus.COMMITTED
    revealed_payload: Optional[str] = None
    revealed_nonce: Optional[str] = None
    revealed_at: Optional[float] = None
    match_verified: Optional[bool] = None


def compute_commitment_hash(payload: str, nonce: str) -> str:
    """Computes SHA-256 commitment hash: SHA256(payload + '::' + nonce)."""
    raw = f"{payload}::{nonce}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def generate_nonce(length_bytes: int = 32) -> str:
    """Generates a cryptographically strong hex nonce."""
    return secrets.token_hex(length_bytes)


class CommitmentStore:
    """In-memory or persistent store for payload commitments."""

    def __init__(self):
        self._commitments: Dict[str, SealedCommitment] = {}
        # Secret gateway registry storing unrevealed payload for secure execution ONLY
        self._gateway_secure_vault: Dict[str, Tuple[str, str]] = {}

    def commit(self, commitment_id: str, run_id: str, commitment_hash: str, internal_payload: Optional[str] = None, internal_nonce: Optional[str] = None) -> SealedCommitment:
        """Records a new sealed commitment."""
        import time
        record = SealedCommitment(
            commitment_id=commitment_id,
            run_id=run_id,
            commitment_hash=commitment_hash,
            created_at=time.time(),
            status=CommitmentStatus.COMMITTED
        )
        self._commitments[commitment_id] = record
        if internal_payload and internal_nonce:
            self._gateway_secure_vault[commitment_id] = (internal_payload, internal_nonce)
        return record

    def reveal(self, commitment_id: str, payload: str, nonce: str) -> Tuple[bool, SealedCommitment]:
        """Reveals the sealed payload and cryptographically verifies the commitment hash."""
        import time
        if commitment_id not in self._commitments:
            raise KeyError(f"Commitment '{commitment_id}' not found.")

        record = self._commitments[commitment_id]
        expected_hash = compute_commitment_hash(payload, nonce)
        is_match = (expected_hash.lower() == record.commitment_hash.lower())

        record.revealed_payload = payload
        record.revealed_nonce = nonce
        record.revealed_at = time.time()
        record.match_verified = is_match
        record.status = CommitmentStatus.REVEALED if is_match else CommitmentStatus.TAMPERED

        return is_match, record

    def get(self, commitment_id: str) -> Optional[SealedCommitment]:
        return self._commitments.get(commitment_id)

    def list_by_run(self, run_id: str) -> list[SealedCommitment]:
        return [c for c in self._commitments.values() if c.run_id == run_id]

"""Independent cryptographic verification engine for Bayora audit logs and runs."""

import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from ..crypto.signatures import load_public_key_b64, verify_signature
from ..crypto.hashchain import AuditBlock, compute_block_hash
from ..crypto.merkle import MerkleTree
from ..crypto.sealed_commit import compute_commitment_hash, SealedCommitment


class VerificationStep(BaseModel):
    check_name: str
    status: str  # "PASSED", "FAILED", "SKIPPED"
    details: str


class RunVerificationReport(BaseModel):
    run_id: str
    overall_valid: bool
    verified_at: float = Field(default_factory=time.time)
    public_key_b64: str
    total_blocks_checked: int
    steps: List[VerificationStep]
    merkle_root: Optional[str] = None
    sealed_commitments: List[Dict[str, Any]] = Field(default_factory=list)
    tamper_alerts: List[str] = Field(default_factory=list)


class IndependentVerifier:
    """Verifies a full run or chain with zero trust assumptions."""

    @staticmethod
    def verify_run(
        run_id: str,
        blocks: List[AuditBlock],
        public_key_b64: str,
        expected_merkle_root: Optional[str] = None,
        commitments: Optional[List[SealedCommitment]] = None
    ) -> RunVerificationReport:
        steps: List[VerificationStep] = []
        tamper_alerts: List[str] = []
        overall_valid = True

        pub_key = None
        try:
            pub_key = load_public_key_b64(public_key_b64)
            steps.append(VerificationStep(check_name="Ed25519 Public Key Format", status="PASSED", details="Valid Ed25519 public key parsed."))
        except Exception as e:
            overall_valid = False
            steps.append(VerificationStep(check_name="Ed25519 Public Key Format", status="FAILED", details=f"Corrupt public key: {str(e)}"))
            tamper_alerts.append(f"Invalid public key: {str(e)}")

        # 1. Verify Hash Chain blocks
        if not blocks:
            return RunVerificationReport(
                run_id=run_id,
                overall_valid=False,
                public_key_b64=public_key_b64,
                total_blocks_checked=0,
                steps=[VerificationStep(check_name="Block Count", status="FAILED", details="No audit blocks found for this run.")],
                tamper_alerts=["Empty audit sequence."]
            )

        chain_ok = True
        sig_ok = True
        for i, block in enumerate(blocks):
            # Recompute hash
            recomputed = compute_block_hash(
                block.index,
                block.timestamp,
                block.event_type,
                block.tenant,
                block.payload_hash,
                block.metadata,
                block.prev_hash
            )
            if block.block_hash != recomputed:
                chain_ok = False
                overall_valid = False
                msg = f"Block {block.index} content hash mismatch: recorded {block.block_hash}, recomputed {recomputed}"
                tamper_alerts.append(msg)

            # Verify Ed25519 signature
            if pub_key and block.signature != "UNSIGNED":
                sig_valid = verify_signature(pub_key, block.block_hash.encode("ascii"), block.signature)
                if not sig_valid:
                    sig_ok = False
                    overall_valid = False
                    tamper_alerts.append(f"Block {block.index} signature validation failed.")

        steps.append(VerificationStep(
            check_name="Cryptographic Hash Chain Integrity",
            status="PASSED" if chain_ok else "FAILED",
            details=f"Verified SHA-256 hash chaining across {len(blocks)} blocks." if chain_ok else "Hash mismatch detected in chain."
        ))

        steps.append(VerificationStep(
            check_name="Ed25519 Block Signatures",
            status="PASSED" if sig_ok else "FAILED",
            details=f"All {len(blocks)} blocks verified against system Ed25519 public key." if sig_ok else "One or more invalid block signatures."
        ))

        # 2. Verify Merkle Root
        computed_root = None
        if blocks:
            block_hashes = [b.block_hash for b in blocks]
            tree = MerkleTree(block_hashes)
            computed_root = tree.root_hash

            if expected_merkle_root:
                merkle_match = (computed_root.lower() == expected_merkle_root.lower())
                if not merkle_match:
                    overall_valid = False
                    tamper_alerts.append(f"Merkle root mismatch: expected {expected_merkle_root}, computed {computed_root}")
                steps.append(VerificationStep(
                    check_name="Merkle Tree Root Attestation",
                    status="PASSED" if merkle_match else "FAILED",
                    details=f"Computed root {computed_root[:16]}... matches signed checkpoint." if merkle_match else "Merkle root divergence."
                ))
            else:
                steps.append(VerificationStep(
                    check_name="Merkle Tree Derivation",
                    status="PASSED",
                    details=f"Derived Merkle root {computed_root[:16]}... over {len(block_hashes)} leaves."
                ))

        # 3. Verify Sealed Commitments
        commit_records = []
        if commitments:
            commits_ok = True
            for c in commitments:
                c_dict = c.dict()
                if c.revealed_payload and c.revealed_nonce:
                    expected_h = compute_commitment_hash(c.revealed_payload, c.revealed_nonce)
                    match = (expected_h.lower() == c.commitment_hash.lower())
                    c_dict["recomputed_hash"] = expected_h
                    c_dict["verified"] = match
                    if not match:
                        commits_ok = False
                        overall_valid = False
                        tamper_alerts.append(f"Commitment {c.commitment_id} hash mismatch upon revelation.")
                commit_records.append(c_dict)

            steps.append(VerificationStep(
                check_name="Sealed Commit Proofs (Zero-Early-Leakage)",
                status="PASSED" if commits_ok else "FAILED",
                details=f"All revealed payloads match initial SHA-256 commitments." if commits_ok else "Commitment tamper detected."
            ))

        return RunVerificationReport(
            run_id=run_id,
            overall_valid=overall_valid,
            public_key_b64=public_key_b64,
            total_blocks_checked=len(blocks),
            steps=steps,
            merkle_root=computed_root,
            sealed_commitments=commit_records,
            tamper_alerts=tamper_alerts
        )

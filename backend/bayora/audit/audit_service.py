"""Audit service managing append-only hash chains, Merkle checkpoints, and event logs."""

import time
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field

from ..crypto.signatures import generate_keypair, export_public_key_b64
from ..crypto.hashchain import HashChain, AuditBlock
from ..crypto.merkle import MerkleTree, verify_merkle_proof
from ..crypto.sealed_commit import CommitmentStore


class MerkleCheckpoint(BaseModel):
    checkpoint_id: str
    run_id: Optional[str]
    root_hash: str
    leaf_count: int
    timestamp: float = Field(default_factory=time.time)
    signature: str


class AuditService:
    """Singleton-style or injected audit authority."""

    def __init__(self):
        # Generate persistent or session Ed25519 keys
        self.priv_key, self.pub_key = generate_keypair()
        self.public_key_b64 = export_public_key_b64(self.pub_key)
        self.chain = HashChain(private_key=self.priv_key, public_key=self.pub_key)
        self.chain.create_genesis()
        self.commitments = CommitmentStore()
        self.checkpoints: List[MerkleCheckpoint] = []

    def record_event(
        self,
        event_type: str,
        tenant: str,
        payload_data: Any,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditBlock:
        """Appends an immutable event to the hash chain."""
        return self.chain.append(
            event_type=event_type,
            tenant=tenant,
            payload_data=payload_data,
            metadata=metadata
        )

    def generate_merkle_checkpoint(self, run_id: Optional[str] = None) -> MerkleCheckpoint:
        """Constructs a Merkle tree from all recorded block hashes and creates a signed checkpoint."""
        if not self.chain.blocks:
            self.chain.create_genesis()

        # If run_id is specified, filter blocks relevant to that run
        if run_id:
            block_hashes = [
                b.block_hash for b in self.chain.blocks
                if b.metadata.get("run_id") == run_id or b.event_type == "GENESIS"
            ]
        else:
            block_hashes = [b.block_hash for b in self.chain.blocks]

        tree = MerkleTree(block_hashes)
        root = tree.root_hash

        from ..crypto.signatures import sign_message
        sig = sign_message(self.priv_key, root.encode("ascii"))

        cp = MerkleCheckpoint(
            checkpoint_id=f"cp-{int(time.time()*1000)}",
            run_id=run_id,
            root_hash=root,
            leaf_count=len(block_hashes),
            signature=sig
        )
        self.checkpoints.append(cp)
        return cp

    def get_blocks_for_run(self, run_id: str) -> List[AuditBlock]:
        """Returns all blocks associated with a specific run ID including the genesis root anchor."""
        return [b for b in self.chain.blocks if b.metadata.get("run_id") == run_id or b.event_type == "GENESIS"]

    def tamper_block_for_test(self, block_index: int, field: str, new_value: Any) -> bool:
        """Intentionally alters a block to demonstrate tamper detection in test suites."""
        if 0 <= block_index < len(self.chain.blocks):
            block = self.chain.blocks[block_index]
            setattr(block, field, new_value)
            return True
        return False

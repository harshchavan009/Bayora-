"""Append-only, SHA-256 hash-chained event log with Ed25519 signatures."""

import hashlib
import json
import time
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
from .signatures import sign_message, verify_signature


class AuditBlock(BaseModel):
    index: int
    timestamp: float
    event_type: str
    tenant: str
    payload_hash: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    prev_hash: str
    block_hash: str
    signature: str


def compute_payload_hash(data: Any) -> str:
    """Computes a deterministic SHA-256 hash of arbitrary data."""
    if isinstance(data, (dict, list)):
        serialized = json.dumps(data, sort_keys=True, separators=(",", ":")).encode("utf-8")
    elif isinstance(data, str):
        serialized = data.encode("utf-8")
    elif isinstance(data, bytes):
        serialized = data
    else:
        serialized = str(data).encode("utf-8")
    return hashlib.sha256(serialized).hexdigest()


def compute_block_hash(
    index: int,
    timestamp: float,
    event_type: str,
    tenant: str,
    payload_hash: str,
    metadata: Dict[str, Any],
    prev_hash: str
) -> str:
    """Computes the cryptographic SHA-256 hash of a block's contents."""
    meta_json = json.dumps(metadata, sort_keys=True, separators=(",", ":"))
    content = f"{index}|{timestamp:.6f}|{event_type}|{tenant}|{payload_hash}|{meta_json}|{prev_hash}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


class HashChain:
    """Append-only hash-chained ledger."""

    def __init__(self, private_key=None, public_key=None):
        self.blocks: List[AuditBlock] = []
        self.private_key = private_key
        self.public_key = public_key

    def create_genesis(self) -> AuditBlock:
        """Initializes the hash chain with a verifiable genesis block."""
        if self.blocks:
            return self.blocks[0]

        timestamp = time.time()  # Live server clock in UTC
        payload_hash = hashlib.sha256(b"BAYORA_GENESIS_ROOT_V1").hexdigest()
        prev_hash = "0" * 64
        metadata = {"version": "1.0", "system": "bayora-provenance", "clock": "server_utc"}

        block_hash = compute_block_hash(0, timestamp, "GENESIS", "system", payload_hash, metadata, prev_hash)
        signature = sign_message(self.private_key, block_hash.encode("ascii")) if self.private_key else "UNSIGNED"

        genesis = AuditBlock(
            index=0,
            timestamp=timestamp,
            event_type="GENESIS",
            tenant="system",
            payload_hash=payload_hash,
            metadata=metadata,
            prev_hash=prev_hash,
            block_hash=block_hash,
            signature=signature
        )
        self.blocks.append(genesis)
        return genesis

    def append(self, event_type: str, tenant: str, payload_data: Any, metadata: Optional[Dict[str, Any]] = None) -> AuditBlock:
        """Appends a new immutable signed event to the hash chain."""
        if not self.blocks:
            self.create_genesis()

        prev_block = self.blocks[-1]
        index = prev_block.index + 1
        timestamp = time.time()
        payload_hash = compute_payload_hash(payload_data)
        meta = metadata or {}
        prev_hash = prev_block.block_hash

        block_hash = compute_block_hash(index, timestamp, event_type, tenant, payload_hash, meta, prev_hash)
        signature = sign_message(self.private_key, block_hash.encode("ascii")) if self.private_key else "UNSIGNED"

        block = AuditBlock(
            index=index,
            timestamp=timestamp,
            event_type=event_type,
            tenant=tenant,
            payload_hash=payload_hash,
            metadata=meta,
            prev_hash=prev_hash,
            block_hash=block_hash,
            signature=signature
        )
        self.blocks.append(block)
        return block

    def verify_integrity(self) -> Tuple[bool, Optional[int], Optional[str]]:
        """Verifies the entire hash chain from genesis to head."""
        if not self.blocks:
            return True, None, None

        for i, block in enumerate(self.blocks):
            # 1. Verify prev_hash link
            if i == 0:
                if block.prev_hash != "0" * 64:
                    return False, 0, f"Invalid genesis prev_hash: {block.prev_hash}"
            else:
                if block.prev_hash != self.blocks[i - 1].block_hash:
                    return False, i, f"Hash chain broken at block {i}: prev_hash does not match block {i-1}"

            # 2. Recompute block hash
            expected_hash = compute_block_hash(
                block.index,
                block.timestamp,
                block.event_type,
                block.tenant,
                block.payload_hash,
                block.metadata,
                block.prev_hash
            )
            if block.block_hash != expected_hash:
                return False, i, f"Tampered block content at block {i}: expected {expected_hash}, found {block.block_hash}"

            # 3. Verify digital signature
            if self.public_key and block.signature != "UNSIGNED":
                is_valid_sig = verify_signature(self.public_key, block.block_hash.encode("ascii"), block.signature)
                if not is_valid_sig:
                    return False, i, f"Invalid Ed25519 signature at block {i}"

        return True, None, None

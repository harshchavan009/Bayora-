"""Test suite: Hash chain integrity, Ed25519 signatures, Merkle proofs, and tamper detection."""

import pytest
from bayora.crypto.signatures import generate_keypair
from bayora.crypto.hashchain import HashChain
from bayora.crypto.merkle import MerkleTree, verify_merkle_proof
from bayora.audit.verifier import IndependentVerifier


def test_hashchain_clean_verification():
    priv, pub = generate_keypair()
    chain = HashChain(private_key=priv, public_key=pub)
    chain.create_genesis()

    # Append events
    chain.append("RUN_INITIATED", "red", {"run_id": "r-100"}, {"run_id": "r-100"})
    chain.append("PAYLOAD_COMMITTED", "red", {"hash": "abc12345"}, {"run_id": "r-100"})
    chain.append("MODEL_COMPLETION", "model", {"status": "ok"}, {"run_id": "r-100"})

    is_valid, failed_idx, reason = chain.verify_integrity()
    assert is_valid is True
    assert failed_idx is None


def test_hashchain_tamper_detected():
    priv, pub = generate_keypair()
    chain = HashChain(private_key=priv, public_key=pub)
    chain.create_genesis()

    chain.append("EVENT_A", "red", {"data": "A"})
    b2 = chain.append("EVENT_B", "blue", {"data": "B"})
    chain.append("EVENT_C", "model", {"data": "C"})

    # Tamper with block B payload hash
    b2.payload_hash = "TAMPERED_HASH_CORRUPTION_0000000000000000000000000000000000000"

    is_valid, failed_idx, reason = chain.verify_integrity()
    assert is_valid is False
    assert failed_idx == 2
    assert "Tampered block content" in reason


def test_merkle_tree_proof_and_verification():
    leaves = [
        "1111111111111111111111111111111111111111111111111111111111111111",
        "2222222222222222222222222222222222222222222222222222222222222222",
        "3333333333333333333333333333333333333333333333333333333333333333",
        "4444444444444444444444444444444444444444444444444444444444444444",
    ]
    tree = MerkleTree(leaves)
    root = tree.root_hash
    assert len(root) == 64

    # Verify inclusion proof for leaf 1
    proof1 = tree.get_proof(1)
    is_valid = verify_merkle_proof(leaves[1], proof1, root)
    assert is_valid is True

    # Tampered leaf should fail
    tampered_leaf = "9999999999999999999999999999999999999999999999999999999999999999"
    is_invalid = verify_merkle_proof(tampered_leaf, proof1, root)
    assert is_invalid is False

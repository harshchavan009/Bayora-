"""Test suite: Cryptographic sealed-commit scheme & zero-early-leakage invariant."""

import pytest
from bayora.crypto.sealed_commit import compute_commitment_hash, generate_nonce, CommitmentStore, CommitmentStatus
from bayora.observability.metrics import redact_payload_for_viewer
from bayora.access.abac import ABACPolicyEngine, ABACSubject, ABACResource


def test_commitment_hash_determinism():
    payload = "Benign instruction override attempt"
    nonce = generate_nonce()

    h1 = compute_commitment_hash(payload, nonce)
    h2 = compute_commitment_hash(payload, nonce)
    assert h1 == h2
    assert len(h1) == 64  # SHA-256


def test_commit_and_honest_reveal():
    store = CommitmentStore()
    payload = "Adversarial system prompt probe"
    nonce = generate_nonce()
    c_hash = compute_commitment_hash(payload, nonce)

    # 1. Commit
    record = store.commit("c-001", "run-001", c_hash, payload, nonce)
    assert record.status == CommitmentStatus.COMMITTED
    assert record.revealed_payload is None

    # 2. Honest reveal
    is_match, updated = store.reveal("c-001", payload, nonce)
    assert is_match is True
    assert updated.status == CommitmentStatus.REVEALED
    assert updated.revealed_payload == payload
    assert updated.match_verified is True


def test_tampered_payload_reveal_detected():
    store = CommitmentStore()
    original_payload = "Original prompt"
    tampered_payload = "Altered prompt to fake harmlessness"
    nonce = generate_nonce()
    c_hash = compute_commitment_hash(original_payload, nonce)

    store.commit("c-002", "run-002", c_hash)

    # Reveal with modified payload
    is_match, updated = store.reveal("c-002", tampered_payload, nonce)
    assert is_match is False
    assert updated.status == CommitmentStatus.TAMPERED
    assert updated.match_verified is False


def test_zero_early_leakage_redaction_for_blue():
    raw_payload = "Secret instruction probe"
    nonce = generate_nonce()
    c_hash = compute_commitment_hash(raw_payload, nonce)

    # While RUNNING, Blue must see sealed placeholder
    view_blue_running = redact_payload_for_viewer(
        raw_payload=raw_payload,
        commitment_hash=c_hash,
        run_phase="RUNNING",
        viewer_role="blue",
        is_revealed=False
    )
    assert view_blue_running["is_redacted"] is True
    assert "SEALED ADVERSARIAL PAYLOAD" in view_blue_running["display_text"]
    assert raw_payload not in view_blue_running["display_text"]

    # When CONCLUDED & revealed, Blue can see
    view_blue_concluded = redact_payload_for_viewer(
        raw_payload=raw_payload,
        commitment_hash=c_hash,
        run_phase="CONCLUDED",
        viewer_role="blue",
        is_revealed=True
    )
    assert view_blue_concluded["is_redacted"] is False
    assert view_blue_concluded["display_text"] == raw_payload


def test_abac_denies_blue_inspecting_running_payload():
    engine = ABACPolicyEngine()
    subject_blue = ABACSubject(user_id="blue_user", role="blue_lead", tenant="blue")
    res_running = ABACResource(resource_type="payload", resource_id="run-1", run_phase="RUNNING", owner_tenant="red")

    allowed, reason = engine.evaluate(subject_blue, "read_raw", res_running)
    assert allowed is False
    assert "Zero-Early-Leakage policy" in reason

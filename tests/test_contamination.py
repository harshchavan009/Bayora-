"""Test suite: LLM context isolation, KV-cache flush verification, and canary string leak detection."""

import pytest
from bayora.llm.canary import CanaryManager
from bayora.llm.kv_cache import KVCacheManager


def test_canary_token_generation_and_uniqueness():
    mgr = CanaryManager()
    t1 = mgr.generate_canary("sess-1", "tenant-a")
    t2 = mgr.generate_canary("sess-2", "tenant-b")

    assert t1.token_str.startswith("BAYORA_CANARY_")
    assert t2.token_str.startswith("BAYORA_CANARY_")
    assert t1.token_str != t2.token_str


def test_clean_session_disjointness():
    mgr = CanaryManager()
    canary = mgr.generate_canary("session-alpha", "red")

    # Session Beta generates standard model output without contamination
    clean_text = "The quick brown fox jumps over the lazy dog."
    leaks = mgr.scan_for_leaks(clean_text, current_session_id="session-beta", current_tenant="red")

    assert len(leaks) == 0


def test_cross_session_contamination_detected():
    mgr = CanaryManager()
    canary = mgr.generate_canary("session-alpha", "red")

    # Simulated cross-session state bleed: Canary from Session Alpha appears in Session Beta
    contaminated_text = f"Context residual: Prior session key was {canary.token_str}"
    leaks = mgr.scan_for_leaks(contaminated_text, current_session_id="session-beta", current_tenant="red")

    assert len(leaks) == 1
    alert = leaks[0]
    assert alert.original_session == "session-alpha"
    assert alert.detected_in_session == "session-beta"
    assert alert.canary_str == canary.token_str
    assert alert.severity == "CRITICAL"


def test_kv_cache_partition_flush_receipt():
    kv = KVCacheManager()
    session_id = "test-sess-99"

    # 1. Allocate
    partition = kv.allocate_session_context(session_id, "red", estimated_tokens=512)
    assert partition.flushed is False

    # Check uncleaned state
    state1 = kv.verify_clean_state(session_id)
    assert state1["is_clean"] is False
    assert state1["status"] == "UNFLUSHED_ACTIVE_SLOT"

    # 2. Flush
    flushed_p = kv.flush_session(session_id)
    assert flushed_p is not None
    assert flushed_p.flushed is True
    assert flushed_p.flush_receipt_hash is not None
    assert len(flushed_p.flush_receipt_hash) == 64  # Valid SHA-256 receipt

    # Check clean state
    state2 = kv.verify_clean_state(session_id)
    assert state2["is_clean"] is True
    assert state2["status"] == "FLUSHED_AND_ZEROED"
    assert state2["flush_receipt_hash"] == flushed_p.flush_receipt_hash

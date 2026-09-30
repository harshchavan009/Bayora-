"""Test suite: Constant-time response padding and side-channel timing normalization."""

import pytest
import asyncio
import time
from bayora.isolation.gateway import PolicyGateway, GatewayRequest


def test_quantum_bucket_calculation():
    gw = PolicyGateway(bucket_size_ms=200, jitter_max_ms=20)

    # 1. Very fast execution (25ms) -> should pad to 200ms bucket
    delay_sec, bucket_ms = gw.calculate_padded_delay(0.025)
    assert bucket_ms == 200
    assert delay_sec > 0.150  # Must sleep at least 175ms

    # 2. Execution at 180ms -> should pad to 200ms bucket
    delay_sec2, bucket_ms2 = gw.calculate_padded_delay(0.180)
    assert bucket_ms2 == 200
    assert delay_sec2 > 0.015

    # 3. Execution at 220ms -> moves into 400ms bucket
    delay_sec3, bucket_ms3 = gw.calculate_padded_delay(0.220)
    assert bucket_ms3 == 400
    assert delay_sec3 > 0.150


@pytest.mark.asyncio
async def test_timing_side_channel_normalization():
    gw = PolicyGateway(bucket_size_ms=100, jitter_max_ms=10)

    # Task A: Fast filter exit (takes 5ms)
    async def fast_filter():
        await asyncio.sleep(0.005)
        return {"result": "blocked_early"}

    # Task B: Deeper evaluation (takes 65ms)
    async def deep_eval():
        await asyncio.sleep(0.065)
        return {"result": "passed"}

    req_a = GatewayRequest(caller_tenant="red", run_id="r1", target_action="test", payload={}, pad_timing=True)
    req_b = GatewayRequest(caller_tenant="red", run_id="r2", target_action="test", payload={}, pad_timing=True)

    resp_a = await gw.forward_request(req_a, fast_filter)
    resp_b = await gw.forward_request(req_b, deep_eval)

    # Both requests execute in significantly different times internally
    assert resp_a.execution_time_actual_ms < 30
    assert resp_b.execution_time_actual_ms > 60

    # But their padded external response time is normalized to the same 100ms bucket!
    assert resp_a.bucket_ms == 100
    assert resp_b.bucket_ms == 100
    # Difference in external observable latency is minimal (within jitter tolerance)
    assert abs(resp_a.execution_time_padded_ms - resp_b.execution_time_padded_ms) < 35.0

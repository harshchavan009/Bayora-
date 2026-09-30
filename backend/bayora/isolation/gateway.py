"""Policy-Enforcing Gateway with Constant-Time Response Padding and Side-Channel Defense."""

import asyncio
import math
import random
import time
from typing import Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field

from .network_policy import NetworkPolicyEngine
from .fair_queue import FairQueueGovernor
from ..access.tokens import verify_token
from ..access.abac import ABACPolicyEngine, ABACSubject, ABACResource


class GatewayRequest(BaseModel):
    caller_tenant: str     # "red", "blue", "control"
    run_id: str
    target_action: str     # "submit_test", "evaluate_defense", "infer_model"
    payload: Dict[str, Any]
    capability_token: Optional[str] = None
    pad_timing: bool = True   # Enable constant-time bucket padding


class GatewayResponse(BaseModel):
    success: bool
    status_code: int
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time_actual_ms: float
    execution_time_padded_ms: float
    bucket_ms: int
    timing_padded: bool


class PolicyGateway:
    """The central gateway mediating all cross-tenant interactions."""

    def __init__(self, bucket_size_ms: int = 200, jitter_max_ms: int = 25):
        self.bucket_size_ms = bucket_size_ms
        self.jitter_max_ms = jitter_max_ms
        self.network_policy = NetworkPolicyEngine()
        self.fair_queue = FairQueueGovernor()
        self.abac = ABACPolicyEngine()
        self.latency_samples: list[Dict[str, Any]] = []

    def calculate_padded_delay(self, actual_elapsed_seconds: float) -> Tuple[float, int]:
        """Calculates quantum bucket delay to mitigate timing side channels."""
        actual_ms = actual_elapsed_seconds * 1000.0
        # Determine quantum bucket
        bucket = int(math.ceil(actual_ms / self.bucket_size_ms) * self.bucket_size_ms)
        # Add random jitter between 2ms and jitter_max_ms
        jitter_ms = random.uniform(2.0, float(self.jitter_max_ms))
        target_ms = bucket + jitter_ms

        sleep_ms = max(0.0, target_ms - actual_ms)
        return (sleep_ms / 1000.0), bucket

    async def forward_request(
        self,
        request: GatewayRequest,
        handler_coro
    ) -> GatewayResponse:
        """Processes request through network check, fair queue, execution, and timing padding."""
        t_start = time.perf_counter()

        # 1. Network policy check: ensure caller tenant can reach gateway
        route = self.network_policy.check_route(request.caller_tenant, "gateway")
        if not route.allowed:
            t_end = time.perf_counter()
            actual_ms = (t_end - t_start) * 1000.0
            return GatewayResponse(
                success=False,
                status_code=403,
                error=f"Network segmentation violation: {route.rule_description}",
                execution_time_actual_ms=actual_ms,
                execution_time_padded_ms=actual_ms,
                bucket_ms=self.bucket_size_ms,
                timing_padded=False
            )

        # 2. Capability token check if provided
        if request.capability_token:
            valid, token, err = verify_token(request.capability_token)
            if not valid:
                t_end = time.perf_counter()
                actual_ms = (t_end - t_start) * 1000.0
                return GatewayResponse(
                    success=False,
                    status_code=401,
                    error=f"Capability token verification failed: {err}",
                    execution_time_actual_ms=actual_ms,
                    execution_time_padded_ms=actual_ms,
                    bucket_ms=self.bucket_size_ms,
                    timing_padded=False
                )

        # 3. Fair queue admission control
        acquired, quota_err = self.fair_queue.acquire(request.caller_tenant)
        if not acquired:
            t_end = time.perf_counter()
            actual_ms = (t_end - t_start) * 1000.0
            return GatewayResponse(
                success=False,
                status_code=429,
                error=f"Resource governance denial: {quota_err}",
                execution_time_actual_ms=actual_ms,
                execution_time_padded_ms=actual_ms,
                bucket_ms=self.bucket_size_ms,
                timing_padded=False
            )

        # 4. Execute workload
        result_data = None
        result_err = None
        status_code = 200
        try:
            result_data = await handler_coro()
        except Exception as e:
            result_err = str(e)
            status_code = 500
        finally:
            self.fair_queue.release(request.caller_tenant)

        t_exec_done = time.perf_counter()
        actual_elapsed = t_exec_done - t_start
        actual_ms = actual_elapsed * 1000.0

        # 5. Timing side-channel mitigation
        padded_ms = actual_ms
        bucket_ms = int(math.ceil(actual_ms / self.bucket_size_ms) * self.bucket_size_ms)

        if request.pad_timing:
            sleep_sec, bucket_ms = self.calculate_padded_delay(actual_elapsed)
            if sleep_sec > 0:
                await asyncio.sleep(sleep_sec)
            padded_ms = (time.perf_counter() - t_start) * 1000.0

        sample = {
            "timestamp": time.time(),
            "tenant": request.caller_tenant,
            "action": request.target_action,
            "actual_ms": round(actual_ms, 2),
            "padded_ms": round(padded_ms, 2),
            "bucket_ms": bucket_ms
        }
        self.latency_samples.append(sample)
        if len(self.latency_samples) > 200:
            self.latency_samples.pop(0)

        return GatewayResponse(
            success=(status_code == 200),
            status_code=status_code,
            data=result_data,
            error=result_err,
            execution_time_actual_ms=round(actual_ms, 2),
            execution_time_padded_ms=round(padded_ms, 2),
            bucket_ms=bucket_ms,
            timing_padded=request.pad_timing
        )

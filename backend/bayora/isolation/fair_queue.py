"""Fair queueing and resource governance engine for Bayora."""

import time
import asyncio
from typing import Dict, Any, Optional
from pydantic import BaseModel


class TenantQuota(BaseModel):
    tenant: str
    capacity: float = 20.0       # Max burst tokens
    tokens: float = 20.0         # Current available tokens
    refill_rate: float = 5.0     # Tokens added per second
    last_update: float = 0.0
    total_requests: int = 0
    throttled_requests: int = 0
    active_in_flight: int = 0
    max_concurrent: int = 5


class FairQueueGovernor:
    """Manages tenant rate limits and concurrency limits to maintain fairness."""

    def __init__(self):
        self.quotas: Dict[str, TenantQuota] = {
            "red": TenantQuota(tenant="red", capacity=15.0, tokens=15.0, refill_rate=3.0, max_concurrent=4),
            "blue": TenantQuota(tenant="blue", capacity=25.0, tokens=25.0, refill_rate=5.0, max_concurrent=6),
            "control": TenantQuota(tenant="control", capacity=50.0, tokens=50.0, refill_rate=10.0, max_concurrent=10),
            "gateway": TenantQuota(tenant="gateway", capacity=100.0, tokens=100.0, refill_rate=20.0, max_concurrent=20),
        }

    def _refill(self, quota: TenantQuota):
        now = time.time()
        if quota.last_update == 0.0:
            quota.last_update = now
            return

        elapsed = now - quota.last_update
        quota.tokens = min(quota.capacity, quota.tokens + (elapsed * quota.refill_rate))
        quota.last_update = now

    def acquire(self, tenant: str, cost: float = 1.0) -> Tuple[bool, Optional[str]]:
        """Attempts to acquire execution tokens for a tenant."""
        from typing import Tuple
        quota = self.quotas.get(tenant)
        if not quota:
            quota = TenantQuota(tenant=tenant)
            self.quotas[tenant] = quota

        self._refill(quota)
        quota.total_requests += 1

        if quota.active_in_flight >= quota.max_concurrent:
            quota.throttled_requests += 1
            return False, f"Concurrency limit exceeded ({quota.active_in_flight}/{quota.max_concurrent} in flight)"

        if quota.tokens < cost:
            quota.throttled_requests += 1
            return False, f"Rate limit quota exceeded ({quota.tokens:.1f}/{quota.capacity} tokens available)"

        quota.tokens -= cost
        quota.active_in_flight += 1
        return True, None

    def release(self, tenant: str):
        """Releases an in-flight execution slot for a tenant."""
        quota = self.quotas.get(tenant)
        if quota and quota.active_in_flight > 0:
            quota.active_in_flight -= 1

    def get_stats(self) -> Dict[str, Any]:
        """Exports live resource stats for the dashboard."""
        stats = {}
        for tenant, q in self.quotas.items():
            self._refill(q)
            stats[tenant] = {
                "available_tokens": round(q.tokens, 2),
                "capacity": q.capacity,
                "refill_rate": q.refill_rate,
                "active_in_flight": q.active_in_flight,
                "max_concurrent": q.max_concurrent,
                "total_requests": q.total_requests,
                "throttled_requests": q.throttled_requests,
                "utilization_pct": round(((q.capacity - q.tokens) / q.capacity) * 100, 1)
            }
        return stats

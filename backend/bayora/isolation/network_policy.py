"""Network segmentation matrix and connectivity policy enforcement for Bayora."""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import time


class RoutePolicy(BaseModel):
    source: str
    destination: str
    allowed: bool
    protocol: str
    port: int
    rule_description: str


class NetworkTrafficEvent(BaseModel):
    timestamp: float
    source: str
    destination: str
    protocol: str
    status: str  # "FORWARDED", "BLOCKED_DROPPED", "BLOCKED_REJECTED"
    reason: str


# Predefined isolation rules corresponding to Docker compose network topology
NETWORK_POLICIES: List[RoutePolicy] = [
    RoutePolicy(source="red", destination="gateway", allowed=True, protocol="HTTP/mTLS", port=8080, rule_description="Red team payload commitment & test submission"),
    RoutePolicy(source="blue", destination="gateway", allowed=True, protocol="HTTP/mTLS", port=8080, rule_description="Blue team defensive classifier registration & telemetry"),
    RoutePolicy(source="gateway", destination="model", allowed=True, protocol="HTTP", port=8002, rule_description="Sanitized isolated inference forwarding"),
    RoutePolicy(source="control", destination="gateway", allowed=True, protocol="HTTP", port=8080, rule_description="Control plane run orchestration"),
    RoutePolicy(source="gateway", destination="audit", allowed=True, protocol="INTERNAL", port=5432, rule_description="Immutable event log writes"),
    # Blocked paths
    RoutePolicy(source="red", destination="blue", allowed=False, protocol="TCP", port=0, rule_description="Direct tenant cross-talk prohibited (Separate Docker bridges)"),
    RoutePolicy(source="blue", destination="red", allowed=False, protocol="TCP", port=0, rule_description="Direct tenant cross-talk prohibited (Separate Docker bridges)"),
    RoutePolicy(source="red", destination="model", allowed=False, protocol="HTTP", port=8002, rule_description="Direct model bypass prohibited (Must route through Gateway)"),
    RoutePolicy(source="blue", destination="model", allowed=False, protocol="HTTP", port=8002, rule_description="Direct model bypass prohibited (Must route through Gateway)"),
    RoutePolicy(source="model", destination="internet", allowed=False, protocol="ANY", port=0, rule_description="Model egress isolation (Default-deny egress)"),
    RoutePolicy(source="model", destination="red", allowed=False, protocol="ANY", port=0, rule_description="Reverse tenant exfiltration blocked"),
    RoutePolicy(source="model", destination="blue", allowed=False, protocol="ANY", port=0, rule_description="Reverse tenant exfiltration blocked"),
]


class NetworkPolicyEngine:
    def __init__(self):
        self._policies = NETWORK_POLICIES
        self.traffic_events: List[NetworkTrafficEvent] = []

    def check_route(self, source: str, destination: str) -> RoutePolicy:
        """Looks up the authoritative network route rule."""
        src = source.lower()
        dst = destination.lower()
        for p in self._policies:
            if p.source == src and p.destination == dst:
                return p
        # Default deny all other unspecified routes
        return RoutePolicy(
            source=src,
            destination=dst,
            allowed=False,
            protocol="ANY",
            port=0,
            rule_description="Implicit default-deny egress firewall policy"
        )

    def test_connectivity(self, source: str, destination: str) -> NetworkTrafficEvent:
        """Simulates or validates actual connectivity check and records event."""
        policy = self.check_route(source, destination)
        event = NetworkTrafficEvent(
            timestamp=time.time(),
            source=source,
            destination=destination,
            protocol=policy.protocol,
            status="FORWARDED" if policy.allowed else "BLOCKED_DROPPED",
            reason=policy.rule_description
        )
        self.traffic_events.append(event)
        if len(self.traffic_events) > 100:
            self.traffic_events.pop(0)
        return event

    def get_matrix(self) -> Dict[str, Any]:
        """Exports the full isolation matrix for UI visualization."""
        nodes = ["red", "blue", "model", "gateway", "control", "internet"]
        grid = {}
        for s in nodes:
            grid[s] = {}
            for d in nodes:
                if s == d:
                    grid[s][d] = {"allowed": True, "self": True, "description": "Loopback interface"}
                else:
                    rule = self.check_route(s, d)
                    grid[s][d] = {
                        "allowed": rule.allowed,
                        "protocol": rule.protocol,
                        "description": rule.rule_description
                    }
        return {"nodes": nodes, "matrix": grid, "rules": [p.dict() for p in self._policies]}

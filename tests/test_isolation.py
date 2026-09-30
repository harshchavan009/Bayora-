"""Test suite: Network segmentation and cross-tenant boundary isolation."""

import pytest
from bayora.isolation.network_policy import NetworkPolicyEngine


def test_allowed_network_paths():
    engine = NetworkPolicyEngine()

    # Red to Gateway allowed
    r1 = engine.check_route("red", "gateway")
    assert r1.allowed is True
    assert "Red team" in r1.rule_description

    # Blue to Gateway allowed
    r2 = engine.check_route("blue", "gateway")
    assert r2.allowed is True

    # Gateway to Model allowed
    r3 = engine.check_route("gateway", "model")
    assert r3.allowed is True


def test_blocked_cross_tenant_paths():
    engine = NetworkPolicyEngine()

    # Direct Red <-> Blue communication strictly blocked
    r_red_blue = engine.check_route("red", "blue")
    assert r_red_blue.allowed is False
    assert "Direct tenant cross-talk prohibited" in r_red_blue.rule_description

    r_blue_red = engine.check_route("blue", "red")
    assert r_blue_red.allowed is False


def test_direct_model_bypass_blocked():
    engine = NetworkPolicyEngine()

    # Red cannot bypass gateway to hit model directly
    r_red_model = engine.check_route("red", "model")
    assert r_red_model.allowed is False
    assert "Direct model bypass prohibited" in r_red_model.rule_description

    # Blue cannot bypass gateway to hit model directly
    r_blue_model = engine.check_route("blue", "model")
    assert r_blue_model.allowed is False


def test_model_egress_default_deny():
    engine = NetworkPolicyEngine()

    # Model cannot connect to internet or tenants directly
    r_model_inet = engine.check_route("model", "internet")
    assert r_model_inet.allowed is False

    r_model_red = engine.check_route("model", "red")
    assert r_model_red.allowed is False

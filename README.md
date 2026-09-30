# Bayora — AI Safety Validation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: Ed25519](https://img.shields.io/badge/Security-Ed25519%20%7C%20SHA--256-emerald)](docs/architecture.md)
[![Isolation: Rootless%20Containers](https://img.shields.io/badge/Isolation-Rootless%20UID%2010001-cyan)](infra/docker-compose.yml)
[![Tests: 18%20Passed](https://img.shields.io/badge/Tests-18%20Passed-brightgreen)](tests/)

> **A professional web console plus deployable proof-of-concept backend demonstrating secure, isolated adversarial red-team vs. defensive blue-team testing of frontier LLMs.**

---

## Executive Summary
Bayora enables simultaneous red-team adversarial attacks, blue-team defensive countermeasures, and client LLMs to execute in a shared environment without state leakage, environmental side-channels, or tenant contamination:

1. **Zero Early Redaction Leakage**: Red-team adversarial payloads are committed as SHA-256 hashes ($H = \text{SHA256}(P \parallel N)$) at test start and remain completely unobservable to Blue defenders until run conclusion.
2. **Defense Opacity**: Blue-team heuristic classifiers, regex rules, and weights are capability-isolated and cannot be probed or inferred by Red tooling.
3. **Session & State Disjointness**: The client LLM maintains strictly partitioned inference contexts with verifiable KV-cache flushes and zero cross-tenant prompt caching, monitored continuously with synthetic canary tokens.
4. **Independently Verifiable Findings**: Every event is committed to an Ed25519-signed, SHA-256 hash-chained log with periodic Merkle roots, verifiable offline via CLI or web console.

---

## Architecture: The 7 Security Verticals

```
+-----------------------------------------------------------------------------------+
| Host Cloud VM                                                                     |
|                                                                                   |
|  +---------------------+      +---------------------+      +-------------------+  |
|  |   Red Sandbox       |      |   Blue Sandbox      |      |   Model Sandbox   |  |
|  |  (UID 10001, RO FS) |      |  (UID 10001, RO FS) |      |  (Clean Context)  |  |
|  +----------+----------+      +----------+----------+      +---------+---------+  |
|             |                            |                           |            |
|    bayora-red-net               bayora-blue-net               bayora-model-net    |
|             |                            |                           |            |
|             +------------+        +------+                           |            |
|                          v        v                                  v            |
|                     +----+--------+----+               +-------------+---------+  |
|                     |  Policy Gateway  |<------------->|   Audit & Merkle      |  |
|                     |  (ABAC / Padding)|               |   (Ed25519 Chain)     |  |
|                     +----+-------------+               +-----------------------+  |
|                          ^                                                        |
|                          | bayora-control-net                                     |
|                          v                                                        |
|                     +----+-------------+                                          |
|                     | Next.js Console  |                                          |
|                     +------------------+                                          |
+-----------------------------------------------------------------------------------+
```

1. **Container & Sandbox Isolation**: Rootless UID 10001 execution, `read_only: true` root filesystems, `cap_drop: [ALL]`, `no-new-privileges: true`, custom Seccomp profile blocking `ptrace, bpf, mount`.
2. **Network Segmentation**: Dedicated Docker bridge subnets per tenant (`bayora-red-net`, `bayora-blue-net`, `bayora-model-net`). Egress default-deny. Direct Red ↔ Blue traffic is air-gapped and rejected.
3. **Access Control & ABAC**: Short-lived HMAC-SHA256 capability tokens gating access by role (`red_lead`, `blue_lead`, `auditor`, `admin`).
4. **Cryptographic Provenance**: Append-only hash chain with Ed25519 signatures, Merkle tree root checkpoints, and sealed-commit reveal validation.
5. **Resource Fairness & Timing Defense**: Token-bucket fair queueing and constant-time quantum bucket delay padding (200ms) with uniform jitter to defeat timing side channels.
6. **LLM Threat Surface**: Isolated virtual KV-cache partitions with verifiable flush receipts and real-time canary string egress monitoring.
7. **Observability & Anomaly Feed**: Privacy-preserving telemetry (hashes and token metrics only; never raw prompts or regex rules) and real-time security alerts.

---

## Quickstart

### Option A: Local Development (Instant)

```bash
# 1. Setup Python backend virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# 2. Run backend API server
PYTHONPATH=backend python3 -m uvicorn bayora.main:app --port 8000 &

# 3. Setup and start Next.js web console
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

### Option B: Docker Compose (Production VM)

```bash
cd infra
docker compose up -d --build
```

Services exposed:
- Web Console: `http://localhost:3000`
- Control API: `http://localhost:8000`
- OpenAPI Docs: `http://localhost:8000/docs`

---

## Running the Automated Test Suite

Bayora includes 18 automated tests validating network segmentation, sealed commitments, canary contamination, timing side-channel padding, and audit tamper detection:

```bash
source .venv/bin/activate
PYTHONPATH=backend pytest tests -v
```

Output:
```
tests/test_audit_tamper.py::test_hashchain_clean_verification PASSED
tests/test_audit_tamper.py::test_hashchain_tamper_detected PASSED
tests/test_audit_tamper.py::test_merkle_tree_proof_and_verification PASSED
tests/test_contamination.py::test_canary_token_generation_and_uniqueness PASSED
tests/test_contamination.py::test_clean_session_disjointness PASSED
tests/test_contamination.py::test_cross_session_contamination_detected PASSED
tests/test_contamination.py::test_kv_cache_partition_flush_receipt PASSED
tests/test_isolation.py::test_allowed_network_paths PASSED
tests/test_isolation.py::test_blocked_cross_tenant_paths PASSED
tests/test_isolation.py::test_direct_model_bypass_blocked PASSED
tests/test_isolation.py::test_model_egress_default_deny PASSED
tests/test_sealed_commit.py::test_commitment_hash_determinism PASSED
tests/test_sealed_commit.py::test_commit_and_honest_reveal PASSED
tests/test_sealed_commit.py::test_tampered_payload_reveal_detected PASSED
tests/test_sealed_commit.py::test_zero_early_leakage_redaction_for_blue PASSED
tests/test_sealed_commit.py::test_abac_denies_blue_inspecting_running_payload PASSED
tests/test_timing_padding.py::test_quantum_bucket_calculation PASSED
tests/test_timing_padding.py::test_timing_side_channel_normalization PASSED
============================== 18 passed in 0.39s ==============================
```

---

## Third-Party Independent Run Verification CLI

Third-party auditors can re-verify all cryptographic assertions for any test run:

```bash
./scripts/verify_run.py --run-id run-jailbreak-001 --api-url http://localhost:8000
```

---

## Documentation Index
- [Architecture & Sequence Diagrams](docs/architecture.md)
- [STRIDE Threat Model](docs/threat_model.md)
- [Residual Risks & Hardware Attestation Roadmap](docs/residual_risks.md)
- [Production Deployment Guide](docs/deployment.md)
- [Known Limitations & Disclosures](docs/known_limitations.md)

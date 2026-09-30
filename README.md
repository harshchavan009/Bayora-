# Bayora — Enterprise AI Safety Validation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security: Ed25519](https://img.shields.io/badge/Security-Ed25519%20%7C%20SHA--256-emerald)](docs/architecture.md)
[![Isolation: Rootless%20Containers](https://img.shields.io/badge/Isolation-Rootless%20UID%2010001-cyan)](infra/docker-compose.yml)
[![Tests: 18%20Passed](https://img.shields.io/badge/Tests-18%20Passed-brightgreen)](tests/)
[![Auth: Argon2id%20%7C%20JWT](https://img.shields.io/badge/Auth-Argon2id%20%7C%20JWT-purple)](backend/bayora/auth/)

> **A production-grade, multi-user B2B AI safety and adversarial evaluation platform. Designed for enterprise security teams conducting isolated red-team jailbreak testing, blue-team countermeasure verification, and cryptographic audit proofs without state leakage or side-channel contamination.**

---

## Overview & Key Guarantees

Bayora enables simultaneous red-team adversarial attacks, blue-team defensive countermeasures, and client LLMs to execute in a shared environment without state leakage, environmental side-channels, or tenant contamination:

1. **Zero Early Redaction Leakage**: Red-team adversarial payloads are committed as SHA-256 hashes ($H = \text{SHA256}(P \parallel N)$) at test start and remain completely unobservable to Blue defenders until run conclusion.
2. **Defense Opacity**: Blue-team heuristic classifiers, regex rules, and weights are capability-isolated and cannot be probed or inferred by Red tooling.
3. **Session & State Disjointness**: The client LLM maintains strictly partitioned inference contexts with verifiable memory flushes and zero cross-tenant prompt caching, monitored continuously with synthetic canary tokens.
4. **Independently Verifiable Findings**: Every event is committed to an Ed25519-signed, SHA-256 hash-chained log with periodic Merkle roots, verifiable offline via CLI or web console.
5. **Response Timing Normalization**: All outbound model completions are quantized into fixed 200ms buckets, neutralizing side-channel latency differential attacks.

---

## Pre-Seeded Enterprise Demo Credentials

Bayora comes configured with enterprise RBAC roles and pre-seeded demo accounts. The login screen features a 1-click role switcher for instant demonstration:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@bayora.io` | `BayoraOwner2026!` | Full workspace ownership, member management, and billing |
| **Admin** | `admin@bayora.io` | `BayoraAdmin2026!` | Model endpoints, RBAC policies, and Role Preview Simulator |
| **Red Team Lead** | `red@bayora.io` | `BayoraRed2026!` | Adversarial probe campaigns, sealed payload commitments |
| **Blue Team Lead** | `blue@bayora.io` | `BayoraBlue2026!` | Defensive rule inspection, heuristic filters, and mitigations |
| **Auditor** | `auditor@bayora.io` | `BayoraAuditor2026!` | Cryptographic ledger proof verification and evidence export |
| **Viewer** | `viewer@bayora.io` | `BayoraViewer2026!` | Read-only visibility into concluded evaluation reports |

---

## Route & Navigation Architecture

### Public Marketing & Authentication (Unauthenticated)
- `/` — Marketing landing page (editorial hero, browser product frame, 3-step architecture, calibrated security claims, FAQ, footer).
- `/login` — Enterprise sign-in with 1-click role switcher and SSO buttons.
- `/signup` — Organization and initial workspace registration.
- `/forgot-password` — Password reset request screen.

### Authenticated Workspace Console (`/ws/...`)
- `/dashboard` — Workspace overview: 4 metric tiles, onboarding wizard, recent evaluations table, needs attention list, and activity feed.
- `/evaluations` — Adversarial campaigns table with filters, search, and integrated 3-step evaluation creation modal.
- `/evaluations/[id]` — Evaluation detail: sequential timeline, detected findings, isolation evidence, and cryptographic proofs.
- `/models` — Connected model targets (vLLM, Ollama, Anthropic Proxy, Mock Sandbox), latency test ping, and endpoint registration.
- `/findings` — Verified security findings triage matrix, OWASP LLM tags, severity filters, CSV export, and detail slide-over drawer.
- `/isolation` — Cross-tenant connectivity heatmap with allow/deny indicators, click-to-open cell policy drawer, and hardening checklist.
- `/audit` — Table-first cryptographic provenance ledger with SHA-256 hash copying, right-side verification card, and sandboxed tamper simulation.
- `/access` — Team members table, 6-role RBAC permissions grid, ABAC security invariants, and masked API key manager.
- `/monitoring` — Real-time response timing normalization visualizer (raw vs padded egress), token quota tracker, and security alert triage drawer.
- `/threat-model` — Security posture document with sticky table of contents, calibrated technical guarantees, and STRIDE analysis matrix.
- `/settings` — Workspace profile, Single Sign-On (SSO) configuration, alert webhooks, and the Admin **View as Role** preview simulator.
- `/health` — Real-time cluster subsystem health diagnostics and component benchmarks.

---

## Design System Tokens & Principles

Bayora adheres to modern, dense, enterprise B2B SaaS standards (Linear, Vercel, Datadog, Wiz style):

- **Typography**: Inter sans for UI labels, titles, and body copy. Numerals formatted with `tabular-nums`. Monospace (JetBrains Mono) is strictly reserved for cryptographic hashes, block IDs, tokens, code snippets, and timestamps.
- **Color Palette**:
  - Canvas: `#0B0C0F` (Dark default) / `#FAFAFB` (Light)
  - Surface 1: `#111317` (Cards, sidebar)
  - Surface 2: `#171A1F` (Hover states, inputs, popovers)
  - Border: `#23272E` / `#E6E8EC`
  - Accent: `#6E7BF2` (Restrained single brand accent, never over-used)
  - Status Semantics: Green (`#3FB68B`), Amber (`#E2A336`), Red (`#E5534B`), Blue (`#4C9AFF`) applied exclusively to small badges and dots.
- **Elevation & Layout**: Flat 1px bordered cards with subtle elevation shadows for popovers. Base 4/8px spacing grid with 1280px max-width content container. Responsive across 1440px desktop, 1024px tablet, and 390px mobile viewports.

---

## Quickstart

### 1. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/harshchavan009/Bayora-.git
cd Bayora-

# Setup Python virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Start backend server
PYTHONPATH=backend python3 -m uvicorn bayora.main:app --host 0.0.0.0 --port 8000 &

# Setup and run Next.js frontend
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the platform.

### 2. Docker Compose Deployment

```bash
cd infra
docker compose up -d --build
```

Services exposed:
- Web Console: `http://localhost:3000`
- API Gateway & Proxy: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

## Automated Test Suite

Bayora includes 18 automated tests validating cryptographic integrity, network isolation, sealed commitments, canary detection, and timing side-channel defenses:

```bash
source .venv/bin/activate
PYTHONPATH=backend pytest -v
```

Output:
```
tests/test_audit_tamper.py::test_hashchain_clean_verification PASSED     [  5%]
tests/test_audit_tamper.py::test_hashchain_tamper_detected PASSED        [ 11%]
tests/test_audit_tamper.py::test_merkle_tree_proof_and_verification PASSED [ 16%]
tests/test_contamination.py::test_canary_token_generation_and_uniqueness PASSED [ 22%]
tests/test_contamination.py::test_clean_session_disjointness PASSED      [ 27%]
tests/test_contamination.py::test_cross_session_contamination_detected PASSED [ 33%]
tests/test_contamination.py::test_kv_cache_partition_flush_receipt PASSED [ 38%]
tests/test_isolation.py::test_allowed_network_paths PASSED               [ 44%]
tests/test_isolation.py::test_blocked_cross_tenant_paths PASSED          [ 50%]
tests/test_isolation.py::test_direct_model_bypass_blocked PASSED         [ 55%]
tests/test_isolation.py::test_model_egress_default_deny PASSED           [ 61%]
tests/test_sealed_commit.py::test_commitment_hash_determinism PASSED     [ 66%]
tests/test_sealed_commit.py::test_commit_and_honest_reveal PASSED        [ 72%]
tests/test_sealed_commit.py::test_tampered_payload_reveal_detected PASSED [ 77%]
tests/test_sealed_commit.py::test_zero_early_leakage_redaction_for_blue PASSED [ 83%]
tests/test_sealed_commit.py::test_abac_denies_blue_inspecting_running_payload PASSED [ 88%]
tests/test_timing_padding.py::test_quantum_bucket_calculation PASSED     [ 94%]
tests/test_timing_padding.py::test_timing_side_channel_normalization PASSED [100%]

============================== 18 passed in 0.38s ==============================
```

---

## Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `API_URL` | `http://localhost:8000` | Frontend backend API connection endpoint |
| `JWT_SECRET` | `bayora-secret-key-change-in-prod` | Signing secret for session JWT cookies |
| `ARGON2_MEMORY_COST` | `65536` | Memory parameter for password hashing (KiB) |
| `TIMING_PADDING_BUCKET_MS` | `200` | Quantum interval for response delay normalization |
| `CLUSTER_KEY_PATH` | `keys/ed25519_cluster.pem` | Private key for cryptographic audit signing |

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

# Bayora Threat Model & STRIDE Analysis

## 1. System Assumptions & Trust Boundaries
Bayora operates under a zero-trust model between evaluation tenants:
- **Red Team** is untrusted and assumed adversarial: may attempt to probe defense heuristics, exfiltrate model weights, exhaust resources, or bypass network boundaries.
- **Blue Team** is defensive but constrained: must not observe Red payloads early to prevent biasing defensive classifiers before testing concludes.
- **Model Sandbox** is considered contaminated after execution and must be explicitly flushed before subsequent tenant turns.
- **Policy Gateway** is the single trusted multi-homed mediator enforcing network, token, and cryptographic policies.
- **Audit Store** is an append-only verifiable cryptographic ledger.

---

## 2. STRIDE Threat Analysis

### 2.1 Spoofing (Identity & Authenticity)
- **Threat Scenario**: Malicious party attempts to issue requests posing as Red, Blue, or an Auditor, or forges safety findings.
- **Mitigation**:
  - Ephemeral HMAC-SHA256 capability tokens bound to specific tenant roles and run IDs.
  - Secret signing keys stored in `/run/secrets` tmpfs memory-only volumes with strict filesystem permissions (`mode 0700`).
  - Ed25519 digital signatures on all audit blocks and Merkle checkpoints.
- **Residual Risk**: Low. Requires compromising the ephemeral secret key in host tmpfs memory.

### 2.2 Tampering (Data Integrity)
- **Threat Scenario**: Attacker modifies historical audit blocks to hide a failed safety test or alters an adversarial prompt after evaluation.
- **Mitigation**:
  - SHA-256 hash chaining: altering block $i$ invalidates $\text{prev\_hash}$ for all subsequent blocks $i+1 \dots n$.
  - Sealed-Commit Protocol: Red must reveal $(P, N)$ matching initial commitment $H = \text{SHA256}(P \parallel N)$.
  - Independent offline verification CLI (`scripts/verify_run.py`) verifies entire run proofs.
- **Residual Risk**: Negligible.

### 2.3 Repudiation (Non-Repudiation)
- **Threat Scenario**: A participant denies generating a toxic prompt or denies that a defensive filter failed.
- **Mitigation**:
  - Cryptographically signed audit blocks tie every event to a tenant identity, timestamp, and signature.
  - Periodic Merkle roots anchored to external witnesses or public ledgers.
- **Residual Risk**: Negligible.

### 2.4 Information Disclosure (Confidentiality & Side-Channels)
- **Threat Scenario**:
  - Blue observes Red payload prematurely.
  - Red infers Blue classifier logic via regex reflection or latency differences.
  - Tenant A reads residual state from Tenant B in shared model inference.
- **Mitigation**:
  - Sealed commitment hides raw payload until run concludes.
  - ABAC engine enforces role-based masking in API responses.
  - Constant-time bucket padding (200ms quantum) masks defensive evaluation depth.
  - Per-session KV-cache flush receipts and synthetic canary string egress scanning.
- **Residual Risk**: Low.

### 2.5 Denial of Service (Availability & Starvation)
- **Threat Scenario**: Red floods the model sandbox with high-concurrency requests, starving Blue defense evaluations.
- **Mitigation**:
  - Token-bucket fair queue governor maintains per-tenant rate and concurrency limits.
  - Docker cgroups restrict CPU quotas (`0.75 - 1.5 CPUs`), memory (`384MB - 1024MB`), and PIDs (`80 - 100`).
- **Residual Risk**: Low.

### 2.6 Elevation of Privilege (Isolation Escape)
- **Threat Scenario**: Tenant exploits container runtime or Linux kernel to escape sandbox or access host filesystem.
- **Mitigation**:
  - Non-root user (`UID 10001:GID 10001`).
  - Read-only root filesystem (`read_only: true`).
  - Drop all capabilities (`cap_drop: [ALL]`), `no-new-privileges: true`.
  - Hardened Seccomp profile blocking `ptrace, bpf, mount, kexec_load`.
- **Residual Risk**: Medium against 0-day host kernel bugs (mitigated by Kata/gVisor upgrade path).

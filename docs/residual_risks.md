# Bayora Residual Risks & Hardware Attestation Roadmap

## 1. Residual Risk Matrix

| Threat Category | Underlying Assumption | Residual Severity | Mitigation in Bayora | Long-Term Upgrade Path |
|---|---|---|---|---|
| **Host Kernel Zero-Day** | Shared Linux kernel between container namespaces | **MEDIUM** | Rootless UID 10001, `read_only: true`, `cap_drop: ALL`, custom Seccomp filter | Kata Containers (QEMU/Cloud-Hypervisor microVMs) or gVisor (`runsc`) |
| **Microarchitectural Side-Channels** | Shared physical CPU execution pipelines (Spectre, L1TF, MDS) | **LOW - MEDIUM** | Constant-time quantum bucket padding, jitter injection, process separation | Dedicated core pinning, SMT/Hyperthreading disabled, or TEEs |
| **Hypervisor Memory Bus Snooping** | Cloud provider or malicious hypervisor operator memory access | **LOW** | Tmpfs in-memory secrets, ephemeral keys | Confidential Computing (AMD SEV-SNP, Intel TDX, AWS Nitro Enclaves) |
| **Client Key Leakage** | Tenant leaks private signing key | **LOW** | Scoped, short-lived tokens (1 hour TTL) | WebAuthn hardware tokens / FIDO2 security keys |

---

## 2. Hardware-Backed Attestation Upgrade Roadmap

### Phase A: MicroVM Runtime Migration (Kata / Firecracker)
- Replace standard `runc` runtime with Kata Containers or AWS Firecracker microVMs.
- Each tenant container boots with its own minimal Linux guest kernel, guaranteeing hardware-assisted virtualization boundaries (`VT-x` / `AMD-V`).

### Phase B: Confidential Computing & Remote Attestation
- Run the Policy Gateway and Model Sandbox inside an AMD SEV-SNP (Secure Encrypted Virtualization) or Intel TDX enclave.
- Hardware-rooted remote attestation certificates (signed by AMD/Intel root CAs) prove to third-party auditors that memory was encrypted and unmodifiable by the host hypervisor.

### Phase C: Hardware Security Module (HSM) Ledger Anchoring
- Move the platform Ed25519 signing key into an external FIPS 140-2 Level 3 Hardware Security Module (e.g. AWS CloudHSM or YubiHSM).
- Merkle root checkpoints are periodically notarized to a public blockchain or RFC 6962 Certificate Transparency style append-only witness log.

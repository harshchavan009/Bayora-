# Bayora Known Limitations & Simulation Disclosures

In accordance with Bayora's quality standard, this document explicitly details what is cryptographically and architecturally enforced versus what is simulated in the current proof-of-concept.

## 1. What is Enforced (Production-Grade Code)
- **Append-Only Hash Chain**: Every block is cryptographically linked using deterministic SHA-256 and signed with Ed25519 asymmetric keys. Modifying historical blocks produces detectable signature and link failures.
- **Binary Merkle Tree & Inclusion Proofs**: Correct pairwise parent hashing and audit proofs verifying leaf inclusion up to the root.
- **Sealed Commit Scheme**: Payloads committed as `SHA256(payload || nonce)` must match upon revelation. Tampered reveals are flagged and rejected.
- **ABAC & Capability Tokens**: Scoped capability tokens with HMAC-SHA256 signatures gating access to raw payloads, defense rules, and model endpoints.
- **Timing Side-Channel Padding**: Gateway delays responses to discrete quantum bucket multiples (e.g. 200ms) with uniform random jitter.
- **Synthetic Canary Scanning**: Real-time context scanning detecting cross-tenant or cross-session token presence.
- **Network Segmentation Topology**: Docker Compose definition isolating `bayora-red-net`, `bayora-blue-net`, and `bayora-model-net`.

---

## 2. What is Simulated in the PoC Backend
- **Client LLM Model Engine**: In default lightweight PoC mode, the model engine simulates frontier LLM generation using a rule-based inference emulator (`mock_engine.py`) to run instantaneously on standard laptops and cloud VMs without requiring an 80GB Nvidia H100 GPU. The engine is swappable with local Ollama (`ollama run llama3`) or vLLM endpoints via standard OpenAI-compatible REST schemas.
- **Physical Hardware Enclaves**: The current PoC relies on Linux container namespaces, seccomp filters, and cgroups rather than hardware-rooted AMD SEV-SNP / Intel TDX enclaves.
- **KV-Cache Memory Zeroing**: The PoC simulates virtual KV-cache memory allocation and generates SHA-256 eviction receipts. In a full vLLM deployment, this hooks directly into CUDA block allocator zeroing (`cudaMemset`).

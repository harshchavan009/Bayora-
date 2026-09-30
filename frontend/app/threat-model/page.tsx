"use client";

import React from "react";
import { Shield, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, Lock, Cpu, Server, Info } from "lucide-react";

export default function ThreatModelPage() {
  const strideCategories = [
    {
      stride: "Spoofing",
      threat: "Adversary impersonates Red or Blue tenant, or forges evaluation findings.",
      mitigation: "Capability-based HMAC-SHA256 scoped tokens with short TTLs and Ed25519 signed event blocks.",
      residual: "Mitigated",
      statusVariant: "mitigated",
      assumption: "HMAC secret and Ed25519 private key securely stored in vault; clock skew bounded within 60s.",
      isSimulated: false,
    },
    {
      stride: "Tampering",
      threat: "Malicious participant alters historical audit records or swaps payload post-test.",
      mitigation: "SHA-256 hash chaining, Merkle tree root checkpoints, and sealed commit H = SHA256(P || N).",
      residual: "Mitigated",
      statusVariant: "mitigated",
      assumption: "Append-only storage holds; external observers retain verified Merkle root checkpoints.",
      isSimulated: false,
    },
    {
      stride: "Repudiation",
      threat: "Red or Blue denies participating in a failed safety benchmark or toxic prompt generation.",
      mitigation: "Non-repudiable append-only ledger with third-party standalone verification CLI.",
      residual: "Mitigated",
      statusVariant: "mitigated",
      assumption: "Tenant public keys registered prior to engagement start; signature nonces unique.",
      isSimulated: false,
    },
    {
      stride: "Information Disclosure",
      threat: "Blue learns Red payloads prematurely; Red infers Blue defense rules; timing leaks filter depth.",
      mitigation: "Sealed-commit scheme, ABAC role-based redactions, KV-cache partition flushes, constant-time bucket delay padding.",
      residual: "Reduced",
      statusVariant: "reduced",
      assumption: "Enforced at gateway proxy layer; assumes container network separation prevents direct socket sniffing.",
      isSimulated: false,
    },
    {
      stride: "Denial of Service",
      threat: "One tenant starves the other through concurrent request flooding or memory exhaustion.",
      mitigation: "Per-tenant token-bucket fair queueing and Docker cgroup memory/CPU limits.",
      residual: "Reduced",
      statusVariant: "reduced",
      assumption: "Linux cgroups v2 configured with strict hard limits (2GB RAM, 2.0 CPUs per container).",
      isSimulated: false,
    },
    {
      stride: "Elevation of Privilege",
      threat: "Container escape into host VM or lateral network traversal across Docker bridges.",
      mitigation: "Rootless UID 10001 execution, read-only rootfs, cap_drop ALL, custom seccomp filter, isolated bridge networks.",
      residual: "Reduced",
      statusVariant: "reduced",
      assumption: "Standard Linux kernel isolation; assumes no unpatched 0-day host kernel container escape vulnerabilities.",
      isSimulated: false,
    },
    {
      stride: "Hardware Side Channels",
      threat: "Microarchitectural CPU/GPU cache snooping across co-located containers (Spectre/Meltdown).",
      mitigation: "Out of scope for software container boundary. Requires hardware-isolated microVMs (Firecracker) or dedicated hosts.",
      residual: "Not Mitigated",
      statusVariant: "not_mitigated",
      assumption: "Containers share physical host cores and L3 cache lines without hardware memory encryption.",
      isSimulated: false,
    },
  ];

  const residualRisks = [
    {
      threat: "Shared Host Kernel Boundary Vulnerabilities",
      rating: "Reduced (Defense-in-depth)",
      assumption: "Relies on Linux kernel namespaces, cgroups, and seccomp filters. Does not provide hypervisor boundary.",
      futureUpgrade: "Upgrade to gVisor (runsc) or Kata Containers (Firecracker microVMs) for hardware-enforced virtualization.",
    },
    {
      threat: "Physical Microarchitectural Cache Snooping",
      rating: "Not Mitigated (Software Container Scope)",
      assumption: "Containers execute concurrently on shared physical CPU cores with shared cache hierarchy.",
      futureUpgrade: "Core pinning with hyperthreading disabled, or deployment inside AMD SEV-SNP / Intel TDX Confidential VMs.",
    },
    {
      threat: "Compromised Host Operator Root Access",
      rating: "Reduced (External Attestation)",
      assumption: "Host administrator with root access can inspect process memory before eviction.",
      futureUpgrade: "Hardware Security Module (HSM) or cloud KMS-backed sealed attestation with remote cryptographic verification.",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Threat Model, Calibrated Guarantees & Assumptions
          </h1>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
            STRIDE Taxonomy
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Calibrated analysis of security boundaries, stated operational assumptions, and explicit non-guarantees.
        </p>
      </div>

      {/* What is Protected vs NOT Protected */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Protected */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Boundaries Mitigated by Bayora Architecture</span>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-foreground font-medium">•</span>
              <span>
                <strong className="text-foreground">Pre-Conclusion Payloads:</strong> Red adversarial payloads cannot be observed by Blue defenders before test run conclusion. (Enforced via sealed-hash commit).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground font-medium">•</span>
              <span>
                <strong className="text-foreground">Defense Logic Opacity:</strong> Red team cannot inspect Blue classifier heuristics, weights, or regex strings. (Enforced via RBAC/ABAC gateway rules).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground font-medium">•</span>
              <span>
                <strong className="text-foreground">Lateral Network Traversal:</strong> Direct packet routing between Red and Blue subnets is blocked. (Enforced via Docker bridge iptables rules).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground font-medium">•</span>
              <span>
                <strong className="text-foreground">Timing Side-Channel Suppression:</strong> Quantum bucket delay padding reduces timing variance that could leak filter execution depth.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-foreground font-medium">•</span>
              <span>
                <strong className="text-foreground">Audit Non-Repudiation:</strong> Historical evaluation logs cannot be altered without invalidating SHA-256 hash chains and Ed25519 signatures.
              </span>
            </li>
          </ul>
        </div>

        {/* NOT Protected */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <XCircle className="h-4 w-4 text-rose-500" />
            <span>Explicit Non-Guarantees (Outside Threat Boundary)</span>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-medium">•</span>
              <span>
                <strong className="text-foreground">Shared Linux Kernel 0-Days:</strong> Container primitives (namespaces, cgroups) share the host kernel. An unpatched kernel vulnerability could allow container escapes.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-medium">•</span>
              <span>
                <strong className="text-foreground">Microarchitectural CPU Attacks:</strong> Shared CPU L3 caches and speculative execution paths (Spectre) are not isolated by software containers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-medium">•</span>
              <span>
                <strong className="text-foreground">Compromised Tenant Private Keys:</strong> If a Red team operator leaks their signing key, an adversary can forge commitments before submission.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-medium">•</span>
              <span>
                <strong className="text-foreground">Physical Hardware Tampering:</strong> Physical memory snooping, bus probing, or cold-boot attacks require hardware confidential computing (SEV-SNP/TDX).
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* STRIDE Classification Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              STRIDE Threat Classification & Assumption Matrix
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Standard STRIDE taxonomy mapped to calibrated residual risk ratings and explicit assumptions.
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground">Calibrated Ratings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-secondary/40 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="py-2.5 px-4 font-normal">STRIDE Category</th>
                <th className="py-2.5 px-4 font-normal">Threat Scenario</th>
                <th className="py-2.5 px-4 font-normal">Bayora Architectural Control</th>
                <th className="py-2.5 px-4 font-normal">Stated Assumption</th>
                <th className="py-2.5 px-4 font-normal text-right">Calibrated Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {strideCategories.map((s, idx) => (
                <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">
                    {s.stride}
                  </td>
                  <td className="py-3 px-4 max-w-xs text-muted-foreground text-[11px]">
                    {s.threat}
                  </td>
                  <td className="py-3 px-4 max-w-sm text-foreground/90 text-[11px]">
                    {s.mitigation}
                  </td>
                  <td className="py-3 px-4 max-w-xs text-muted-foreground text-[11px]">
                    {s.assumption}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                        s.statusVariant === "mitigated"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : s.statusVariant === "reduced"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {s.residual}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Residual Risk & Future Hardware Attestation Roadmap */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            Residual Risks & Recommended Hardware Upgrades
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Where higher assurance than Linux container isolation is required, these paths elevate security guarantees.
          </p>
        </div>

        <div className="space-y-3">
          {residualRisks.map((r, i) => (
            <div key={i} className="p-3.5 rounded-md border border-border bg-secondary/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{r.threat}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {r.rating}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                <strong className="text-foreground">Current Operating Assumption:</strong> {r.assumption}
              </div>
              <div className="text-[11px] text-foreground/90 bg-background/50 p-2 rounded border border-border flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span><strong className="text-foreground">Upgrade Path:</strong> {r.futureUpgrade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

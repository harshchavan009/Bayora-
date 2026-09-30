"use client";

import React, { useState } from "react";
import { 
  Shield, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, 
  Lock, Cpu, Server, Info, FileText, Check, ChevronRight, Download,
  Layers, Terminal, HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function SecurityPosturePage() {
  const [activeSection, setActiveSection] = useState("scope");

  const sections = [
    { id: "scope", title: "1. Scope & Execution Boundary" },
    { id: "protections", title: "2. Cryptographic & Network Protections" },
    { id: "non-guarantees", title: "3. Explicit Non-Guarantees" },
    { id: "stride", title: "4. STRIDE Threat Matrix" },
    { id: "residual", title: "5. Residual Risk & MicroVM Roadmap" },
  ];

  const strideCategories = [
    {
      stride: "Spoofing",
      threat: "Adversary impersonates Red or Blue tenant, or forges evaluation findings.",
      mitigation: "HMAC-SHA256 scoped capability tokens with short TTLs and Ed25519 digital signatures on all event blocks.",
      residual: "Mitigated",
      badgeText: "Enforced",
      badgeVariant: "success" as const,
      assumption: "Cluster private key securely vaulted; clock skew bounded within 60s.",
    },
    {
      stride: "Tampering",
      threat: "Malicious participant alters historical audit records or swaps payload post-test.",
      mitigation: "SHA-256 hash chaining, Merkle tree root checkpoints, and sealed commitment hash H = SHA256(P || Nonce).",
      residual: "Mitigated",
      badgeText: "Enforced",
      badgeVariant: "success" as const,
      assumption: "Append-only storage holds; external observers retain verified Merkle root checkpoints.",
    },
    {
      stride: "Repudiation",
      threat: "Participant denies initiating an evaluation run or generating a toxic payload.",
      mitigation: "Non-repudiable append-only ledger with standalone verification CLI and public-key attribution.",
      residual: "Mitigated",
      badgeText: "Enforced",
      badgeVariant: "success" as const,
      assumption: "Tenant credentials registered prior to engagement start; signature nonces unique.",
    },
    {
      stride: "Information Disclosure",
      threat: "Blue learns Red payloads prematurely; Red infers Blue defense rules; timing leaks filter depth.",
      mitigation: "Sealed-commit scheme, ABAC role-based redactions, memory partition flushes, constant 200ms delay padding.",
      residual: "Reduced",
      badgeText: "Enforced",
      badgeVariant: "info" as const,
      assumption: "Enforced at gateway proxy layer; assumes container network separation prevents direct socket sniffing.",
    },
    {
      stride: "Denial of Service",
      threat: "One tenant starves the other through concurrent request flooding or memory exhaustion.",
      mitigation: "Per-tenant token-bucket fair queueing and Docker cgroup memory/CPU limits.",
      residual: "Reduced",
      badgeText: "Enforced",
      badgeVariant: "info" as const,
      assumption: "Linux cgroups v2 configured with strict hard limits (2GB RAM, 2.0 CPUs per container).",
    },
    {
      stride: "Elevation of Privilege",
      threat: "Container escape into host VM or lateral network traversal across Docker bridges.",
      mitigation: "Rootless UID 10001 execution, read-only rootfs, cap_drop ALL, custom seccomp filter, isolated bridge networks.",
      residual: "Reduced",
      badgeText: "Enforced",
      badgeVariant: "warning" as const,
      assumption: "Standard Linux kernel isolation; assumes no unpatched 0-day host kernel container escape vulnerabilities.",
    },
    {
      stride: "Hardware Side Channels",
      threat: "Microarchitectural CPU/GPU cache snooping across co-located containers (Spectre/Meltdown).",
      mitigation: "Out of scope for software container boundary. Requires hardware-isolated microVMs (Firecracker) or dedicated hosts.",
      residual: "Not mitigated",
      badgeText: "Simulated",
      badgeVariant: "neutral" as const,
      assumption: "Containers share physical host cores and L3 cache lines without hardware memory encryption.",
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumbs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Security posture
          </h1>
          <p className="text-sm text-muted mt-1">
            Formal architectural threat model, STRIDE risk analysis, cryptographic boundaries, and explicit non-guarantees.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-1.5" />
          Download PDF threat model
        </Button>
      </div>

      {/* Main Document Layout: Sticky TOC + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sticky Table of Contents (Left 1 Col) */}
        <div className="lg:col-span-1 sticky top-20 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-4 space-y-3">
          <div className="text-xs font-semibold text-foreground border-b border-border pb-2">
            Table of contents
          </div>
          <nav className="space-y-1 text-xs">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`block px-2.5 py-1.5 rounded-md transition-colors ${
                  activeSection === sec.id
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface-2"
                }`}
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Document Content (Right 3 Cols) */}
        <div className="lg:col-span-3 space-y-8 text-xs leading-relaxed text-muted">
          {/* Section 1: Scope */}
          <section id="scope" className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-6 space-y-4 scroll-mt-20">
            <h2 className="text-base font-semibold text-foreground">1. Scope & Execution Boundary</h2>
            <p>
              Bayora provides a multi-tenant sandboxed validation loop where three distinct software actors operate in concert without mutual state contamination:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded border border-border bg-surface-2/60 space-y-1">
                <span className="font-semibold text-foreground block">Red Team Namespace</span>
                <span>Isolated container generating adversarial vectors and jailbreak sequences. No direct socket route to model container.</span>
              </div>
              <div className="p-3 rounded border border-border bg-surface-2/60 space-y-1">
                <span className="font-semibold text-foreground block">Blue Team Namespace</span>
                <span>Defensive filter rules and prompt classifiers. Zero preview access to adversarial payloads before run conclusion.</span>
              </div>
              <div className="p-3 rounded border border-border bg-surface-2/60 space-y-1">
                <span className="font-semibold text-foreground block">Model Target Namespace</span>
                <span>Inference engine running in a dedicated non-egress subnet. Ingress strictly mediated by policy gateway.</span>
              </div>
            </div>
          </section>

          {/* Section 2: Protections */}
          <section id="protections" className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-6 space-y-4 scroll-mt-20">
            <h2 className="text-base font-semibold text-foreground">2. Cryptographic & Network Protections</h2>
            <div className="space-y-3">
              <div className="p-3.5 rounded border border-border bg-surface-2/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">SHA-256 Sealed Commitment Protocol</span>
                  <Badge variant="success">Enforced</Badge>
                </div>
                <p>
                  Before an evaluation commences, the red team publishes a cryptographic commitment hash H = SHA256(Payload || Nonce). This mathematically binds the operator to their exact input without disclosing plaintext to defensive engineers.
                </p>
              </div>

              <div className="p-3.5 rounded border border-border bg-surface-2/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Timing Quantization Delay Padding</span>
                  <Badge variant="success">Enforced</Badge>
                </div>
                <p>
                  Model completions and defense filter responses are normalized to fixed 200ms execution buckets with uniform jitter, preventing side-channel leakage of defensive classifier depth.
                </p>
              </div>

              <div className="p-3.5 rounded border border-border bg-surface-2/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Ed25519 Provenance Ledger & Merkle Trees</span>
                  <Badge variant="success">Enforced</Badge>
                </div>
                <p>
                  Every lifecycle event is appended to an immutable SHA-256 hash chain signed with an Ed25519 cluster key, allowing independent offline re-verification by regulators.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Non-Guarantees */}
          <section id="non-guarantees" className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-6 space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">3. Explicit Non-Guarantees</h2>
              <Badge variant="warning">Transparent disclosures</Badge>
            </div>
            <p>
              Security assurance requires clarity regarding what software containers cannot guarantee:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-foreground">Shared CPU/GPU microarchitectural cache isolation:</strong> Co-located Linux containers sharing physical CPU cores cannot protect against Spectre, Meltdown, or GPU memory bus side channels without dedicated microVM hypervisors (Firecracker) or dedicated physical hardware.
              </li>
              <li>
                <strong className="text-foreground">Model weight tampering:</strong> Bayora validates safety prompts and egress completions; it does not verify neural network weight hashes unless deployed in an air-gapped enclave.
              </li>
            </ul>
          </section>

          {/* Section 4: STRIDE Threat Matrix */}
          <section id="stride" className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-6 space-y-4 scroll-mt-20">
            <div>
              <h2 className="text-base font-semibold text-foreground">4. STRIDE Threat Matrix</h2>
              <p className="text-muted mt-0.5">Comprehensive evaluation of threats against platform subsystems.</p>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                  <tr>
                    <th className="py-3 px-4">Threat category</th>
                    <th className="py-3 px-4">Description & Potential impact</th>
                    <th className="py-3 px-4">Architectural mitigation</th>
                    <th className="py-3 px-4">Enforcement status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {strideCategories.map((row) => (
                    <tr key={row.stride} className="hover:bg-surface-2/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground">{row.stride}</td>
                      <td className="py-3.5 px-4 text-muted">{row.threat}</td>
                      <td className="py-3.5 px-4 text-foreground">{row.mitigation}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={row.badgeVariant}>{row.badgeText}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Residual Risk */}
          <section id="residual" className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-6 space-y-4 scroll-mt-20">
            <h2 className="text-base font-semibold text-foreground">5. Residual Risk & MicroVM Roadmap</h2>
            <p>
              To eliminate shared-kernel host risks for high-assurance defense contracts, Bayora's roadmap introduces hardware-isolated microVMs:
            </p>
            <div className="p-3.5 rounded border border-border bg-surface-2/60 space-y-2">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span>Phase 2: AWS Firecracker / KVM Hypervisor Sandboxing</span>
                <Badge variant="accent">In development</Badge>
              </div>
              <p>
                Each adversarial evaluation run will instantiate a lightweight virtual machine with an independent Linux kernel, dedicated memory ballooning, and hardware memory encryption (AMD SEV-SNP).
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

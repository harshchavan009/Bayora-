"use client";

import React, { useState } from "react";
import { 
  Shield, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, 
  Lock, Cpu, Server, Info, FileText, Check, ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function SecurityPosturePage() {
  const [activeSection, setActiveSection] = useState("scope");

  const sections = [
    { id: "scope", title: "1. Scope & Execution Boundary" },
    { id: "protections", title: "2. Cryptographic & Network Protections" },
    { id: "non-guarantees", title: "3. Explicit Non-Guarantees" },
    { id: "stride", title: "4. STRIDE Threat Model" },
    { id: "residual", title: "5. Residual Risk & Hardware Roadmap" },
  ];

  const strideCategories = [
    {
      stride: "Spoofing",
      threat: "Adversary impersonates Red or Blue tenant, or forges evaluation findings.",
      mitigation: "HMAC-SHA256 scoped capability tokens with short TTLs and Ed25519 digital signatures on all event blocks.",
      residual: "Mitigated",
      variant: "success",
      badge: "ENFORCED",
      assumption: "Cluster private key securely vaulted; clock skew bounded within 60s.",
    },
    {
      stride: "Tampering",
      threat: "Malicious participant alters historical audit records or swaps payload post-test.",
      mitigation: "SHA-256 hash chaining, Merkle tree root checkpoints, and sealed commitment hash H = SHA256(P || Nonce).",
      residual: "Mitigated",
      variant: "success",
      badge: "ENFORCED",
      assumption: "Append-only storage holds; external observers retain verified Merkle root checkpoints.",
    },
    {
      stride: "Repudiation",
      threat: "Participant denies initiating an evaluation run or generating a toxic payload.",
      mitigation: "Non-repudiable append-only ledger with standalone verification CLI and public-key attribution.",
      residual: "Mitigated",
      variant: "success",
      badge: "ENFORCED",
      assumption: "Tenant credentials registered prior to engagement start; signature nonces unique.",
    },
    {
      stride: "Information Disclosure",
      threat: "Blue learns Red payloads prematurely; Red infers Blue defense rules; timing leaks filter depth.",
      mitigation: "Sealed-commit scheme, ABAC role-based redactions, memory partition flushes, constant 200ms delay padding.",
      residual: "Reduced",
      variant: "info",
      badge: "ENFORCED",
      assumption: "Enforced at gateway proxy layer; assumes container network separation prevents direct socket sniffing.",
    },
    {
      stride: "Denial of Service",
      threat: "One tenant starves the other through concurrent request flooding or memory exhaustion.",
      mitigation: "Per-tenant token-bucket fair queueing and Docker cgroup memory/CPU limits.",
      residual: "Reduced",
      variant: "info",
      badge: "ENFORCED",
      assumption: "Linux cgroups v2 configured with strict hard limits (2GB RAM, 2.0 CPUs per container).",
    },
    {
      stride: "Elevation of Privilege",
      threat: "Container escape into host VM or lateral network traversal across Docker bridges.",
      mitigation: "Rootless UID 10001 execution, read-only rootfs, cap_drop ALL, custom seccomp filter, isolated bridge networks.",
      residual: "Reduced",
      variant: "warning",
      badge: "ENFORCED",
      assumption: "Standard Linux kernel isolation; assumes no unpatched 0-day host kernel container escape vulnerabilities.",
    },
    {
      stride: "Hardware Side Channels",
      threat: "Microarchitectural CPU/GPU cache snooping across co-located containers (Spectre/Meltdown).",
      mitigation: "Out of scope for software container boundary. Requires hardware-isolated microVMs (Firecracker) or dedicated hosts.",
      residual: "Not Mitigated",
      variant: "danger",
      badge: "UNENFORCED / OUT OF SCOPE",
      assumption: "Containers share physical host cores and L3 cache lines without hardware memory encryption.",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Security & Isolation</span>
            <span className="text-border">/</span>
            <span className="text-xs text-foreground font-medium">Security Posture</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Security Posture & Threat Model
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Calibrated technical guarantees, cryptographic assumptions, and residual risk boundaries.
          </p>
        </div>

        <Badge variant="neutral">Version 2.4 • Current Production Spec</Badge>
      </div>

      {/* Document Layout: Left Sticky TOC + Right Readable Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Col: Table of Contents */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-lg border border-border bg-surface-1 p-4 space-y-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
              Table of Contents
            </span>
            <nav className="space-y-1 text-xs">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`block py-1.5 px-2 rounded transition-colors ${
                    activeSection === s.id
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Right 3 Cols: Content Sections */}
        <div className="lg:col-span-3 space-y-8 text-xs text-muted leading-relaxed">
          {/* Section 1: Scope */}
          <section id="scope" className="rounded-lg border border-border bg-surface-1 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent" />
                1. Scope & Execution Boundary
              </h2>
              <Badge variant="success">PRODUCTION ENFORCED</Badge>
            </div>

            <p>
              Bayora provides a mediated evaluation sandbox for adversarial safety validation of Large Language Models.
              The primary security objective is to allow adversarial testing without exposing intellectual property,
              unreleased payloads, or defensive rules between the participating entities:
            </p>

            <ul className="space-y-2 pl-4 list-disc text-foreground">
              <li>
                <strong>Red Team:</strong> Submits adversarial jailbreak sequences, prompt injections, and boundary exfiltration probes.
              </li>
              <li>
                <strong>Blue Team:</strong> Deploys defensive filtering rules, heuristic sanitizers, and classifier guardrails.
              </li>
              <li>
                <strong>Client LLM:</strong> The model under test, executing isolated inference inside an air-gapped network container.
              </li>
            </ul>

            <div className="p-3.5 rounded-lg bg-surface-2 border border-border text-[11px]">
              <strong className="text-foreground block mb-1">Key Invariant:</strong>
              Neither the Red Team nor the Blue Team possesses direct network connectivity to the Client LLM or to each other.
              All communications pass through the Policy Mediation Gateway.
            </div>
          </section>

          {/* Section 2: Protections */}
          <section id="protections" className="rounded-lg border border-border bg-surface-1 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-accent" />
                2. Cryptographic & Network Protections
              </h2>
              <Badge variant="success">ENFORCED</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-border bg-surface-2 space-y-1.5">
                <span className="font-semibold text-foreground block">Payload Commitment Sealing</span>
                <p>
                  Payloads are hashed with SHA-256 upon submission. Plaintext is withheld from defense operators until
                  the run lifecycle transitions to CONCLUDED.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-surface-2 space-y-1.5">
                <span className="font-semibold text-foreground block">Response Timing Normalization</span>
                <p>
                  Model inference outputs are padded into 200ms quantized buckets to eliminate side-channel latency
                  differential attacks.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-surface-2 space-y-1.5">
                <span className="font-semibold text-foreground block">Network Bridge Isolation</span>
                <p>
                  Target containers run on dedicated virtual bridges with default-deny iptables rules, blocking external
                  egress to public IP ranges.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-surface-2 space-y-1.5">
                <span className="font-semibold text-foreground block">Ed25519 Signed Audit Log</span>
                <p>
                  Every state transition generates a signed block anchored to a Merkle tree root, guaranteeing non-repudiation
                  and verifiable provenance.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Non-Guarantees */}
          <section id="non-guarantees" className="rounded-lg border border-border bg-surface-1 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                3. Explicit Non-Guarantees (Honest Technical Claims)
              </h2>
              <Badge variant="warning">TRANSPARENT BOUNDARIES</Badge>
            </div>

            <p>
              Security assurance requires strict calibration regarding what is protected versus what is outside the
              software sandbox's threat model:
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-border bg-surface-2 space-y-1">
                <span className="font-semibold text-foreground block">No Protection Against Physical Host Microarchitectural Leaks:</span>
                <p>
                  When multi-tenant containers share physical host CPU or GPU cores, cache-timing side-channels
                  (e.g., Spectre, Meltdown, or GPU warp contention) cannot be mitigated in software.
                  Mitigation requires dedicated hardware or microVMs (Firecracker).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-2 space-y-1">
                <span className="font-semibold text-foreground block">No Mathematical Defense Against Semantic Inversion:</span>
                <p>
                  If an LLM has already learned toxic or confidential data during pre-training, adversarial prompting
                  can still induce subtle leakage through novel token rephrasing not covered by heuristic regexes.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: STRIDE Matrix */}
          <section id="stride" className="rounded-lg border border-border bg-surface-1 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Server className="h-4 w-4 text-accent" />
                4. STRIDE Threat Analysis Matrix
              </h2>
              <Badge variant="neutral">7 THREAT VECTORS</Badge>
            </div>

            <div className="space-y-3">
              {strideCategories.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-border bg-surface-2 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-semibold text-foreground text-xs">
                      {s.stride}: {s.threat}
                    </span>
                    <Badge variant={s.variant as any}>{s.badge}</Badge>
                  </div>
                  <p className="text-[11px] text-muted">
                    <strong className="text-foreground">Mitigation: </strong>{s.mitigation}
                  </p>
                  <p className="text-[10px] text-muted font-mono">
                    Assumption: {s.assumption}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Residual Risk */}
          <section id="residual" className="rounded-lg border border-border bg-surface-1 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4 text-accent" />
                5. Residual Risk & Hardware Roadmap
              </h2>
              <Badge variant="info">ROADMAP</Badge>
            </div>

            <p>
              To upgrade beyond software container boundaries into confidential computing standards:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-border bg-surface-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">Kata Containers / Firecracker MicroVMs</span>
                  <span className="text-[11px] text-muted">Hardware virtualization boundary per tenant evaluation session.</span>
                </div>
                <Badge variant="neutral">Q4 2026</Badge>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">AMD SEV-SNP / Intel TDX Hardware Attestation</span>
                  <span className="text-[11px] text-muted">Encrypted memory hypervisor protection against root host snooping.</span>
                </div>
                <Badge variant="neutral">Q1 2027</Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

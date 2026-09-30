"use client";

import React from "react";
import { Shield, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, Lock, Cpu, Server } from "lucide-react";

export default function ThreatModelPage() {
  const strideCategories = [
    {
      stride: "Spoofing",
      threat: "Adversary impersonates Red or Blue tenant, or forges evaluation findings.",
      mitigation: "Capability-based HMAC-SHA256 scoped tokens with short TTLs and Ed25519 signed event blocks.",
      residual: "LOW",
    },
    {
      stride: "Tampering",
      threat: "Malicious participant alters historical audit records or swaps payload post-test.",
      mitigation: "Cryptographic SHA-256 hash chaining, Merkle tree root checkpoints, and sealed commit H = SHA256(P || N).",
      residual: "NEGLIGIBLE",
    },
    {
      stride: "Repudiation",
      threat: "Red or Blue denies participating in a failed safety benchmark or toxic prompt generation.",
      mitigation: "Non-repudiable append-only ledger with third-party independent verification CLI / web verifier.",
      residual: "NEGLIGIBLE",
    },
    {
      stride: "Information Disclosure",
      threat: "Blue learns Red payloads prematurely; Red infers Blue defense rules; timing side-channel leaks filter depth.",
      mitigation: "Sealed-commit scheme, ABAC role-based redactions, KV-cache partition flushes, constant-time bucket delay padding.",
      residual: "LOW",
    },
    {
      stride: "Denial of Service",
      threat: "One tenant starves the other through concurrent request flooding or memory exhaustion.",
      mitigation: "Per-tenant token-bucket fair queueing and Docker cgroup memory/CPU limits.",
      residual: "LOW",
    },
    {
      stride: "Elevation of Privilege",
      threat: "Container escape into host VM or lateral network traversal across Docker bridges.",
      mitigation: "Rootless UID 10001 execution, read-only rootfs, cap_drop ALL, custom Seccomp filter, isolated bridge networks.",
      residual: "MEDIUM (Standard kernel)",
    },
  ];

  const residualRisks = [
    {
      threat: "Shared Host Kernel Compromise (0-day Linux kernel vulnerability)",
      rating: "MEDIUM",
      assumption: "Relies on Linux kernel namespaces, cgroups, and seccomp filters.",
      futureUpgrade: "Upgrade to gVisor (runsc) or Kata Containers (lightweight microVMs) for hardware-enforced virtualization boundaries.",
    },
    {
      threat: "Microarchitectural CPU Side-Channels (Spectre, L1 Terminal Fault)",
      rating: "LOW - MEDIUM",
      assumption: "Shared physical CPU cores between simultaneous tenant sandboxes.",
      futureUpgrade: "CPU pinning to dedicated core pairs or deployment inside AMD SEV-SNP / Intel TDX Confidential VMs.",
    },
    {
      threat: "Compromised Platform Admin / Operator Memory Dump",
      rating: "LOW",
      assumption: "System administrator has root access to the hosting VM.",
      futureUpgrade: "Hardware Security Module (HSM) or cloud KMS-backed sealed attestation with remote cryptographic verification.",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-cyan-400" />
          Threat Model, Guarantees & Residual Risk Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rigorous security boundaries, STRIDE classification, failure assumptions, and future hardware attestation upgrade paths.
        </p>
      </div>

      {/* What is Protected vs NOT Protected */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Protected */}
        <div className="rounded-xl cyber-panel p-6 border border-emerald-900/40 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm uppercase">
            <CheckCircle2 className="h-5 w-5" /> What Bayora Protects
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold font-mono">•</span>
              <span><strong>Zero Early Redaction Leakage:</strong> Red-team payloads cannot be observed by Blue defenders before test conclusion.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold font-mono">•</span>
              <span><strong>Defense Opacity:</strong> Red-team tooling cannot infer Blue heuristic classifiers, regex rules, or model weights.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold font-mono">•</span>
              <span><strong>Lateral Network Isolation:</strong> Direct network traversal between Red and Blue is strictly blocked by isolated Docker bridge subnets.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold font-mono">•</span>
              <span><strong>Timing Side-Channel Suppression:</strong> Quantum bucket delay padding prevents probing defensive execution depth via millisecond latency differences.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold font-mono">•</span>
              <span><strong>Cryptographic Tamper-Evidence:</strong> Historical audit logs and test findings cannot be modified without invalidating SHA-256 hash chains.</span>
            </li>
          </ul>
        </div>

        {/* NOT Protected */}
        <div className="rounded-xl cyber-panel p-6 border border-rose-900/40 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold font-mono text-sm uppercase">
            <XCircle className="h-5 w-5" /> What Bayora Does NOT Protect (Failure Boundaries)
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold font-mono">•</span>
              <span><strong>Host Kernel 0-Day Compromise:</strong> A kernel-level privilege escalation bug in the host OS could bypass standard container isolation (upgrade to Kata/gVisor required).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold font-mono">•</span>
              <span><strong>Physical CPU Bus Snooping:</strong> Without hardware-based confidential computing (SEV/TDX), physical hypervisor memory snooping is outside software container scope.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold font-mono">•</span>
              <span><strong>Red-Team Compromised Signing Keys:</strong> If Red leaks their private key, an adversary can sign fraudulent commitments prior to submission.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold font-mono">•</span>
              <span><strong>Physical Hardware Side Channels:</strong> Power analysis or acoustic side channels on shared cloud silicon are not mitigated by container abstractions.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* STRIDE Classification Table */}
      <div className="rounded-xl cyber-panel border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white font-mono uppercase">
            STRIDE Threat Modeling Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Standard threat taxonomy mapped to Bayora architectural mitigations.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Threat Scenario</th>
                <th className="py-3 px-4">Bayora Mitigation</th>
                <th className="py-3 px-4">Residual Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {strideCategories.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-900/30">
                  <td className="py-3 px-4 font-bold text-cyan-400">{s.stride}</td>
                  <td className="py-3 px-4 max-w-xs">{s.threat}</td>
                  <td className="py-3 px-4 max-w-sm text-slate-300">{s.mitigation}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] border border-slate-800">
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
      <div className="rounded-xl cyber-panel p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-400" />
          Residual Risks & Future Architectural Upgrades
        </h2>

        <div className="space-y-4">
          {residualRisks.map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{r.threat}</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] border border-amber-800 font-bold">
                  {r.rating}
                </span>
              </div>
              <div className="text-slate-400">
                <span className="text-slate-300">Current Assumption:</span> {r.assumption}
              </div>
              <div className="text-cyan-400 bg-cyan-950/20 p-2.5 rounded border border-cyan-900/40">
                <span className="font-bold">Upgrade Path:</span> {r.futureUpgrade}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

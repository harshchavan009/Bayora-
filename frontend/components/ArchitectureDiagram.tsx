"use client";

import React, { useState } from "react";
import { Shield, Lock, Server, Cpu, Database, AlertOctagon, CheckCircle2, ArrowRight } from "lucide-react";

export default function ArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState<string>("gateway");

  const nodeDetails: Record<string, { title: string; subtitle: string; guarantees: string[]; network: string; uid: string }> = {
    red: {
      title: "Red Team Adversarial Sandbox",
      subtitle: "Payload generation, mutation & sealed-commitment client",
      network: "bayora-red-net (Bridge / Isolated)",
      uid: "UID 10001:GID 10001 (Rootless, cap_drop: ALL)",
      guarantees: [
        "Cryptographically sealed commit H = SHA256(payload || nonce) at submission",
        "Zero direct network route to Blue Team sandbox or Model sandbox",
        "Egress firewall blocks arbitrary internet egress",
        "Defense heuristic rules and classifier weights are completely opaque to Red tooling"
      ]
    },
    blue: {
      title: "Blue Team Defense Sandbox",
      subtitle: "Active guardrails, classifiers & output sanitizers",
      network: "bayora-blue-net (Bridge / Isolated)",
      uid: "UID 10001:GID 10001 (Rootless, cap_drop: ALL)",
      guarantees: [
        "Zero early observability of Red adversarial payloads while run is active",
        "Defense logic executes inside isolated gateway sandbox hooks",
        "Zero direct network route to Red Team sandbox or Model sandbox",
        "Output telemetry logs hashes and metadata only (no payload leak)"
      ]
    },
    gateway: {
      title: "Policy-Enforcing Gateway",
      subtitle: "Sole authorized cross-tenant multi-homed bridge",
      network: "Multi-homed across red, blue, model, audit, control nets",
      uid: "UID 10001:GID 10001 (Read-only rootfs, tmpfs secrets)",
      guarantees: [
        "Enforces ABAC rules and validates short-lived capability tokens",
        "Fixed-rate / constant-time bucket padding (e.g. 200ms) to defeat timing side channels",
        "Token-bucket fair queueing prevents tenant DoS or noisy-neighbor interference",
        "Appends all events to Ed25519-signed append-only SHA-256 hash chain"
      ]
    },
    model: {
      title: "Model Under Test Sandbox",
      subtitle: "Clean isolated inference execution environment",
      network: "bayora-model-net (Bridge / Isolated)",
      uid: "UID 10001:GID 10001 (Read-only rootfs, cgroup bounded)",
      guarantees: [
        "Strictly partitioned per-session inference contexts",
        "Verifiable KV-cache eviction with cryptographic flush receipts",
        "Synthetic canary tokens injected and scanned to prevent cross-session memory bleed",
        "Zero persistent prompt cache shared across different tenant sessions"
      ]
    },
    audit: {
      title: "Cryptographic Provenance Store",
      subtitle: "Immutable append-only ledger & Merkle checkpointing",
      network: "bayora-audit-net (Internal)",
      uid: "UID 10001:GID 10001 (Internal access only)",
      guarantees: [
        "Append-only SHA-256 hash chaining (H_i = SHA256(H_{i-1} || block))",
        "Every block authenticated with system Ed25519 digital signature",
        "Periodic binary Merkle tree root checkpoints",
        "Enables third-party independent run re-verification with zero-trust proofs"
      ]
    }
  };

  const current = nodeDetails[selectedNode] || nodeDetails.gateway;

  return (
    <div className="w-full rounded-2xl cyber-panel p-6 border border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            Sandbox & Network Isolation Architecture
          </h3>
          <p className="text-xs text-slate-400">
            Click on any container or sandbox to inspect security invariants and network boundaries.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Allowed (Gateway mTLS)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span> Blocked (Air-Gapped)
          </span>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative py-4">
        {/* Left Column: Red Sandbox */}
        <div className="flex flex-col justify-center space-y-4">
          <div
            onClick={() => setSelectedNode("red")}
            className={`cursor-pointer rounded-xl p-4 transition-all border ${
              selectedNode === "red"
                ? "bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/50"
                : "bg-slate-900/60 border-slate-800 hover:border-rose-700/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-900/50 text-rose-300 border border-rose-700/40">
                TENANT A
              </span>
              <AlertOctagon className="h-4 w-4 text-rose-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Red Sandbox</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Adversarial prompts & sealed SHA-256 payload commitments
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
              bayora-red-net
            </div>
          </div>

          {/* Blocked Red <-> Blue indicator */}
          <div className="flex items-center justify-center p-2 rounded-lg bg-rose-950/20 border border-rose-900/40 text-[11px] font-mono text-rose-400 gap-2">
            <Lock className="h-3 w-3" />
            <span>BLOCKED: Direct Red ↔ Blue Path</span>
          </div>

          {/* Left Column: Blue Sandbox */}
          <div
            onClick={() => setSelectedNode("blue")}
            className={`cursor-pointer rounded-xl p-4 transition-all border ${
              selectedNode === "blue"
                ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50"
                : "bg-slate-900/60 border-slate-800 hover:border-cyan-700/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700/40">
                TENANT B
              </span>
              <Shield className="h-4 w-4 text-cyan-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Blue Sandbox</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Defensive filters, classifiers & heuristic rules
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              bayora-blue-net
            </div>
          </div>
        </div>

        {/* Center Column: Policy Gateway */}
        <div className="flex flex-col justify-center">
          <div
            onClick={() => setSelectedNode("gateway")}
            className={`cursor-pointer rounded-xl p-5 transition-all border relative ${
              selectedNode === "gateway"
                ? "bg-slate-900/90 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-500/40"
                : "bg-slate-900/60 border-slate-700 hover:border-cyan-600"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/40">
                SECURITY BARRIER
              </span>
              <Lock className="h-4 w-4 text-cyan-400 animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-white">Policy-Enforcing Gateway</h4>
            <p className="text-xs text-slate-400 mt-1">
              The sole multi-homed bridge enforcing ABAC policies, fair queueing & side-channel padding.
            </p>

            <div className="mt-4 space-y-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
                • ABAC Access Governance
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
                • Constant-Time Bucket Padding
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
                • Egress Canary Scanner
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-cyan-400 font-mono text-center">
              Active Bridge across all networks
            </div>
          </div>
        </div>

        {/* Right Column: Model Sandbox & Audit Store */}
        <div className="flex flex-col justify-center space-y-4">
          <div
            onClick={() => setSelectedNode("model")}
            className={`cursor-pointer rounded-xl p-4 transition-all border ${
              selectedNode === "model"
                ? "bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50"
                : "bg-slate-900/60 border-slate-800 hover:border-emerald-700/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700/40">
                TARGET UNDER TEST
              </span>
              <Cpu className="h-4 w-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Model Sandbox</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Isolated LLM context with verifiable KV-cache flushes
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              bayora-model-net (Egress: Default Deny)
            </div>
          </div>

          <div
            onClick={() => setSelectedNode("audit")}
            className={`cursor-pointer rounded-xl p-4 transition-all border ${
              selectedNode === "audit"
                ? "bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/50"
                : "bg-slate-900/60 border-slate-800 hover:border-purple-700/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/40">
                IMMUTABLE AUDIT
              </span>
              <Database className="h-4 w-4 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-white">Audit & Merkle Store</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Append-only SHA-256 hash chain with Ed25519 signatures
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
              bayora-audit-net
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details Panel */}
      <div className="mt-6 pt-5 border-t border-slate-800 bg-slate-950/50 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
              Selected Subsystem Details
            </span>
            <h4 className="text-base font-bold text-white">{current.title}</h4>
            <p className="text-xs text-slate-400">{current.subtitle}</p>
          </div>
          <div className="text-right">
            <span className="inline-block text-[11px] font-mono bg-slate-900 text-slate-300 px-2.5 py-1 rounded border border-slate-800">
              {current.uid}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          {current.guarantees.map((g, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

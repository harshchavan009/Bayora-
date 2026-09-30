"use client";

import Link from "next/link";
import { 
  Shield, Lock, Network, Cpu, Database, Eye, 
  CheckCircle2, ArrowRight, Activity, Terminal, 
  AlertTriangle, KeyRound, Server
} from "lucide-react";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";

export default function LandingPage() {
  const verticals = [
    {
      title: "1. Container & Sandbox Isolation",
      desc: "Rootless UID 10001 sandboxes, immutable read-only root filesystems, dropped capabilities, no-new-privileges, and custom seccomp profiles.",
      icon: Server,
      color: "text-cyan-400",
      border: "border-cyan-500/20"
    },
    {
      title: "2. Network Segmentation",
      desc: "Separate Docker bridge networks per tenant. Egress is default-deny; direct Red-to-Blue paths are air-gapped and strictly blocked.",
      icon: Network,
      color: "text-blue-400",
      border: "border-blue-500/20"
    },
    {
      title: "3. Access Control & Scoped ABAC",
      desc: "Short-lived capability-based tokens and fine-grained Attribute-Based Access Control enforcing zero early redaction leakage.",
      icon: Lock,
      color: "text-purple-400",
      border: "border-purple-500/20"
    },
    {
      title: "4. Cryptographic Provenance",
      desc: "Ed25519-signed append-only SHA-256 hash chains, sealed-commit reveal scheme, and periodic binary Merkle tree root checkpoints.",
      icon: Database,
      color: "text-emerald-400",
      border: "border-emerald-500/20"
    },
    {
      title: "5. Resource Fairness & Timing Defense",
      desc: "Per-tenant token-bucket fair queueing, quantum bucket delay padding (e.g. 200ms), and latency jitter to defeat side-channel inference.",
      icon: Activity,
      color: "text-amber-400",
      border: "border-amber-500/20"
    },
    {
      title: "6. LLM Threat Surface Isolation",
      desc: "Strictly isolated per-session inference contexts, verifiable KV-cache flushes with SHA-256 receipts, and synthetic canary egress scanning.",
      icon: Cpu,
      color: "text-rose-400",
      border: "border-rose-500/20"
    },
    {
      title: "7. Observability & Redacted Telemetry",
      desc: "Privacy-preserving monitoring logging hashes and metrics only (never raw payloads or defense regex rules), with real-time anomaly alerts.",
      icon: Eye,
      color: "text-indigo-400",
      border: "border-indigo-500/20"
    }
  ];

  const objectives = [
    {
      title: "Zero Early Redaction Leakage",
      desc: "Red-team payloads are committed as SHA-256 hashes at test start and remain completely unobservable to Blue teams until conclusion."
    },
    {
      title: "Defense Opacity",
      desc: "Blue-team heuristics, classifier weights, and filter thresholds cannot be inferred by Red tooling through side-channels or error messages."
    },
    {
      title: "Cross-Session Disjointness",
      desc: "The client LLM retains no residual memory, KV-cache pollution, or contaminated prompt states across tenant evaluation turns."
    },
    {
      title: "Independently Verifiable Findings",
      desc: "Auditors can verify an entire run offline via digital signatures and Merkle proofs without trusting the platform operator."
    }
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl cyber-panel p-8 sm:p-12 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-400">
            <Shield className="h-3.5 w-3.5" />
            SECURE ADVERSARIAL SANDBOX FOR FRONTIER LLMS
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Continuous AI Safety Validation with{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Zero-Trust Isolation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Bayora hosts simultaneous red-team adversarial attacks, blue-team defensive countermeasures, 
            and client LLMs in a single shared cloud sandbox — eliminating state leakage, timing side-channels, 
            and tenant contamination through cryptographic verification.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Activity className="h-4 w-4" />
              Open Live Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/audit"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700 transition-all"
            >
              <Database className="h-4 w-4 text-cyan-400" />
              Cryptographic Audit
            </Link>

            <Link
              href="/isolation"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-sm border border-slate-800 transition-all"
            >
              <Network className="h-4 w-4 text-emerald-400" />
              Isolation Matrix
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Topology Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Isolated Continuous Testing Loop
            </h2>
            <p className="text-sm text-slate-400">
              Red, Blue, and Model execute concurrently in strictly segmented networks mediated solely by the Policy Gateway.
            </p>
          </div>
        </div>

        <ArchitectureDiagram />
      </section>

      {/* Core Objectives & Guarantees */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Security Invariants
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Four Foundational Guarantees
          </h2>
          <p className="text-sm text-slate-400">
            Adversarial safety validation cannot produce credible findings if parties can contaminate or observe each other.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objectives.map((obj, i) => (
            <div key={i} className="rounded-xl cyber-panel p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800/40 text-cyan-400 text-xs font-mono font-bold">
                  0{i + 1}
                </div>
                <h3 className="text-base font-semibold text-white">{obj.title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-9">
                {obj.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7 Architectural Verticals */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Defense in Depth
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The 7 Architectural Verticals
          </h2>
          <p className="text-sm text-slate-400">
            Engineered to run seamlessly on standard cloud VMs without proprietary hardware dependencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verticals.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className={`rounded-xl cyber-panel p-5 border ${v.border} hover:bg-slate-900/40 transition-all space-y-3`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <Icon className={`h-5 w-5 ${v.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{v.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

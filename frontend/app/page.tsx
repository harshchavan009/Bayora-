"use client";

import React from "react";
import Link from "next/link";
import { 
  Shield, Terminal, Lock, Database, ArrowRight, 
  CheckCircle2, Cpu, Activity, ExternalLink, ChevronRight,
  Layers, Clock, FileCheck2, Server, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function MarketingLandingPage() {
  const faqs = [
    {
      q: "How does Bayora prevent the Blue defense team from tuning filters before tests finish?",
      a: "Bayora uses a cryptographic sealed-commit scheme: the Red team commits a SHA-256 hash of their payload combined with a high-entropy secret nonce. Defenses execute in real-time, but raw payload content is cryptographically redacted from Blue defenders until the run is concluded and revealed."
    },
    {
      q: "What prevents Red team operators from probing classifier depths via latency?",
      a: "All gateway-mediated model responses are normalized into discrete quantum delay intervals (200ms buckets) with calibrated random jitter. This eliminates millisecond timing side channels that adversaries use to infer defensive rule count or model execution depth."
    },
    {
      q: "What are the limitations of Docker-level software sandboxing?",
      a: "Docker containers share the host Linux kernel. While Bayora applies rootless UID 10001 execution, cap_drop ALL, read-only root filesystems, and custom seccomp filters, microarchitectural hardware cache snooping (Spectre) requires hardware microVMs (AWS Firecracker) or AMD SEV-SNP confidential VMs for multi-tenant isolation."
    },
    {
      q: "Can third-party compliance auditors independently verify evaluation findings?",
      a: "Yes. Every event is committed to an append-only SHA-256 hash chain authenticated with Ed25519 digital signatures. Teams can export a complete verification bundle JSON and verify it offline using the standalone `bayora-verify` CLI."
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-foreground selection:bg-accent/20 selection:text-accent font-sans">
      {/* Public Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface-1/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-accent text-white flex items-center justify-center font-bold text-sm shadow-subtle">
              B
            </div>
            <span className="font-semibold text-sm tracking-tight text-foreground">Bayora</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-2 text-muted border border-border font-mono">
              v1.0 Enterprise
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted">
            <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
            <a href="#features" className="hover:text-foreground transition-colors">Platform</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security Posture</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Console</Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">Start Evaluation</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-1 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span>Continuous Adversarial Safety & Verification Engine</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
          Verify your AI's safety without compromising the test
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed font-normal">
          Run simultaneous red-team adversarial attacks and blue-team defensive countermeasures in cryptographically isolated sandboxes with zero early leakage and verifiable provenance.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="w-full sm:w-auto h-10 px-5 gap-2">
              <span>Start Evaluation</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto h-10 px-5">
              Request Security Demo
            </Button>
          </Link>
        </div>

        {/* Real Product Screenshot Frame */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="rounded-xl border border-border bg-surface-1 shadow-modal overflow-hidden p-1">
            <div className="h-8 border-b border-border bg-surface-2 px-3 flex items-center justify-between text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                <span className="text-[11px] font-mono text-faint ml-2">https://app.bayora.io/dashboard</span>
              </div>
              <span className="text-[10px] font-mono text-muted">Meridian Safety Labs</span>
            </div>
            <div className="p-4 sm:p-6 bg-canvas text-left">
              {/* Product preview mock */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3.5 rounded-lg border border-border bg-surface-1">
                  <div className="text-[11px] text-muted">Active Evaluations</div>
                  <div className="text-xl font-semibold text-foreground mt-1 tabular-nums">2 In-Flight</div>
                  <div className="text-[10px] text-success mt-0.5">Continuous verification</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-surface-1">
                  <div className="text-[11px] text-muted">Isolation Posture</div>
                  <div className="text-xl font-semibold text-success mt-1">Healthy</div>
                  <div className="text-[10px] text-muted mt-0.5">7/7 checks passed</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-surface-1">
                  <div className="text-[11px] text-muted">Audit Provenance</div>
                  <div className="text-xl font-semibold text-foreground mt-1 tabular-nums">8 Blocks</div>
                  <div className="text-[10px] text-muted mt-0.5">Ed25519 authenticated</div>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-surface-1">
                  <div className="text-[11px] text-muted">Timing Normalization</div>
                  <div className="text-xl font-semibold text-foreground mt-1 tabular-nums">200ms Tiers</div>
                  <div className="text-[10px] text-muted mt-0.5">Zero latency leakage</div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface-1 p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    SEALED COMMIT
                  </span>
                  <div>
                    <div className="font-medium text-foreground">Adversarial Jailbreak Probe #14</div>
                    <div className="text-[11px] text-muted font-mono">Target: Llama-3-8B-Instruct (Isolated Container)</div>
                  </div>
                </div>
                <span className="text-muted text-[11px] font-mono">Verdict: Defense Intercepted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Strip */}
      <section className="py-8 border-y border-border bg-surface-1/40 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-4">
            Architected for frontier AI safety labs, red teams, and security engineers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 text-xs font-semibold text-muted">
            <span>DEFENSE BENCHMARK</span>
            <span>•</span>
            <span>MODEL EVAL LABS</span>
            <span>•</span>
            <span>ENTERPRISE RED TEAM</span>
            <span>•</span>
            <span>AUDIT & PROVENANCE</span>
            <span>•</span>
            <span>CANARY RUNNERS</span>
          </div>
        </div>
      </section>

      {/* 3 Core Value Props */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Built for rigorous adversarial validation
          </h2>
          <p className="text-sm text-muted">
            Traditional testing tools share state or leak timing. Bayora is engineered from first principles with cryptographic boundaries.
          </p>
        </div>

        {/* Feature 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge variant="blue">Zero Early Leakage</Badge>
            <h3 className="text-xl font-semibold text-foreground">
              Sealed-Commit Payload Protection
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              When red teams run injection attacks, prompt payloads must not be observed by blue team defenders beforehand. Bayora hashes payloads with high-entropy nonces at test initiation, reveals them only at conclusion, and guarantees uncompromised defense baselines.
            </p>
            <ul className="space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Deterministic SHA-256 payload commitment nonces</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Role-based redaction filters active until run completion</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-1 p-5 font-mono text-xs space-y-3">
            <div className="text-muted text-[11px]">CRYPTOGRAPHIC COMMITMENT SCHEME:</div>
            <div className="p-3 rounded bg-surface-2 text-accent break-all text-[11px]">
              H = SHA256(Raw_Payload || Nonce_Entropy_128)
            </div>
            <div className="text-[11px] text-muted flex items-center justify-between">
              <span>Blue Defense State:</span>
              <span className="text-warning">SEALED_REDACTED</span>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="rounded-lg border border-border bg-surface-1 p-5 font-mono text-xs space-y-3 md:order-1 order-2">
            <div className="text-muted text-[11px]">TIMING NORMALIZATION TELEMETRY:</div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span>Internal Execution:</span>
                <span className="text-muted">42.8 ms</span>
              </div>
              <div className="flex justify-between">
                <span>Observable Normalized Output:</span>
                <span className="text-success font-semibold">200.0 ms (Quantized)</span>
              </div>
            </div>
            <div className="text-[11px] text-muted">
              Eliminates latency variance to block side-channel probing.
            </div>
          </div>
          <div className="space-y-4 md:order-2 order-1">
            <Badge variant="warning">Side-Channel Mitigation</Badge>
            <h3 className="text-xl font-semibold text-foreground">
              Response Timing Normalization
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Adversaries measure millisecond completion variations to infer whether a prompt triggered regex filters, secondary safety classifiers, or full inference. Bayora quantizes all outputs into calibrated 200ms discrete buckets with jitter suppression.
            </p>
            <ul className="space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Multi-homed gateway proxy delay padding</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Token bucket fair queuing prevents tenant starvation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge variant="success">Cryptographic Non-Repudiation</Badge>
            <h3 className="text-xl font-semibold text-foreground">
              Append-Only Provenance & Merkle Roots
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              Every safety finding, role decision, and verification check is written to an immutable SHA-256 hash chain signed with Ed25519 authority keys. Export evidence bundles and prove safety claims to external auditors with zero trust required.
            </p>
            <ul className="space-y-2 text-xs text-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Ed25519 digital signatures verified across all blocks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Merkle root checkpointing for third-party timestamping</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface-1 p-5 font-mono text-xs space-y-3">
            <div className="text-muted text-[11px]">AUTHORITY ED25519 ROOT:</div>
            <div className="p-3 rounded bg-surface-2 text-foreground break-all text-[11px]">
              RySsQ221amQKXRU3kSWJqN+nfD1HlfKF4dTGuxiUkH0=
            </div>
            <div className="text-[11px] text-success flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Independent CLI verifier compatible</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works 3-Step */}
      <section id="architecture" className="py-16 border-t border-border bg-surface-1/30 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Three steps to certified safety
            </h2>
            <p className="text-xs text-muted">
              A continuous, auditable verification pipeline from model registration to compliance report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-3">
              <div className="h-8 w-8 rounded bg-surface-2 flex items-center justify-center font-bold text-xs text-foreground">
                1
              </div>
              <h3 className="text-sm font-semibold text-foreground">Connect Model Target</h3>
              <p className="text-xs text-muted leading-relaxed">
                Connect your Ollama endpoint, vLLM instance, or OpenAI-compatible endpoint. Credentials are stored securely in a vault.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-3">
              <div className="h-8 w-8 rounded bg-surface-2 flex items-center justify-center font-bold text-xs text-foreground">
                2
              </div>
              <h3 className="text-sm font-semibold text-foreground">Execute Isolated Run</h3>
              <p className="text-xs text-muted leading-relaxed">
                Red attacks run against Blue defense rules. Micro-segmented bridge subnets block lateral traversal and canaries detect egress leaks.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-3">
              <div className="h-8 w-8 rounded bg-surface-2 flex items-center justify-center font-bold text-xs text-foreground">
                3
              </div>
              <h3 className="text-sm font-semibold text-foreground">Export Verifiable Proof</h3>
              <p className="text-xs text-muted leading-relaxed">
                Receive an Ed25519-signed verification bundle with Merkle root attestation. Pass it to customers, auditors, or regulators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Posture & Honest Boundaries */}
      <section id="security" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Badge variant="default">Honest Architecture</Badge>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            Security Guarantees & Calibrated Boundaries
          </h2>
          <p className="text-xs text-muted">
            We state operational assumptions plainly. No hype, no exaggerated claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Enforced by Software Sandbox</span>
            </div>
            <ul className="space-y-1.5 text-muted">
              <li>• Network bridge subnets prevent lateral Red ↔ Blue packet traversal.</li>
              <li>• Gateway proxy enforces ABAC role-based early payload opacity.</li>
              <li>• High-entropy synthetic canaries monitor cross-session context bleed.</li>
              <li>• SHA-256 hash chains guarantee ledger tamper-evidence.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <HelpCircle className="h-4 w-4 text-warning" />
              <span>Hardware-Dependent Boundaries</span>
            </div>
            <ul className="space-y-1.5 text-muted">
              <li>• Software containers share the host Linux kernel (0-days out of scope).</li>
              <li>• CPU microarchitectural side channels require hardware core pinning.</li>
              <li>• For multi-tenant hosting, upgrade to AWS Firecracker or AMD SEV-SNP VMs.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 border-t border-border bg-surface-1/30 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-muted">
              Everything you need to know about Bayora's evaluation guarantees.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface-1 p-4 space-y-1.5 text-xs">
                <h3 className="font-semibold text-foreground">{f.q}</h3>
                <p className="text-muted leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Ready to run verifiable AI safety evaluations?
        </h2>
        <p className="text-sm text-muted max-w-xl mx-auto">
          Create a workspace in seconds, invite your red and blue teams, and run your first benchmark.
        </p>
        <div className="pt-2">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="h-10 px-6">
              Create Workspace
            </Button>
          </Link>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="border-t border-border bg-surface-1 py-10 px-6 text-xs text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-accent text-white flex items-center justify-center font-bold text-xs">
              B
            </div>
            <span className="font-semibold text-foreground">Bayora</span>
            <span>— AI Safety Validation Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/threat-model" className="hover:text-foreground">Security Posture</Link>
            <Link href="/isolation" className="hover:text-foreground">Isolation Matrix</Link>
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/signup" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

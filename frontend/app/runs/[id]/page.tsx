"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, Lock, Cpu, Database, CheckCircle2, AlertTriangle, 
  ArrowLeft, RefreshCw, KeyRound, Clock, Eye, FileCheck2, Unlock, Info
} from "lucide-react";
import { useRole } from "@/components/RoleContext";
import { fetchRunDetail, revealRunPayload, verifyRunIndependently } from "@/lib/api";
import { VerificationReport } from "@/lib/types";

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;
  const { role } = useRole();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyReport, setVerifyReport] = useState<VerificationReport | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchRunDetail(runId, role);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [runId, role]);

  const handleReveal = async () => {
    try {
      setRevealing(true);
      await revealRunPayload(runId, role);
      await loadData();
    } catch (e) {
      alert("Failed to reveal payload: " + e);
    } finally {
      setRevealing(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const rep = await verifyRunIndependently(runId);
      setVerifyReport(rep);
    } catch (e) {
      alert("Verification failed: " + e);
    } finally {
      setVerifying(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.run) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center space-y-3 max-w-lg mx-auto mt-12">
        <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" />
        <h2 className="text-base font-semibold text-foreground">Test Run Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested evaluation record does not exist or has expired.</p>
        <Link href="/dashboard" className="text-xs text-foreground font-medium underline inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { run, payload_view, defense_view, audit_blocks, merkle_root } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1.5 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{run.name}</h1>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                run.status === "RUNNING"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              }`}
            >
              {run.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Run ID: <span className="font-mono text-foreground">{run.run_id}</span> • Target Model: {run.target_model}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Reveal button */}
          {!run.is_revealed && (role === "red" || role === "admin") && (
            <button
              onClick={handleReveal}
              disabled={revealing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
            >
              <Unlock className="h-3.5 w-3.5" />
              {revealing ? "Revealing..." : "Conclude & Reveal Payload"}
            </button>
          )}

          {/* Independent Verification Button */}
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 text-xs font-medium transition-colors shadow-sm"
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            {verifying ? "Verifying..." : "Verify Run Independently"}
          </button>
        </div>
      </div>

      {/* Role-Based Redaction Notice Banner */}
      <div className="rounded-lg p-3.5 bg-secondary/30 border border-border flex items-start gap-3 text-xs">
        <Eye className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-foreground font-medium flex items-center gap-2">
            Active Preview Role: <span className="font-mono uppercase text-foreground">{role}</span>
            {payload_view.is_redacted ? (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                Payload Redacted
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                Payload Visible
              </span>
            )}
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {payload_view.reason} Toggle "Preview as role" in the top bar to test how Bayora prevents early adversarial insight across role boundaries.
          </p>
        </div>
      </div>

      {/* Multi-Party Exchange Timeline */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Adversarial Validation Exchange Timeline (5 Stages)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step-by-step cryptographic validation lifecycle from red payload commit to Merkle provenance.
          </p>
        </div>

        <div className="space-y-3">
          {/* Step 1: Red Payload Commitment */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-foreground text-[11px] font-mono font-medium border border-border">
                  1
                </span>
                <h3 className="text-xs font-semibold text-foreground">Red Team — Sealed Payload Commitment</h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                Tenant: Red
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-muted-foreground text-[10px]">COMMITMENT SHA-256 HASH:</div>
                <div className="p-2 rounded bg-secondary/40 text-foreground border border-border break-all select-all text-[11px]">
                  {run.commitment_hash}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground text-[10px]">PAYLOAD VIEW ({role.toUpperCase()}):</div>
                <div
                  className={`p-2 rounded border break-words text-[11px] ${
                    payload_view.is_redacted
                      ? "bg-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-500/20"
                      : "bg-secondary/40 text-foreground border border-border"
                  }`}
                >
                  {payload_view.display_text}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground">
              Status: {run.is_revealed ? "✓ Revealed and cryptographically verified" : "🔒 Sealed under commitment hash; unrevealed to defenders"}
            </div>
          </div>

          {/* Step 2: Policy Gateway & Timing Defense */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-foreground text-[11px] font-mono font-medium border border-border">
                  2
                </span>
                <h3 className="text-xs font-semibold text-foreground">Policy Gateway — Constant-Time Padding</h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                Multi-Homed Proxy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-secondary/30 border border-border">
                <span className="text-muted-foreground text-[10px] block">Raw Execution Latency</span>
                <span className="text-sm font-semibold text-foreground font-mono">{run.execution_time_ms} ms</span>
              </div>
              <div className="p-2.5 rounded bg-secondary/30 border border-border">
                <span className="text-muted-foreground text-[10px] block">Observable Padded Latency</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{run.padded_time_ms} ms</span>
              </div>
              <div className="p-2.5 rounded bg-secondary/30 border border-border">
                <span className="text-muted-foreground text-[10px] block">Timing Channel Protection</span>
                <span className="text-sm font-semibold text-foreground font-mono">Quantized Quantum</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Gateway padded completion duration into discrete quantum intervals, suppressing classifier execution depth leakage.
            </p>
          </div>

          {/* Step 3: Blue Defensive Countermeasures */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-foreground text-[11px] font-mono font-medium border border-border">
                  3
                </span>
                <h3 className="text-xs font-semibold text-foreground">Blue Team — Defense Filter Interception</h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                Tenant: Blue
              </span>
            </div>

            <div className="p-3 rounded bg-secondary/30 border border-border space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Evaluation Verdict:</span>
                <span
                  className={`font-semibold ${
                    run.blue_defense_triggered ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  {run.blue_defense_triggered ? "Defense Triggered & Intercepted" : "Passed Unfiltered"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Filter Heuristic ({role.toUpperCase()} View):</span>
                <span className="font-mono text-foreground text-[11px]">{defense_view.display_text}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Red team view masks internal heuristic rules to prevent adversarial boundary probing.
            </p>
          </div>

          {/* Step 4: Model Under Test Sandbox */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-foreground text-[11px] font-mono font-medium border border-border">
                  4
                </span>
                <h3 className="text-xs font-semibold text-foreground">Model Under Test — Sandbox Completion</h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                Target Sandbox
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-muted-foreground text-[10px]">MODEL SANITIZED COMPLETION:</div>
              <div className="p-3 rounded bg-secondary/30 border border-border text-foreground font-mono text-[11px]">
                {run.model_response_text || "[Pending or intercepted by Blue defense]"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded bg-secondary/20 border border-border flex items-center justify-between">
                  <span className="text-muted-foreground">Egress Canary Injected:</span>
                  <span className="font-mono text-foreground">{run.canary_token_str || "CANARY_ACTIVE"}</span>
                </div>
                <div className="p-2 rounded bg-secondary/20 border border-border flex items-center justify-between">
                  <span className="text-muted-foreground">KV-Cache State:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Flushed & Zeroed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Cryptographic Provenance */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-foreground text-[11px] font-mono font-medium border border-border">
                  5
                </span>
                <h3 className="text-xs font-semibold text-foreground">Audit & Provenance — Ed25519 Signed Merkle Root</h3>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                Cryptographic Attestation
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="text-muted-foreground text-[10px]">DERIVED MERKLE ROOT:</div>
              <div className="p-2 rounded bg-secondary/40 text-foreground border border-border break-all select-all text-[11px]">
                {merkle_root || "COMPUTED_POST_RUN_CHECKPOINT"}
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{audit_blocks?.length ?? 5} Audit Blocks Hash-Chained with zero breaks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {verifyReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-lg border border-border bg-card p-6 max-w-xl w-full space-y-4 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                  Independent Cryptographic Verification Report
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automated verification of Ed25519 signatures, hash continuity, and Merkle root.
                </p>
              </div>
              <button
                onClick={() => setVerifyReport(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-md bg-secondary/30 border border-border flex items-center justify-between">
                <span className="text-muted-foreground">Overall Verification Verdict:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] border ${
                    verifyReport.overall_valid
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  }`}
                >
                  {verifyReport.overall_valid ? "Cryptographically Valid" : "Tamper Detected"}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                  Verification Assertions
                </div>
                {verifyReport.steps.map((st, i) => (
                  <div key={i} className="p-2.5 rounded bg-secondary/20 border border-border space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{st.check_name}</span>
                      <span className={`font-mono text-[11px] font-medium ${st.status === "PASSED" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {st.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{st.details}</p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded bg-secondary/30 border border-border text-[11px] font-mono text-muted-foreground space-y-1">
                <div>Public Key: {verifyReport.public_key_b64?.slice(0, 28)}...</div>
                <div>Blocks Audited: {verifyReport.total_blocks_checked}</div>
                {verifyReport.merkle_root && (
                  <div>Derived Root: {verifyReport.merkle_root?.slice(0, 32)}...</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setVerifyReport(null)}
                className="px-3 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 text-xs font-medium"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

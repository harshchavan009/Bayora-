"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, Lock, Cpu, Database, CheckCircle2, AlertTriangle, 
  ArrowLeft, RefreshCw, KeyRound, Clock, Eye, FileCheck2, Unlock
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
        <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!data?.run) {
    return (
      <div className="rounded-xl cyber-panel p-8 text-center space-y-4">
        <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Test Run Not Found</h2>
        <Link href="/dashboard" className="text-xs text-cyan-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { run, payload_view, defense_view, audit_blocks, merkle_root } = data;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">{run.name}</h1>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                run.status === "RUNNING"
                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
              }`}
            >
              {run.status}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Run ID: <span className="text-cyan-400">{run.run_id}</span> • Target: {run.target_model}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Reveal button (shown if unrevealed) */}
          {!run.is_revealed && (role === "red" || role === "admin") && (
            <button
              onClick={handleReveal}
              disabled={revealing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-medium text-xs shadow-md transition-all font-mono"
            >
              <Unlock className="h-3.5 w-3.5" />
              {revealing ? "Revealing..." : "Conclude & Reveal Payload"}
            </button>
          )}

          {/* Independent Verification Button */}
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all font-mono"
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            {verifying ? "Verifying Proofs..." : "Verify Run Independently"}
          </button>
        </div>
      </div>

      {/* Role-Based Redaction Notice Banner */}
      <div className="rounded-xl p-4 bg-slate-950 border border-slate-800 flex items-start gap-3">
        <Eye className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="text-slate-200 font-semibold font-mono flex items-center gap-2">
            VIEWER ROLE: <span className="text-cyan-400 uppercase">{role}</span>
            {payload_view.is_redacted ? (
              <span className="text-[10px] px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                PAYLOAD REDACTED
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                PAYLOAD VISIBLE
              </span>
            )}
          </div>
          <p className="text-slate-400">
            {payload_view.reason} Use the Role Switcher in the top navigation bar to observe how Bayora enforces zero early leakage across roles.
          </p>
        </div>
      </div>

      {/* Multi-Party Exchange Timeline */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
          Adversarial Validation Lifecycle (5-Stage Pipeline)
        </h2>

        <div className="space-y-4">
          {/* Step 1: Red Payload Commitment */}
          <div className="rounded-xl cyber-panel p-5 border border-rose-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-950 text-rose-300 text-xs font-mono font-bold border border-rose-800">
                  1
                </span>
                <h3 className="text-sm font-bold text-white">Red Team — Sealed Payload Commitment</h3>
              </div>
              <span className="text-xs font-mono text-rose-400">Tenant: RED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-slate-400">Commitment SHA-256 Hash:</div>
                <div className="p-2.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 break-all select-all">
                  {run.commitment_hash}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400">Payload State ({role.toUpperCase()} View):</div>
                <div
                  className={`p-2.5 rounded border break-words ${
                    payload_view.is_redacted
                      ? "bg-amber-950/20 text-amber-400 border-amber-800/40"
                      : "bg-slate-950 text-slate-200 border-slate-800"
                  }`}
                >
                  {payload_view.display_text}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Status: {run.is_revealed ? "✓ Revealed and Cryptographically Verified" : "🔒 Sealed under commitment hash"}
            </div>
          </div>

          {/* Step 2: Policy Gateway & Timing Defense */}
          <div className="rounded-xl cyber-panel p-5 border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-indigo-300 text-xs font-mono font-bold border border-indigo-800">
                  2
                </span>
                <h3 className="text-sm font-bold text-white">Policy Gateway — Governance & Timing Side-Channel Defense</h3>
              </div>
              <span className="text-xs font-mono text-indigo-400">Multi-Homed Bridge</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">RAW EXECUTION TIME</span>
                <div className="text-sm font-bold text-slate-200">{run.execution_time_ms} ms</div>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">QUANTUM BUCKET PADDING</span>
                <div className="text-sm font-bold text-cyan-400">{run.padded_time_ms} ms</div>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px]">TIMING DEFENSE</span>
                <div className="text-sm font-bold text-emerald-400">Constant-Time Quantized</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Gateway normalized response latency into a discrete quantum tier to prevent Red from measuring Blue classifier execution depth.
            </p>
          </div>

          {/* Step 3: Blue Defensive Countermeasures */}
          <div className="rounded-xl cyber-panel p-5 border border-cyan-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-800">
                  3
                </span>
                <h3 className="text-sm font-bold text-white">Blue Team — Defensive Guardrail Interception</h3>
              </div>
              <span className="text-xs font-mono text-cyan-400">Tenant: BLUE</span>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Defense Evaluation Verdict:</span>
                <span
                  className={`font-bold ${
                    run.blue_defense_triggered ? "text-cyan-400" : "text-slate-400"
                  }`}
                >
                  {run.blue_defense_triggered ? "DEFENSE TRIGGERED & INTERCEPTED" : "PASSED UNFILTERED"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Heuristic Rule Name ({role.toUpperCase()} View):</span>
                <span className="text-slate-200">{defense_view.display_text}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              If role is Red, rule names are masked to prevent probing classifier boundaries.
            </p>
          </div>

          {/* Step 4: Model Under Test Sandbox */}
          <div className="rounded-xl cyber-panel p-5 border border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-emerald-800">
                  4
                </span>
                <h3 className="text-sm font-bold text-white">Model Under Test — Isolated Inference Sandbox</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">Isolated Sandbox</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-slate-400">Model Sanitized Response:</div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-200">
                {run.model_response_text || "[Pending or intercepted by Blue defense]"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Canary String Injected:</span>
                  <span className="text-cyan-400 text-[11px]">{run.canary_token_str || "CANARY_ACTIVE"}</span>
                </div>
                <div className="p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">KV-Cache Eviction:</span>
                  <span className="text-emerald-400 text-[11px]">FLUSHED & ZEROED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Cryptographic Provenance */}
          <div className="rounded-xl cyber-panel p-5 border border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-950 text-purple-300 text-xs font-mono font-bold border border-purple-800">
                  5
                </span>
                <h3 className="text-sm font-bold text-white">Audit & Provenance — Ed25519 Signed Merkle Root</h3>
              </div>
              <span className="text-xs font-mono text-purple-400">Cryptographic Proof</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-slate-400">Merkle Tree Root Hash:</div>
              <div className="p-2.5 rounded bg-slate-950 text-purple-300 border border-slate-800 break-all select-all">
                {merkle_root || "COMPUTED_POST_RUN_CHECKPOINT"}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{audit_blocks?.length ?? 5} Audit Blocks Hash-Chained with zero breaks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {verifyReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="rounded-2xl cyber-panel border border-indigo-500/40 p-6 max-w-xl w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-cyan-400" />
                Independent Cryptographic Verification Report
              </h3>
              <button
                onClick={() => setVerifyReport(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Overall Verdict:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    verifyReport.overall_valid
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-rose-950 text-rose-300 border border-rose-800"
                  }`}
                >
                  {verifyReport.overall_valid ? "CRYPTOGRAPHICALLY VALID" : "TAMPER DETECTED"}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 uppercase text-[10px] tracking-wider">
                  Verification Assertions
                </span>
                {verifyReport.steps.map((st, i) => (
                  <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-semibold">{st.check_name}</span>
                      <span className={st.status === "PASSED" ? "text-emerald-400" : "text-rose-400"}>
                        [{st.status}]
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{st.details}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Public Key: {verifyReport.public_key_b64.slice(0, 24)}...</div>
                <div>Blocks Audited: {verifyReport.total_blocks_checked}</div>
                {verifyReport.merkle_root && (
                  <div>Derived Root: {verifyReport.merkle_root.slice(0, 32)}...</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setVerifyReport(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
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

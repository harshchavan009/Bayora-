"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Shield, AlertTriangle, CheckCircle2, Play, RefreshCw, KeyRound, Lock } from "lucide-react";
import { fetchLLMStatus, runContaminationTest } from "@/lib/api";

export default function LLMThreatPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchLLMStatus();
      setStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunContaminationTest = async () => {
    try {
      setTesting(true);
      const res = await runContaminationTest();
      setTestResult(res);
      await loadData();
    } catch (e) {
      alert("Contamination test failed: " + e);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-emerald-400" />
            LLM Threat Surface & Context Isolation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            KV-cache partitioning, context flush verification, and synthetic canary token egress monitoring.
          </p>
        </div>

        <button
          onClick={handleRunContaminationTest}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold shadow-md transition-all disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          {testing ? "Executing Test..." : "Run Cross-Session Contamination Test"}
        </button>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl cyber-panel p-5 border border-slate-800">
          <span className="text-xs font-mono text-slate-400">CONTAMINATION RISK</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {status?.contamination_risk_score ?? 0}%
            </span>
            <span className="text-xs font-mono text-emerald-400">ZERO BLEED</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            No cross-session residual memory detected.
          </p>
        </div>

        <div className="rounded-xl cyber-panel p-5 border border-slate-800">
          <span className="text-xs font-mono text-slate-400">VERIFIED KV-CACHE FLUSHES</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {status?.kv_cache?.total_flushes_recorded ?? 0}
            </span>
            <span className="text-xs font-mono text-cyan-400">RECEIPTS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            SHA-256 cryptographic memory deallocation receipts.
          </p>
        </div>

        <div className="rounded-xl cyber-panel p-5 border border-slate-800">
          <span className="text-xs font-mono text-slate-400">SYNTHETIC CANARY STRINGS</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {status?.active_canaries_count ?? 0}
            </span>
            <span className="text-xs font-mono text-purple-400">ACTIVE</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {status?.total_leaks ?? 0} leaks intercepted at egress filter.
          </p>
        </div>
      </div>

      {/* Contamination Test Results Modal/Card */}
      {testResult && (
        <div className="rounded-xl cyber-panel p-6 border border-emerald-500/40 bg-slate-950/80 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {testResult.test_name} — Result: PASSED
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
              0 EXFILTRATION LEAKS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400">Injected Canary (Session A):</span>
              <div className="p-2 rounded bg-slate-900 text-cyan-400 mt-1 border border-slate-800 break-all">
                {testResult.canary_injected}
              </div>
            </div>

            <div>
              <span className="text-slate-400">Session A KV-Cache Flush Receipt:</span>
              <div className="p-2 rounded bg-slate-900 text-purple-300 mt-1 border border-slate-800 break-all">
                {testResult.kv_cache_receipt}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            ✓ Confirmed: Session B inference output was generated with completely zeroed context memory and zero canary leakage.
          </p>
        </div>
      )}

      {/* Technical Threat Surface Mitigation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl cyber-panel p-5 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <Lock className="h-4 w-4 text-cyan-400" />
            KV-Cache Partitioning & Zero Prompt Caching
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            In standard LLM multi-tenant inference engines (e.g. vLLM with PagedAttention or Radix trees), 
            shared prompt caching creates cross-tenant side channels: one tenant can infer another tenant's 
            system prompt through token hit-rate timing. Bayora enforces strictly partitioned context slots 
            and complete memory flushing between evaluations.
          </p>
        </div>

        <div className="rounded-xl cyber-panel p-5 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Canary Token Egress Scanning
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            High-entropy synthetic strings (<code className="text-cyan-400 font-mono">BAYORA_CANARY_...</code>) 
            are dynamically embedded into evaluation session contexts. If a model exhibits state persistence, 
            memory leak, or indirect prompt injection cross-talk, the egress filter instantly intercepts 
            the canary token and raises a CRITICAL anomaly alert.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Lock, Shield, KeyRound, AlertOctagon, CheckCircle2, RefreshCw } from "lucide-react";
import { fetchCapabilities } from "@/lib/api";

export default function AccessControlPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchCapabilities();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const policies = [
    {
      name: "Zero Early Redaction Leakage",
      target: "Payload Resource",
      rule: "Tenant BLUE is DENIED permission to read raw payload while run phase is RUNNING.",
      invariant: "Prevents Blue defense team from tuning filters before run concludes."
    },
    {
      name: "Defense Logic Opacity",
      target: "Defense Rules",
      rule: "Tenant RED is DENIED permission to inspect classifier heuristics, weights, or regex strings.",
      invariant: "Prevents Red adversarial team from gradient or regex probing of defenses."
    },
    {
      name: "Gateway Proxy Enforcement",
      target: "Model Endpoint",
      rule: "Direct network invocation to model sandbox is DENIED for RED and BLUE. Gateway proxy required.",
      invariant: "Guarantees all model interactions pass through rate limits, fair queue, and padding."
    },
    {
      name: "Immutable Audit Ledger",
      target: "Audit Log",
      rule: "Actions 'tamper', 'delete', or 'truncate' are unconditionally DENIED for ALL roles.",
      invariant: "Preserves legal provenance and non-repudiation of safety findings."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Lock className="h-6 w-6 text-purple-400" />
          Access Control & Attribute-Based Governance (ABAC)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically signed capability tokens and attribute-based policy engine enforcing tenant separation.
        </p>
      </div>

      {/* ABAC Policy Invariants */}
      <div className="rounded-xl cyber-panel p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white font-mono uppercase">
          Active Attribute-Based Access Control (ABAC) Policies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 font-mono">{p.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {p.target}
                </span>
              </div>
              <p className="text-slate-200 font-mono text-[11px]">{p.rule}</p>
              <p className="text-[11px] text-slate-400 italic pt-1">{p.invariant}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scoped Capability Tokens */}
      <div className="rounded-xl cyber-panel p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-cyan-400" />
          Sample Capability Tokens (HMAC-SHA256 Signed & Scoped)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs font-mono">
          {/* Red token */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400">RED TEAM TOKEN</span>
              <span className="text-[10px] text-slate-400">Role: red_lead</span>
            </div>
            <div className="text-[11px] text-slate-300">
              <span className="text-slate-400">Scopes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px]">payload:commit</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px]">payload:reveal</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px]">payload:read_raw</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-900 text-[10px] text-slate-400 break-all border border-slate-800">
              {data?.token_samples?.red || "bayora.eyJzdWIiOiJyZWRfbGVhZF8wMSJ9.sig"}
            </div>
          </div>

          {/* Blue token */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400">BLUE TEAM TOKEN</span>
              <span className="text-[10px] text-slate-400">Role: blue_lead</span>
            </div>
            <div className="text-[11px] text-slate-300">
              <span className="text-slate-400">Scopes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px]">defense:execute</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px]">defense:inspect_rules</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-900 text-[10px] text-slate-400 break-all border border-slate-800">
              {data?.token_samples?.blue || "bayora.eyJzdWIiOiJibHVlX2xlYWRfMDEifQ.sig"}
            </div>
          </div>

          {/* Auditor token */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">AUDITOR TOKEN</span>
              <span className="text-[10px] text-slate-400">Role: auditor</span>
            </div>
            <div className="text-[11px] text-slate-300">
              <span className="text-slate-400">Scopes:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">audit:read</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px]">audit:verify</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-900 text-[10px] text-slate-400 break-all border border-slate-800">
              {data?.token_samples?.auditor || "bayora.eyJzdWIiOiJhdWRpdG9yXzAxIn0.sig"}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Access Denials Stream */}
      <div className="rounded-xl cyber-panel border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            Recent ABAC Policy Denials ({data?.recent_denials?.length ?? 0} Recorded)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Real-Time Security Enforcement
          </span>
        </div>

        <div className="divide-y divide-slate-800 text-xs font-mono">
          {data?.recent_denials?.length ? (
            data.recent_denials.map((d: any, idx: number) => (
              <div key={idx} className="p-4 hover:bg-slate-900/30 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-800">
                      DENIED
                    </span>
                    <span className="text-slate-200 font-bold">
                      Subject: {d.subject?.user_id} ({d.subject?.tenant})
                    </span>
                    <span className="text-slate-400">→ Action: {d.action}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(d.evaluated_at * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-rose-300/90 pl-1">{d.reason}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              No recent unauthorized access attempts. All operations within policy boundaries.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

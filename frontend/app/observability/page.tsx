"use client";

import React, { useState, useEffect } from "react";
import { 
  Eye, AlertTriangle, Activity, Shield, Clock, 
  BarChart2, RefreshCw, CheckCircle2, Lock
} from "lucide-react";
import { fetchAnomalies, fetchTelemetry } from "@/lib/api";
import { AnomalyAlert } from "@/lib/types";

export default function ObservabilityPage() {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [al, tel] = await Promise.all([fetchAnomalies(), fetchTelemetry()]);
      setAlerts(al);
      setTelemetry(tel);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const severityColors: Record<string, string> = {
    CRITICAL: "bg-rose-950 text-rose-300 border-rose-700",
    HIGH: "bg-orange-950 text-orange-300 border-orange-700",
    MEDIUM: "bg-amber-950 text-amber-300 border-amber-700",
    LOW: "bg-blue-950 text-blue-300 border-blue-700",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Eye className="h-6 w-6 text-cyan-400" />
          Observability, Anomalies & Timing Side-Channel Telemetry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Privacy-preserving metrics pipeline logging hashes and structural telemetry only, with zero payload leakage.
        </p>
      </div>

      {/* Timing Side-Channel Defense Telemetry */}
      <div className="rounded-xl cyber-panel p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              Constant-Time Response Padding Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              Gateway quantizes response duration into discrete tiers (e.g. 200ms buckets) to prevent timing side channels.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            QUANTUM: 200ms BUCKETS ACTIVE
          </span>
        </div>

        {/* Visual Latency Bucketing Display */}
        <div className="space-y-3 pt-2">
          {telemetry?.latency_samples?.length ? (
            telemetry.latency_samples.slice(-5).map((s: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Action: {s.action} (Tenant: {s.tenant})</span>
                  <span className="text-cyan-400 font-bold">Bucket: {s.bucket_ms}ms</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Internal Workload Execution:</span>
                      <span className="text-slate-200">{s.actual_ms} ms</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-500 rounded-full"
                        style={{ width: `${Math.min(100, (s.actual_ms / 300) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Gateway Padded Latency (Observable):</span>
                      <span className="text-emerald-400 font-bold">{s.padded_ms} ms</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, (s.padded_ms / 300) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs font-mono text-slate-400">
              Awaiting latency telemetry. Run an adversarial test to observe quantum bucket padding.
            </div>
          )}
        </div>
      </div>

      {/* Fair Queue Governance */}
      <div className="rounded-xl cyber-panel p-6 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-400" />
          Tenant Fair Queue & Token Bucket Quotas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          {telemetry?.fair_queue && Object.entries(telemetry.fair_queue).map(([tenant, q]: [string, any]) => (
            <div key={tenant} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase">{tenant}</span>
                <span className="text-[10px] text-slate-400">Cap: {q.capacity}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Tokens Available: <span className="text-cyan-400 font-bold">{q.available_tokens}</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${(q.available_tokens / q.capacity) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Refill: {q.refill_rate}/s</span>
                <span>Active: {q.active_in_flight}/{q.max_concurrent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Anomaly Alert Stream */}
      <div className="rounded-xl cyber-panel border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Security Anomaly Detection Feed ({alerts.length} Events)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Real-Time Heuristic Rules
          </span>
        </div>

        <div className="divide-y divide-slate-800 text-xs font-mono">
          {alerts.length ? (
            alerts.map((a) => (
              <div key={a.alert_id} className="p-4 hover:bg-slate-900/30 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        severityColors[a.severity] || "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span className="text-white font-bold">{a.rule_name}</span>
                    <span className="text-slate-400">({a.tenant})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(a.timestamp * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 pl-1">{a.description}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
              Zero anomalies active. System isolation running at nominal health.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

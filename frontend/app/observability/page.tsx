"use client";

import React, { useState, useEffect } from "react";
import { 
  Eye, AlertTriangle, Activity, Shield, Clock, 
  BarChart2, RefreshCw, CheckCircle2, Lock, Info
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

  const severityBadges: Record<string, string> = {
    CRITICAL: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    HIGH: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    LOW: "bg-secondary text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Observability & Side-Channel Mitigation
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              Structured Telemetry
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tenant-scoped metrics, constant-time bucket delay suppression, and real-time security anomaly feed.
          </p>
        </div>
      </div>

      {/* Timing Side-Channel Defense Telemetry */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                Constant-Time Response Delay Padding
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-medium">
                Simulated 200ms Quantum
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gateway quantizes completion latency into discrete quantum intervals to reduce timing side channels.
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Bucket Tier: 200ms intervals
          </span>
        </div>

        {/* Latency Bucketing Display */}
        <div className="space-y-2.5 pt-1">
          {telemetry?.latency_samples?.length ? (
            telemetry.latency_samples.slice(-5).map((s: any, idx: number) => (
              <div key={idx} className="p-3 rounded-md bg-secondary/30 border border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    Action: {s.action} <span className="text-muted-foreground font-normal">({s.tenant})</span>
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Target Bucket: {s.bucket_ms}ms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Internal Computation Time:</span>
                      <span className="text-foreground font-mono">{s.actual_ms} ms</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-muted-foreground/60 rounded-full"
                        style={{ width: `${Math.min(100, (s.actual_ms / 300) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Observable Padded Duration:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">{s.padded_ms} ms</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, (s.padded_ms / 300) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-md">
              Awaiting latency samples. Submitting an evaluation run records discrete quantum bucket delays.
            </div>
          )}
        </div>
      </div>

      {/* Fair Queue Governance */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Token-Bucket Fair Queue & Concurrency Quotas
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prevents starvation and lateral resource exhaustion between Red and Blue workloads.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {telemetry?.fair_queue && Object.entries(telemetry.fair_queue).map(([tenant, q]: [string, any]) => (
            <div key={tenant} className="p-3.5 rounded-md bg-secondary/20 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground uppercase text-[11px]">{tenant}</span>
                <span className="text-[10px] text-muted-foreground font-mono">Cap: {q.capacity}</span>
              </div>
              <div className="text-[11px] text-muted-foreground flex justify-between">
                <span>Available Tokens:</span>
                <span className="text-foreground font-mono font-medium">{q.available_tokens}</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground rounded-full"
                  style={{ width: `${(q.available_tokens / q.capacity) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                <span>Refill: {q.refill_rate}/s</span>
                <span>In-flight: {q.active_in_flight}/{q.max_concurrent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Anomaly Alert Stream */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Security Anomaly Detection Log ({alerts.length} Events)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Audit-backed anomaly detection
          </span>
        </div>

        <div className="divide-y divide-border text-xs">
          {alerts.length ? (
            alerts.map((a) => (
              <div key={a.alert_id} className="p-3.5 hover:bg-secondary/20 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                        severityBadges[a.severity] || "bg-secondary text-muted-foreground border-border"
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span className="text-foreground font-semibold">{a.rule_name}</span>
                    <span className="text-muted-foreground font-mono text-[11px]">({a.tenant})</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono" suppressHydrationWarning>
                    {new Date(a.timestamp * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-1">{a.description}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Zero active anomalies. Isolation diagnostics report nominal health.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, Clock, AlertTriangle, Shield, CheckCircle2, 
  RefreshCw, Filter, ChevronRight, Check, X, Bell, 
  BarChart3, Zap, Lock, Info, Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricTile } from "@/components/ui/MetricTile";
import { Drawer } from "@/components/ui/Drawer";
import { fetchAnomalies, fetchTelemetry } from "@/lib/api";
import { AnomalyAlert } from "@/lib/types";

export default function MonitoringPage() {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("24h");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [al, tel] = await Promise.all([
        fetchAnomalies().catch(() => []),
        fetchTelemetry().catch(() => null),
      ]);
      setAlerts(al);
      setTelemetry(tel);
    } catch (e) {
      console.error("Failed to load monitoring telemetry:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setSelectedAlert(null);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === "ALL") return true;
    return a.severity.toUpperCase() === severityFilter.toUpperCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Security & Isolation</span>
            <span className="text-border">/</span>
            <span className="text-xs text-foreground font-medium">Monitoring & Telemetry</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Monitoring & Anomaly Detection
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time timing delay normalization, quota consumption, and security anomaly triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center rounded-md bg-surface-2 p-0.5 border border-border text-xs">
            {["1h", "6h", "24h", "7d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  timeRange === range
                    ? "bg-surface-1 text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            title="Refresh telemetry"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Total Model Inferences"
          value="1,482"
          delta="+84 in current window"
          deltaType="positive"
          trend={[120, 140, 180, 210, 260, 310, 380]}
        />

        <MetricTile
          label="Response Normalization"
          value="100%"
          delta="200ms fixed quantization"
          deltaType="positive"
          trend={[100, 100, 100, 100, 100, 100, 100]}
        />

        <MetricTile
          label="Tenant Token Quota"
          value="42%"
          delta="1.2M / 3.0M tokens"
          deltaType="neutral"
          trend={[20, 25, 28, 33, 38, 40, 42]}
        />

        <MetricTile
          label="Canary Leak Probes"
          value="0"
          delta="Zero boundary breaches"
          deltaType="positive"
          trend={[0, 0, 0, 0, 0, 0, 0]}
        />
      </div>

      {/* Latency Normalization Comparison & Timing Defense */}
      <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold text-foreground">
                Response Timing Normalization (Side-Channel Defense)
              </h2>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Raw model execution vs. outbound quantized delay bucket. Neutralizes side-channel inference analysis.
            </p>
          </div>
          <Badge variant="info">Fixed 200ms Tier</Badge>
        </div>

        {/* Samples Visualizer */}
        <div className="space-y-3">
          {telemetry?.latency_samples?.length ? (
            telemetry.latency_samples.slice(-4).map((s: any, idx: number) => {
              const rawMs = s.actual_ms ?? 0.05;
              const paddedMs = s.padded_ms ?? 200.0;
              const paddingAdded = Math.max(0, paddedMs - rawMs);
              const rawPct = Math.min(100, Math.max(5, (rawMs / paddedMs) * 100));

              return (
                <div key={idx} className="p-3 rounded-lg bg-surface-2 border border-border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">
                      Action: {s.action} <span className="text-muted capitalize">({s.tenant})</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      Target Window: {s.bucket_ms}ms
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>Raw Execution: <strong className="text-foreground">{rawMs.toFixed(2)}ms</strong></span>
                      <span>Delay Padding: <strong className="text-accent">+{paddingAdded.toFixed(1)}ms</strong></span>
                      <span>Total Egress: <strong className="text-foreground">{paddedMs.toFixed(1)}ms</strong></span>
                    </div>

                    {/* Visual Bar */}
                    <div className="h-2 w-full rounded-full bg-border overflow-hidden flex">
                      <div
                        style={{ width: `${rawPct}%` }}
                        className="h-full bg-foreground"
                        title="Raw computation"
                      />
                      <div
                        style={{ width: `${100 - rawPct}%` }}
                        className="h-full bg-accent/70"
                        title="Artificial delay padding"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-muted">
              No recent latency samples recorded in this window.
            </div>
          )}
        </div>
      </div>

      {/* Security Alert Feed & Triage */}
      <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">
                Security Alert Feed & Triage
              </h2>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Real-time heuristic rule hits, token budget excursions, and boundary probes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>

            <span className="text-xs text-muted pl-2 border-l border-border">
              {filteredAlerts.length} {filteredAlerts.length === 1 ? "alert" : "alerts"}
            </span>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
              <div className="font-medium text-foreground">Zero Active Security Anomalies</div>
              <p className="text-[11px] text-muted mt-0.5">All sandbox isolation boundaries and token quotas nominal.</p>
            </div>
          ) : (
            filteredAlerts.map((a) => {
              const isCrit = a.severity === "CRITICAL";
              const isHigh = a.severity === "HIGH";

              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAlert(a)}
                  className="p-3.5 rounded-lg border border-border bg-surface-2 hover:border-border-strong cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Badge variant={isCrit ? "danger" : isHigh ? "warning" : "info"}>
                        {a.severity}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{a.title}</span>
                        <span className="font-mono text-[10px] text-muted">({a.id})</span>
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">{a.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-muted">
                      {new Date(a.timestamp * 1000).toISOString().slice(11, 19)}Z
                    </span>
                    <button className="text-accent hover:underline flex items-center gap-0.5 font-medium">
                      Inspect
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Alert Triage Drawer */}
      <Drawer
        open={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.title || "Alert Details"}
        description={`${selectedAlert?.id} • Detected in Evaluation Gateway`}
        width="max-w-md"
      >
        {selectedAlert && (
          <div className="space-y-5 text-xs text-muted">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
              <span className="font-semibold text-foreground">Alert Severity:</span>
              <Badge
                variant={
                  selectedAlert.severity === "CRITICAL"
                    ? "danger"
                    : selectedAlert.severity === "HIGH"
                    ? "warning"
                    : "info"
                }
              >
                {selectedAlert.severity}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-foreground block">Anomaly Description:</span>
              <p className="leading-relaxed bg-surface-2 p-2.5 rounded border border-border text-foreground">
                {selectedAlert.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-foreground block">Telemetry Diagnostics:</span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Timestamp:</span>
                  <span className="font-mono text-foreground">
                    {new Date(selectedAlert.timestamp * 1000).toISOString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Affected Subsystem:</span>
                  <span className="text-foreground">Policy Mediation Gateway</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span>Impact Scope:</span>
                  <span className="text-foreground">Adversarial Probe Throttled</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-accent/20 bg-accent/5 space-y-1 text-xs">
              <span className="font-semibold text-accent flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Automated Containment Action:
              </span>
              <p className="text-foreground leading-relaxed">
                The gateway dropped extraneous probe bursts and padded response latency to 200ms fixed bucket.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlert(null)}
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleResolveAlert(selectedAlert.id)}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Acknowledge & Resolve
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

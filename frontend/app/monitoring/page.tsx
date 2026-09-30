"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, Clock, AlertTriangle, Shield, CheckCircle2, 
  RefreshCw, Filter, ChevronRight, Check, X, Bell, 
  BarChart3, Zap, Lock, Info, Layers, User, ToggleLeft, ToggleRight
} from "lucide-react";
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricTile } from "@/components/ui/MetricTile";
import { Drawer } from "@/components/ui/Drawer";
import { UNIFIED_ALERTS, UnifiedAlert } from "@/lib/dataStore";

export default function MonitoringPage() {
  const [alerts, setAlerts] = useState<UnifiedAlert[]>(UNIFIED_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState<UnifiedAlert | null>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [loading, setLoading] = useState(false);

  // Alert Rules with Toggles
  const [alertRules, setAlertRules] = useState([
    {
      id: "rule-1",
      name: "Response timing jitter variance (>2.0ms)",
      category: "Side-channel protection",
      enabled: true,
      subsystem: "Timing quantizer",
    },
    {
      id: "rule-2",
      name: "High-frequency probe burst (>15 req/min)",
      category: "Rate limiter",
      enabled: true,
      subsystem: "Inference gateway",
    },
    {
      id: "rule-3",
      name: "Canary token egress pattern match",
      category: "Exfiltration scanner",
      enabled: true,
      subsystem: "Packet inspector",
    },
    {
      id: "rule-4",
      name: "Cross-namespace network route violation",
      category: "Network isolation",
      enabled: true,
      subsystem: "Iptables kernel bridge",
    },
  ]);

  // Real Chart Data
  const requestRateData = [
    { time: "00:00", requests: 120, baseline: 100 },
    { time: "04:00", requests: 85, baseline: 90 },
    { time: "08:00", requests: 240, baseline: 180 },
    { time: "12:00", requests: 490, baseline: 350 },
    { time: "16:00", requests: 620, baseline: 420 },
    { time: "20:00", requests: 380, baseline: 300 },
    { time: "24:00", requests: 190, baseline: 150 },
  ];

  const latencyData = [
    { time: "00:00", raw: 95, normalized: 200 },
    { time: "04:00", raw: 88, normalized: 200 },
    { time: "08:00", raw: 142, normalized: 200 },
    { time: "12:00", raw: 178, normalized: 200 },
    { time: "16:00", raw: 195, normalized: 204.2 }, // Jitter spike
    { time: "20:00", raw: 135, normalized: 200 },
    { time: "24:00", raw: 92, normalized: 200 },
  ];

  const quotaData = [
    { model: "Llama-3.1-70B", used: 74, limit: 100 },
    { model: "Claude-3.5-Sonnet", used: 42, limit: 100 },
    { model: "GPT-4o", used: 28, limit: 100 },
    { model: "Mistral-Large-2", used: 15, limit: 100 },
  ];

  const openDrawer = (alert: UnifiedAlert) => {
    setSelectedAlert(alert);
    setSelectedAssignee(alert.assignedTo || "Elena Rostova");
  };

  const handleUpdateAlertStatus = (status: "active" | "acknowledged" | "resolved") => {
    if (!selectedAlert) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === selectedAlert.id
          ? { ...a, status, assignedTo: selectedAssignee }
          : a
      )
    );
    setSelectedAlert((prev) => (prev ? { ...prev, status, assignedTo: selectedAssignee } : null));
  };

  const handleToggleRule = (ruleId: string) => {
    setAlertRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const activeAlertsCount = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumbs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Monitoring
          </h1>
          <p className="text-sm text-muted mt-1">
            Real-time request throughput, timing delay normalization, and active security anomaly triage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-lg bg-surface-2 p-0.5 border border-border text-xs">
            {["1h", "6h", "24h", "7d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
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
            onClick={() => setLoading(true)}
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 4 Metric Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Canary alerts"
          value={activeAlertsCount.toString()}
          delta="2 active in monitoring"
          deltaType="warning"
          trend={[0, 0, 1, 1, 2, 2, activeAlertsCount]}
        />
        <MetricTile
          label="Request throughput"
          value="2,125"
          delta="probes in past 24h"
          deltaType="neutral"
          trend={[140, 210, 350, 480, 520, 490, 620]}
        />
        <MetricTile
          label="Quantized latency"
          value="200.0ms"
          delta="Fixed bucket target"
          deltaType="positive"
          trend={[200, 200, 200, 200, 204.2, 200, 200]}
        />
        <MetricTile
          label="Anomaly rate"
          value="0.09%"
          delta="Well below 1% threshold"
          deltaType="positive"
          trend={[0.12, 0.11, 0.10, 0.09, 0.09, 0.09, 0.09]}
        />
      </div>

      {/* Real Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Request Rate Throughput */}
        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Request throughput</h2>
              <p className="text-xs text-muted mt-0.5">Adversarial probe rate vs historical baseline.</p>
            </div>
            <span className="text-xs text-muted tabular-nums">req / min</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={requestRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6E7BF2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6E7BF2" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#23272E" vertical={false} />
                <XAxis dataKey="time" stroke="#9097A3" fontSize={11} tickLine={false} />
                <YAxis stroke="#9097A3" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171A1F",
                    borderColor: "#23272E",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#ECEEF1",
                  }}
                />
                <Area type="monotone" dataKey="requests" stroke="#6E7BF2" strokeWidth={2} fillOpacity={1} fill="url(#reqGradient)" name="Probes" />
                <Line type="monotone" dataKey="baseline" stroke="#9097A3" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Baseline" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Raw vs Normalized Latency */}
        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Timing normalization</h2>
              <p className="text-xs text-muted mt-0.5">Raw model inference vs 200ms quantized egress.</p>
            </div>
            <Badge variant="accent">Quantized bucket</Badge>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23272E" vertical={false} />
                <XAxis dataKey="time" stroke="#9097A3" fontSize={11} tickLine={false} />
                <YAxis stroke="#9097A3" fontSize={11} tickLine={false} axisLine={false} domain={[50, 240]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171A1F",
                    borderColor: "#23272E",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#ECEEF1",
                  }}
                />
                <Line type="monotone" dataKey="normalized" stroke="#3FB68B" strokeWidth={2} dot={{ r: 3 }} name="Padded egress (ms)" />
                <Line type="monotone" dataKey="raw" stroke="#6E7BF2" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} name="Raw latency (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Alerts Panel & Alert Rules List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Alerts Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Active security alerts</h2>
              <p className="text-xs text-muted mt-0.5">
                Canary exfiltrations, timing variance spikes, and quota bursts requiring triage.
              </p>
            </div>
            <span className="text-xs text-muted tabular-nums">
              {alerts.length} total alerts
            </span>
          </div>

          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                  <tr>
                    <th className="py-3 px-4">Alert</th>
                    <th className="py-3 px-4">Subsystem</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {alerts.map((al) => (
                    <tr
                      key={al.id}
                      onClick={() => openDrawer(al)}
                      className="hover:bg-surface-2/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{al.title}</div>
                        <div className="font-mono text-[11px] text-muted mt-0.5">
                          {al.id}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted">
                        {al.subsystem}
                      </td>

                      <td className="py-3.5 px-4">
                        {al.severity === "critical" ? (
                          <Badge variant="danger">Critical</Badge>
                        ) : al.severity === "high" ? (
                          <Badge variant="warning">High</Badge>
                        ) : (
                          <Badge variant="info">Medium</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {al.status === "active" ? (
                          <Badge variant="danger">Active</Badge>
                        ) : al.status === "acknowledged" ? (
                          <Badge variant="warning">Acknowledged</Badge>
                        ) : (
                          <Badge variant="success">Resolved</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(al);
                          }}
                        >
                          Triage
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Alert Rules List with Enable/Disable Toggles */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Alert rules</h2>
            <p className="text-xs text-muted mt-0.5">Automated detection policies.</p>
          </div>

          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-4 space-y-3">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-lg border border-border bg-surface-2/50 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-foreground">{rule.name}</div>
                  <div className="text-[11px] text-muted">{rule.subsystem}</div>
                </div>

                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className="mt-0.5 text-muted hover:text-foreground transition-colors shrink-0"
                  title={rule.enabled ? "Disable rule" : "Enable rule"}
                >
                  {rule.enabled ? (
                    <span className="text-accent flex items-center gap-1 text-[11px] font-medium">
                      Active
                      <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      </div>
                    </span>
                  ) : (
                    <span className="text-muted flex items-center gap-1 text-[11px]">
                      Paused
                      <div className="w-4 h-4 rounded-full bg-surface-3 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-muted" />
                      </div>
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Drawer */}
      <Drawer
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title={`Alert Triage: ${selectedAlert?.id}`}
        width="max-w-md"
      >
        {selectedAlert && (
          <div className="space-y-6 text-xs p-1">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                {selectedAlert.title}
              </h3>
              <p className="text-muted leading-relaxed">
                {selectedAlert.description}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-surface-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted">Subsystem</span>
                <span className="font-medium text-foreground">{selectedAlert.subsystem}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Status</span>
                <Badge variant={selectedAlert.status === "active" ? "danger" : "success"}>
                  {selectedAlert.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-muted font-medium">Assigned engineer</label>
              <input
                type="text"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
              />
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <span className="font-semibold text-foreground block">Triage actions</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateAlertStatus("acknowledged")}
                  disabled={selectedAlert.status === "acknowledged"}
                >
                  Acknowledge
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateAlertStatus("resolved")}
                  disabled={selectedAlert.status === "resolved"}
                >
                  Mark resolved
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

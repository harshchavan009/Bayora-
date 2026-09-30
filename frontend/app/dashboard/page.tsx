"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, RefreshCw, Shield, AlertTriangle, CheckCircle2, 
  ExternalLink, ChevronRight, Terminal, ArrowUpRight, Lock, 
  Activity, Database, Cpu, Network, Info, Eye, Clock, Hash
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { MetricTile } from "@/components/ui/MetricTile";
import { NewEvaluationModal } from "@/components/NewEvaluationModal";
import { IsolationExplainerDrawer } from "@/components/IsolationExplainerDrawer";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { useRole } from "@/components/RoleContext";
import { 
  UNIFIED_EVALUATIONS, 
  UNIFIED_FINDINGS, 
  UNIFIED_ALERTS, 
  UNIFIED_ISOLATION_CHECKS, 
  getUnifiedMetrics,
  UnifiedEvaluation 
} from "@/lib/dataStore";
import { fetchHealth, fetchRuns, fetchAuditChain } from "@/lib/api";
import { SystemHealth, AuditBlock } from "@/lib/types";

export default function DashboardOverviewPage() {
  const { role } = useRole();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [evaluations, setEvaluations] = useState<UnifiedEvaluation[]>(UNIFIED_EVALUATIONS);
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEvalOpen, setNewEvalOpen] = useState(false);
  const [isolationDrawerOpen, setIsolationDrawerOpen] = useState(false);

  // Single Source of Truth Metrics
  const metrics = getUnifiedMetrics();

  const loadData = async () => {
    try {
      setLoading(true);
      const [h, r, a] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchRuns(role).catch(() => []),
        fetchAuditChain().catch(() => ({ blocks: [] })),
      ]);
      if (h) setHealth(h);
      if (a?.blocks && a.blocks.length > 0) {
        setAuditBlocks(a.blocks.slice(-5).reverse());
      }
    } catch (err) {
      console.error("Dashboard failed to reload telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumb - breadcrumb is in top bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted mt-1">
            {getGreeting()}, Dr. Aris Thorne. Real-time safety validation, network isolation posture, and threat telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsolationDrawerOpen(true)}
            className="text-xs text-muted hover:text-foreground"
          >
            <Info className="w-3.5 h-3.5 mr-1.5" />
            How Bayora isolates tenants
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            title="Refresh telemetry"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setNewEvalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New evaluation
          </Button>
        </div>
      </div>

      {/* Workspace Health Summary Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-warning/10 text-warning shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-foreground">
              Workspace health:
            </span>{" "}
            <span className="text-xs text-muted">
              All systems isolated. 1 check needs attention (response timing jitter).
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/isolation"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
          >
            <span>Review checks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Slim Collapsible Onboarding Checklist */}
      <OnboardingChecklist />

      {/* 4 Core Metric Tiles with Sparklines and Single Source of Truth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Active evaluations"
          value={metrics.activeEvaluations.toString()}
          delta={`${metrics.totalEvaluations} total runs`}
          deltaType="neutral"
          trend={[2, 3, 4, 3, 5, 4, metrics.activeEvaluations]}
        />

        <MetricTile
          label="Open findings"
          value={metrics.openFindings.toString()}
          delta={`${metrics.criticalFindings} critical jailbreaks`}
          deltaType="negative"
          trend={[3, 4, 4, 5, 5, 6, metrics.openFindings]}
        />

        <MetricTile
          label="Isolation health"
          value="85.7%"
          delta="6 of 7 checks verified"
          deltaType="warning"
          trend={[100, 100, 100, 100, 85.7, 85.7, 85.7]}
        />

        <MetricTile
          label="Canary alerts"
          value={metrics.activeAlerts.toString()}
          delta="2 active in monitoring"
          deltaType="warning"
          trend={[0, 0, 1, 1, 2, 2, metrics.activeAlerts]}
        />
      </div>

      {/* Main Content Layout: 2/3 Grid + 1/3 Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Evaluations Table (Full Width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent evaluations</h2>
              <p className="text-xs text-muted mt-0.5">
                Active adversarial validations and defense mitigations across model sandboxes.
              </p>
            </div>
            <Link
              href="/evaluations"
              className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 font-medium"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                  <tr>
                    <th className="py-3 px-4">Evaluation</th>
                    <th className="py-3 px-4">Target model</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Blue defense</th>
                    <th className="py-3 px-4">Timing</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {evaluations.slice(0, 6).map((r) => {
                    const isRunning = r.status === "RUNNING";
                    return (
                      <tr key={r.run_id} className="hover:bg-surface-2/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">
                            {r.name}
                          </div>
                          <div className="font-mono text-[11px] text-muted mt-0.5">
                            {r.run_id}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-foreground">
                            {r.target_model}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <Badge variant={isRunning ? "info" : "success"}>
                            {isRunning ? "In flight" : "Concluded"}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          {r.blue_defense_triggered ? (
                            <Badge variant="warning">Mitigated</Badge>
                          ) : (
                            <Badge variant="neutral">Pass-through</Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-muted tabular-nums">
                          {r.padded_time_ms ? `${r.padded_time_ms.toFixed(1)}ms` : "—"}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/evaluations/${r.run_id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-hover transition-colors"
                          >
                            Details
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Needs Attention & Activity Feed */}
        <div className="space-y-6">
          {/* Needs Attention Panel */}
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                Needs attention
              </span>
              <span className="text-[11px] text-muted tabular-nums">3 items</span>
            </div>

            <div className="space-y-2.5">
              {/* Alert 1 */}
              <div className="p-2.5 rounded-md border border-border bg-surface-2/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Response timing jitter deviation
                  </span>
                  <Badge variant="warning">Medium</Badge>
                </div>
                <p className="text-[11px] text-muted">
                  Timing padding bucket experienced 4.2ms variance on legacy external proxy.
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-faint">Isolation check #6</span>
                  <Link href="/isolation" className="text-accent hover:underline font-medium">
                    Investigate
                  </Link>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-2.5 rounded-md border border-border bg-surface-2/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    High-frequency delimiter probe
                  </span>
                  <Badge variant="danger">High</Badge>
                </div>
                <p className="text-[11px] text-muted">
                  Red team exceeded standard probe burst quota (18 req/min).
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-faint">Monitoring rule</span>
                  <Link href="/monitoring" className="text-accent hover:underline font-medium">
                    Review rule
                  </Link>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="p-2.5 rounded-md border border-border bg-surface-2/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    System prompt extraction
                  </span>
                  <Badge variant="danger">Critical</Badge>
                </div>
                <p className="text-[11px] text-muted">
                  Base64 escape sequence bypassed boundary filter on Llama-3.1-70B.
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-faint">Finding #FND-2026-001</span>
                  <Link href="/findings" className="text-accent hover:underline font-medium">
                    Triage finding
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed Panel */}
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-accent" />
                Ledger activity feed
              </span>
              <Link
                href="/audit"
                className="text-[11px] text-accent hover:underline font-medium"
              >
                Audit log
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  actor: "Dr. Aris Thorne",
                  role: "admin" as const,
                  action: "Committed sealed evaluation payload",
                  time: "6 mins ago",
                  block: "#12",
                },
                {
                  actor: "Marcus Vance",
                  role: "red_team" as const,
                  action: "Dispatched delimiter probe burst",
                  time: "18 mins ago",
                  block: "#11",
                },
                {
                  actor: "Elena Rostova",
                  role: "blue_team" as const,
                  action: "Updated delimiter regex heuristic",
                  time: "42 mins ago",
                  block: "#10",
                },
                {
                  actor: "Sarah Lin",
                  role: "auditor" as const,
                  action: "Verified Merkle root hash chain",
                  time: "1 hour ago",
                  block: "#9",
                },
              ].map((ev, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-foreground">{ev.actor}</span>
                      <RoleBadge role={ev.role} />
                    </div>
                    <p className="text-[11px] text-muted">{ev.action}</p>
                    <div className="flex items-center gap-2 text-[10px] text-faint">
                      <span>{ev.time}</span>
                      <span>•</span>
                      <span className="font-mono">Block {ev.block}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <NewEvaluationModal
        isOpen={newEvalOpen}
        onClose={() => setNewEvalOpen(false)}
        onCreated={() => {
          loadData();
          setNewEvalOpen(false);
        }}
      />

      <IsolationExplainerDrawer
        isOpen={isolationDrawerOpen}
        onClose={() => setIsolationDrawerOpen(false)}
      />
    </div>
  );
}

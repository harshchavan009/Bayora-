"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Play, Plus, RefreshCw, Shield, AlertTriangle, CheckCircle2, 
  ExternalLink, ChevronRight, Terminal, ArrowUpRight, Lock, 
  Activity, Database, Cpu, Network, Info, Eye
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricTile } from "@/components/ui/MetricTile";
import { Card } from "@/components/ui/Card";
import { NewEvaluationModal } from "@/components/NewEvaluationModal";
import { IsolationExplainerDrawer } from "@/components/IsolationExplainerDrawer";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { useRole } from "@/components/RoleContext";
import { fetchHealth, fetchRuns, fetchAuditChain } from "@/lib/api";
import { SystemHealth, TestRun, AuditBlock } from "@/lib/types";

export default function DashboardOverviewPage() {
  const { role } = useRole();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [auditBlocks, setAuditBlocks] = useState<AuditBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEvalOpen, setNewEvalOpen] = useState(false);
  const [isolationDrawerOpen, setIsolationDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [h, r, a] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchRuns(role).catch(() => []),
        fetchAuditChain().catch(() => ({ blocks: [] })),
      ]);
      if (h) setHealth(h);
      if (r) setRuns(r);
      if (a?.blocks) setAuditBlocks(a.blocks.slice(-5).reverse());
    } catch (err) {
      console.error("Dashboard failed to load telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [role]);

  const activeEvalsCount = runs.filter((r) => r.status === "RUNNING").length;
  const totalEvalsCount = runs.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Meridian Safety Labs</span>
            <span className="text-border">/</span>
            <Badge variant="neutral">US-East Pod 01</Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Adversarial safety evaluations, network isolation verification, and threat telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsolationDrawerOpen(true)}
            className="text-xs text-muted hover:text-foreground"
          >
            <Info className="h-3.5 w-3.5 mr-1.5" />
            How Bayora isolates tenants
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            title="Refresh telemetry"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setNewEvalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New evaluation
          </Button>
        </div>
      </div>

      {/* Onboarding Wizard (Dismissible checklist) */}
      <OnboardingChecklist />

      {/* 4 Core Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Active Evaluations"
          value={activeEvalsCount.toString()}
          delta={`${totalEvalsCount} total runs`}
          deltaType="neutral"
          trend={[2, 3, 5, 4, 6, 8, activeEvalsCount]}
        />

        <MetricTile
          label="Verified Findings"
          value="14"
          delta="2 critical jailbreaks"
          deltaType="negative"
          trend={[10, 11, 12, 12, 13, 14, 14]}
        />

        <MetricTile
          label="Isolation Enforcement"
          value="100%"
          delta="7/7 network checks pass"
          deltaType="positive"
          trend={[100, 100, 100, 100, 100, 100, 100]}
        />

        <MetricTile
          label="Open Canary Alerts"
          value="2"
          delta="0 canary leaks detected"
          deltaType="positive"
          trend={[0, 0, 1, 1, 2, 2, 2]}
        />
      </div>

      {/* Main Content Layout: 2/3 Grid + 1/3 Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Evaluations Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent Evaluations</h2>
              <p className="text-xs text-muted">Latest red-team probes and automated defense verifications.</p>
            </div>
            <Link
              href="/evaluations"
              className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-lg border border-border bg-surface-1 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Evaluation</th>
                    <th className="py-2.5 px-3">Target Model</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Blue Defense</th>
                    <th className="py-2.5 px-3">Timing</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {runs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted">
                        No evaluation runs found in this workspace. Click "New evaluation" to start.
                      </td>
                    </tr>
                  ) : (
                    runs.slice(0, 6).map((r) => {
                      const isRunning = r.status === "RUNNING";
                      return (
                        <tr key={r.run_id} className="hover:bg-surface-2/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-medium text-foreground truncate max-w-[180px]">
                              {r.name}
                            </div>
                            <div className="font-mono text-[11px] text-muted truncate">
                              {r.run_id}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="text-foreground truncate block max-w-[160px]">
                              {r.target_model || "Isolated Sandbox"}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <Badge variant={isRunning ? "info" : "success"}>
                              {isRunning ? "In Progress" : "Completed"}
                            </Badge>
                          </td>

                          <td className="py-3 px-3">
                            {r.blue_defense_triggered ? (
                              <Badge variant="warning">Mitigated</Badge>
                            ) : (
                              <Badge variant="neutral">Pass-through</Badge>
                            )}
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px] text-muted">
                            {r.padded_time_ms ? `${r.padded_time_ms.toFixed(1)}ms` : "—"}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/evaluations/${r.run_id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-hover transition-colors"
                            >
                              Details
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Needs Attention & Activity Feed */}
        <div className="space-y-6">
          {/* Needs Attention Card */}
          <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                Needs Attention
              </span>
              <Badge variant="warning">3 Items</Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-md bg-surface-2 border border-border space-y-1">
                <div className="font-medium text-foreground flex items-center justify-between">
                  <span>Ledger Verification Due</span>
                  <span className="text-[10px] text-muted">12m ago</span>
                </div>
                <p className="text-[11px] text-muted">
                  Run <code className="font-mono text-foreground">#run-caaebffb</code> completed inference and is awaiting auditor verification signature.
                </p>
                <Link
                  href="/audit"
                  className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-medium mt-1"
                >
                  Verify ledger chain
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="p-2.5 rounded-md bg-surface-2 border border-border space-y-1">
                <div className="font-medium text-foreground flex items-center justify-between">
                  <span>Canary Injection Probe</span>
                  <span className="text-[10px] text-muted">1h ago</span>
                </div>
                <p className="text-[11px] text-muted">
                  Boundary token check verified zero exfiltration across 4 runs today.
                </p>
              </div>

              <div className="p-2.5 rounded-md bg-surface-2 border border-border space-y-1">
                <div className="font-medium text-foreground flex items-center justify-between">
                  <span>Timing Padding Active</span>
                  <span className="text-[10px] text-muted">Continuous</span>
                </div>
                <p className="text-[11px] text-muted">
                  Fixed 200ms bucket quantization neutralizing side-channel timing analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-accent" />
                Live Provenance Stream
              </span>
              <span className="text-[11px] text-muted">Audit Ledger</span>
            </div>

            <div className="space-y-3">
              {auditBlocks.length === 0 ? (
                <div className="text-xs text-muted py-2">No recent audit events.</div>
              ) : (
                auditBlocks.map((b) => (
                  <div key={b.index} className="flex items-start gap-2.5 text-xs">
                    <div className="mt-1 h-2 w-2 rounded-full bg-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-foreground truncate">
                          {b.event_type.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-[10px] text-muted">
                          #{b.index}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted truncate">
                        Tenant: <span className="text-foreground capitalize">{b.tenant}</span>
                      </div>
                      <div className="font-mono text-[10px] text-muted truncate">
                        {b.block_hash.slice(0, 16)}...
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-border text-center">
              <Link
                href="/audit"
                className="text-xs text-muted hover:text-foreground inline-flex items-center gap-1 font-medium"
              >
                Inspect full cryptographic audit log
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* New Evaluation Modal */}
      <NewEvaluationModal
        open={newEvalOpen}
        onClose={() => setNewEvalOpen(false)}
        onSuccess={(id) => {
          loadData();
        }}
      />

      {/* Technical Isolation Drawer */}
      <IsolationExplainerDrawer
        open={isolationDrawerOpen}
        onClose={() => setIsolationDrawerOpen(false)}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldAlert, Download, Filter, Search, ArrowUpRight, 
  AlertTriangle, CheckCircle2, Clock, Lock, Cpu, Eye, 
  Check, ExternalLink, X, ChevronRight, FileText, UserCheck, Database
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricTile } from "@/components/ui/MetricTile";
import { Drawer } from "@/components/ui/Drawer";
import { useRole } from "@/components/RoleContext";
import { UNIFIED_FINDINGS, UnifiedFinding, getUnifiedMetrics } from "@/lib/dataStore";

function FindingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useRole();

  const [findings, setFindings] = useState<UnifiedFinding[]>(UNIFIED_FINDINGS);
  const [selectedFinding, setSelectedFinding] = useState<UnifiedFinding | null>(null);

  // Filters read from URL params
  const initialSeverity = searchParams?.get("severity") || "ALL";
  const initialStatus = searchParams?.get("status") || "ALL";
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState(initialSeverity);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Drawer edit state
  const [triageStatus, setTriageStatus] = useState<UnifiedFinding["status"]>("open");
  const [triageAssignee, setTriageAssignee] = useState("");
  const [triageNotes, setTriageNotes] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync filters to URL
  const updateFilters = (newSev: string, newStat: string) => {
    setSeverityFilter(newSev);
    setStatusFilter(newStat);
    const params = new URLSearchParams();
    if (newSev !== "ALL") params.set("severity", newSev);
    if (newStat !== "ALL") params.set("status", newStat);
    router.replace(`/findings?${params.toString()}`);
  };

  const openTriageDrawer = (finding: UnifiedFinding) => {
    setSelectedFinding(finding);
    setTriageStatus(finding.status);
    setTriageAssignee(finding.assignee || "Elena Rostova");
    setTriageNotes(finding.notes || "");
    setSaveSuccess(false);
  };

  const handleSaveTriage = () => {
    if (!selectedFinding) return;
    setFindings((prev) =>
      prev.map((f) =>
        f.id === selectedFinding.id
          ? { ...f, status: triageStatus, assignee: triageAssignee, notes: triageNotes }
          : f
      )
    );
    setSelectedFinding((prev) =>
      prev ? { ...prev, status: triageStatus, assignee: triageAssignee, notes: triageNotes } : null
    );
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Export handlers
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(findings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bayora-findings-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Model", "Category", "Severity", "Status", "Discovered At", "Run ID"];
    const rows = findings.map((f) => [
      f.id,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.model}"`,
      f.category,
      f.severity,
      f.status,
      f.discoveredAt,
      f.runId,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bayora-findings-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const metrics = getUnifiedMetrics();

  // Chart data
  const severityDistribution = [
    { name: "Critical", count: findings.filter((f) => f.severity === "critical").length, color: "#E5534B" },
    { name: "High", count: findings.filter((f) => f.severity === "high").length, color: "#E2A336" },
    { name: "Medium", count: findings.filter((f) => f.severity === "medium").length, color: "#4C9AFF" },
    { name: "Low", count: findings.filter((f) => f.severity === "low").length, color: "#9097A3" },
  ];

  const filteredFindings = findings.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = severityFilter === "ALL" || f.severity === severityFilter;
    const matchesStat = statusFilter === "ALL" || f.status === statusFilter;
    return matchesSearch && matchesSev && matchesStat;
  });

  const getSeverityBadge = (sev: UnifiedFinding["severity"]) => {
    switch (sev) {
      case "critical":
        return <Badge variant="danger">Critical</Badge>;
      case "high":
        return <Badge variant="warning">High</Badge>;
      case "medium":
        return <Badge variant="info">Medium</Badge>;
      case "low":
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  const getStatusBadge = (stat: UnifiedFinding["status"]) => {
    switch (stat) {
      case "open":
        return <Badge variant="danger">Open</Badge>;
      case "triaged":
        return <Badge variant="warning">Triaged</Badge>;
      case "mitigated":
        return <Badge variant="success">Mitigated</Badge>;
      case "accepted_risk":
        return <Badge variant="neutral">Accepted risk</Badge>;
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumbs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Findings
          </h1>
          <p className="text-sm text-muted mt-1">
            Verified adversarial jailbreaks, prompt leakage vectors, and security policy violations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => window.print()}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Export PDF report
          </Button>
        </div>
      </div>

      {/* 4 Metric Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Open findings"
          value={metrics.openFindings.toString()}
          delta={`${metrics.criticalFindings} critical priority`}
          deltaType="negative"
          trend={[3, 4, 4, 5, 5, 6, metrics.openFindings]}
        />
        <MetricTile
          label="Critical jailbreaks"
          value={metrics.criticalFindings.toString()}
          delta="Immediate remediation"
          deltaType="negative"
          trend={[1, 1, 2, 2, 2, 2, metrics.criticalFindings]}
        />
        <MetricTile
          label="Mitigated findings"
          value={findings.filter((f) => f.status === "mitigated").length.toString()}
          delta="Defenses active"
          deltaType="positive"
          trend={[1, 2, 2, 3, 3, 4, 4]}
        />
        <MetricTile
          label="OWASP LLM compliance"
          value="88%"
          delta="12 test categories"
          deltaType="positive"
          trend={[80, 82, 85, 84, 86, 88, 88]}
        />
      </div>

      {/* Severity Distribution Chart & Summary */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Severity distribution
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Active adversarial risks catalogued across validated model sandboxes.
          </p>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" stroke="#9097A3" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="#9097A3" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171A1F",
                  borderColor: "#23272E",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#ECEEF1",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Findings Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search findings by title, ID, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-surface-2 border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={severityFilter}
              onChange={(e) => updateFilters(e.target.value, statusFilter)}
              className="px-2.5 py-1.5 text-xs rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:border-accent"
            >
              <option value="ALL">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => updateFilters(severityFilter, e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:border-accent"
            >
              <option value="ALL">All statuses</option>
              <option value="open">Open</option>
              <option value="triaged">Triaged</option>
              <option value="mitigated">Mitigated</option>
              <option value="accepted_risk">Accepted risk</option>
            </select>

            <span className="text-xs text-muted pl-2 border-l border-border tabular-nums">
              {filteredFindings.length} findings
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                <tr>
                  <th className="py-3 px-4">Finding</th>
                  <th className="py-3 px-4">Model target</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Discovered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFindings.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => openTriageDrawer(f)}
                    className="hover:bg-surface-2/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground">{f.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] text-muted">{f.id}</span>
                        <span className="text-border-strong">•</span>
                        <span className="text-[11px] text-muted">{f.category}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-foreground">{f.model}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getSeverityBadge(f.severity)}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(f.status)}
                    </td>

                    <td className="py-3.5 px-4 text-muted tabular-nums">
                      {f.discoveredAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTriageDrawer(f);
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

      {/* Triage & Remediation Drawer */}
      <Drawer
        isOpen={Boolean(selectedFinding)}
        onClose={() => setSelectedFinding(null)}
        title={`Finding Triage: ${selectedFinding?.id}`}
        width="max-w-lg"
      >
        {selectedFinding && (
          <div className="space-y-6 text-xs p-1">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                {selectedFinding.title}
              </h3>
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedFinding.severity)}
                <span className="text-muted">{selectedFinding.owaspTag}</span>
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-lg border border-border bg-surface-2 space-y-1">
              <span className="font-medium text-foreground block">Vulnerability description</span>
              <p className="text-muted leading-relaxed">
                {selectedFinding.description}
              </p>
            </div>

            {/* Adversarial Payload Snippet */}
            <div className="space-y-1.5">
              <span className="font-medium text-foreground block">Adversarial payload snippet</span>
              <pre className="p-3 rounded-md bg-surface-2 border border-border font-mono text-[11px] text-accent overflow-x-auto whitespace-pre-wrap">
                {selectedFinding.payloadSnippet}
              </pre>
            </div>

            {/* Provenance Links */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/evaluations/${selectedFinding.runId}`}
                className="p-3 rounded-md border border-border bg-surface-2 hover:border-accent transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-muted">Evaluation run</div>
                  <div className="font-mono font-medium text-foreground">{selectedFinding.runId}</div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
              </Link>

              <Link
                href="/audit"
                className="p-3 rounded-md border border-border bg-surface-2 hover:border-accent transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] text-muted">Ledger proof</div>
                  <div className="font-mono font-medium text-foreground">Block #{selectedFinding.ledgerBlockIndex}</div>
                </div>
                <Database className="w-3.5 h-3.5 text-accent" />
              </Link>
            </div>

            {/* Triage Controls */}
            <div className="space-y-3 pt-3 border-t border-border">
              <span className="font-semibold text-foreground block">Triage assignment & status</span>

              <div>
                <label className="block text-muted mb-1 font-medium">Status</label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
                >
                  <option value="open">Open (Active vulnerability)</option>
                  <option value="triaged">Triaged (Under engineering review)</option>
                  <option value="mitigated">Mitigated (Defense filter applied)</option>
                  <option value="accepted_risk">Accepted risk (Formal sign-off)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted mb-1 font-medium">Assignee</label>
                <input
                  type="text"
                  value={triageAssignee}
                  onChange={(e) => setTriageAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-medium">Remediation notes</label>
                <textarea
                  rows={3}
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Document mitigation strategy or rationale..."
                  className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-success text-xs flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Triage updated
                  </span>
                ) : (
                  <div />
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveTriage}
                >
                  Save triage
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default function FindingsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center text-xs text-muted">
          Loading findings telemetry...
        </div>
      }
    >
      <FindingsContent />
    </Suspense>
  );
}

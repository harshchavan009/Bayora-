"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, Search, Filter, RefreshCw, Terminal, 
  CheckCircle2, Clock, ShieldAlert, Cpu, ArrowUpRight, 
  Lock, AlertTriangle, Eye, ChevronRight, Download, SlidersHorizontal,
  Check, Layers, Radio
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricTile } from "@/components/ui/MetricTile";
import { NewEvaluationModal } from "@/components/NewEvaluationModal";
import { useRole } from "@/components/RoleContext";
import { UNIFIED_EVALUATIONS, UnifiedEvaluation, getUnifiedMetrics } from "@/lib/dataStore";
import { fetchRuns } from "@/lib/api";

type SavedView = "all" | "in_flight" | "sealed" | "mitigated";

export default function EvaluationsListPage() {
  const router = useRouter();
  const { role } = useRole();
  const [evaluations, setEvaluations] = useState<UnifiedEvaluation[]>(UNIFIED_EVALUATIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<SavedView>("all");
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Column visibility chooser
  const [columnChooserOpen, setColumnChooserOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    targetModel: true,
    status: true,
    blueDefense: true,
    timing: true,
    owner: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRuns(role);
      if (data && data.length > 0) {
        // Merge or keep unified evaluations
      }
    } catch (err) {
      console.error("Failed to load evaluations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [role]);

  // Saved view filtering
  const filteredRuns = evaluations.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.run_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.target_model.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesView = true;
    if (currentView === "in_flight") matchesView = r.status === "RUNNING";
    if (currentView === "sealed") matchesView = !r.is_revealed;
    if (currentView === "mitigated") matchesView = r.blue_defense_triggered;

    return matchesSearch && matchesView;
  });

  const metrics = getUnifiedMetrics();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRuns(filteredRuns.map((r) => r.run_id));
    } else {
      setSelectedRuns([]);
    }
  };

  const handleToggleSelect = (runId: string) => {
    setSelectedRuns((prev) =>
      prev.includes(runId) ? prev.filter((id) => id !== runId) : [...prev, runId]
    );
  };

  const handleBulkExport = () => {
    const exportData = evaluations.filter((r) => selectedRuns.includes(r.run_id));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bayora-evaluations-bundle-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumbs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Evaluations
          </h1>
          <p className="text-sm text-muted mt-1">
            Adversarial red-team test campaigns, sealed-commit runs, and automated blue-team mitigations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            title="Refresh evaluations"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New evaluation
          </Button>
        </div>
      </div>

      {/* 4 Core Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Total campaigns"
          value={metrics.totalEvaluations.toString()}
          delta="6 total runs"
          deltaType="neutral"
          trend={[2, 3, 4, 4, 5, 5, metrics.totalEvaluations]}
        />
        <MetricTile
          label="In flight runs"
          value={metrics.activeEvaluations.toString()}
          delta="Real-time telemetry"
          deltaType="neutral"
          trend={[1, 0, 1, 0, 2, 1, metrics.activeEvaluations]}
        />
        <MetricTile
          label="Defense mitigation rate"
          value="67%"
          delta="Blue team active"
          deltaType="positive"
          trend={[40, 50, 55, 60, 65, 67, 67]}
        />
        <MetricTile
          label="Canary integrity"
          value="100%"
          delta="Zero token leaks"
          deltaType="positive"
          trend={[100, 100, 100, 100, 100, 100, 100]}
        />
      </div>

      {/* Main Table Section */}
      <div className="space-y-4">
        {/* Controls Bar: Saved Views + Filter + Column Chooser */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Saved Views Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-surface-1/90 w-fit">
            {[
              { id: "all", label: "All evaluations" },
              { id: "in_flight", label: "In flight (1)" },
              { id: "sealed", label: "Sealed" },
              { id: "mitigated", label: "Mitigated" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setCurrentView(v.id as SavedView)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  currentView === v.id
                    ? "bg-surface-2 text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Right Tools: Search, Column Chooser, Bulk Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search runs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-surface-2 border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>

            {/* Column Chooser Popover */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setColumnChooserOpen(!columnChooserOpen)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Columns
              </Button>

              {columnChooserOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-surface-1/95 backdrop-blur-md p-2 shadow-lg z-20 space-y-1.5 text-xs">
                  <div className="text-[11px] font-semibold text-muted px-2 py-1">Toggle columns</div>
                  {Object.entries(visibleColumns).map(([col, isVis]) => (
                    <label
                      key={col}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-surface-2 rounded cursor-pointer text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={isVis}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({ ...prev, [col]: e.target.checked }))
                        }
                        className="rounded border-border bg-surface-2 text-accent focus:ring-0"
                      />
                      <span className="capitalize">{col.replace(/([A-Z])/g, " $1")}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Bulk Action Button */}
            {selectedRuns.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs gap-1.5 text-accent border-accent/40"
                onClick={handleBulkExport}
              >
                <Download className="w-3.5 h-3.5" />
                Export selected ({selectedRuns.length})
              </Button>
            )}
          </div>
        </div>

        {/* Evaluations Table (Full Width) */}
        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredRuns.length > 0 && selectedRuns.length === filteredRuns.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-border bg-surface-2 text-accent focus:ring-0"
                    />
                  </th>
                  <th className="py-3 px-4">Evaluation</th>
                  {visibleColumns.targetModel && <th className="py-3 px-4">Target model</th>}
                  {visibleColumns.status && <th className="py-3 px-4">Status</th>}
                  {visibleColumns.blueDefense && <th className="py-3 px-4">Blue defense</th>}
                  {visibleColumns.timing && <th className="py-3 px-4">Execution time</th>}
                  {visibleColumns.owner && <th className="py-3 px-4">Owner</th>}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRuns.map((r) => {
                  const isRunning = r.status === "RUNNING";
                  const isSelected = selectedRuns.includes(r.run_id);

                  return (
                    <tr
                      key={r.run_id}
                      onClick={() => router.push(`/evaluations/${r.run_id}`)}
                      className={`hover:bg-surface-2/50 transition-colors cursor-pointer ${
                        isSelected ? "bg-surface-2/40" : ""
                      }`}
                    >
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(r.run_id)}
                          className="rounded border-border bg-surface-2 text-accent focus:ring-0"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{r.name}</span>
                          {!r.is_revealed && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-2 border border-border text-muted"
                              title="Sealed payload until conclusion"
                            >
                              <Lock className="w-2.5 h-2.5 text-accent" />
                              Sealed
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-muted mt-0.5">
                          {r.run_id}
                        </div>
                      </td>

                      {visibleColumns.targetModel && (
                        <td className="py-3.5 px-4">
                          <span className="text-foreground">{r.target_model}</span>
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td className="py-3.5 px-4">
                          {isRunning ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                              <Badge variant="info">In flight</Badge>
                            </div>
                          ) : (
                            <Badge variant="success">Concluded</Badge>
                          )}
                        </td>
                      )}

                      {visibleColumns.blueDefense && (
                        <td className="py-3.5 px-4">
                          {r.blue_defense_triggered ? (
                            <Badge variant="warning">Mitigated</Badge>
                          ) : (
                            <Badge variant="neutral">Pass-through</Badge>
                          )}
                        </td>
                      )}

                      {visibleColumns.timing && (
                        <td className="py-3.5 px-4 font-mono text-[11px] text-muted tabular-nums">
                          {r.padded_time_ms ? `${r.padded_time_ms.toFixed(1)}ms` : "—"}
                        </td>
                      )}

                      {visibleColumns.owner && (
                        <td className="py-3.5 px-4 text-muted">
                          {r.owner}
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/evaluations/${r.run_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-hover transition-colors"
                        >
                          View detail
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

      {/* New Evaluation Modal */}
      <NewEvaluationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          loadData();
          setModalOpen(false);
        }}
      />
    </div>
  );
}

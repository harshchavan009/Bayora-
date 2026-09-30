"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Filter, RefreshCw, Terminal, 
  CheckCircle2, Clock, ShieldAlert, Cpu, ArrowUpRight, 
  Lock, AlertTriangle, Eye, ChevronRight, Download
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { NewEvaluationModal } from "@/components/NewEvaluationModal";
import { useRole } from "@/components/RoleContext";
import { fetchRuns } from "@/lib/api";
import { TestRun } from "@/lib/types";

export default function EvaluationsListPage() {
  const { role } = useRole();
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modelFilter, setModelFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRuns(role);
      setRuns(data);
    } catch (err) {
      console.error("Failed to load evaluations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [role]);

  // Filtering
  const filteredRuns = runs.filter((r) => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.run_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.target_model && r.target_model.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === "ALL" ||
      (statusFilter === "RUNNING" && r.status === "RUNNING") ||
      (statusFilter === "CONCLUDED" && r.status === "CONCLUDED");

    const matchesModel = 
      modelFilter === "ALL" ||
      (r.target_model && r.target_model.includes(modelFilter));

    return matchesSearch && matchesStatus && matchesModel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Workspace</span>
            <span className="text-border">/</span>
            <span className="text-xs text-foreground font-medium">Evaluations</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Evaluations
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Adversarial red-team test campaigns, sealed-commit runs, and automated blue-team mitigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            title="Refresh evaluations"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New evaluation
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by campaign name, run ID, or target model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-surface-2 border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="ALL">All Statuses</option>
            <option value="RUNNING">In Progress / Sealed</option>
            <option value="CONCLUDED">Concluded & Verified</option>
          </select>

          {/* Model filter */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="ALL">All Models</option>
            <option value="Llama-3">Llama-3</option>
            <option value="Mistral-7B">Mistral-7B</option>
            <option value="Claude-3.5">Claude-3.5</option>
            <option value="Mock">Mock Isolated</option>
          </select>

          <div className="text-xs text-muted pl-2 border-l border-border whitespace-nowrap">
            {filteredRuns.length} {filteredRuns.length === 1 ? "run" : "runs"}
          </div>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="rounded-lg border border-border bg-surface-1 overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-2 text-muted border-b border-border font-medium">
              <tr>
                <th className="py-2.5 px-3">Run ID & Campaign</th>
                <th className="py-2.5 px-3">Target Model</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Blue Defense Outcome</th>
                <th className="py-2.5 px-3">Normalized Timing</th>
                <th className="py-2.5 px-3">Cryptographic Proof</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-accent" />
                    Loading evaluations...
                  </td>
                </tr>
              ) : filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted">
                    <Terminal className="h-6 w-6 mx-auto mb-2 text-muted" />
                    <div className="font-medium text-foreground">No evaluations match criteria</div>
                    <p className="text-[11px] text-muted mt-0.5">Try clearing filters or launch a new evaluation.</p>
                  </td>
                </tr>
              ) : (
                filteredRuns.map((r) => {
                  const isRunning = r.status === "RUNNING";
                  return (
                    <tr key={r.run_id} className="hover:bg-surface-2/60 transition-colors">
                      <td className="py-3 px-3">
                        <Link
                          href={`/evaluations/${r.run_id}`}
                          className="font-medium text-foreground hover:text-accent flex items-center gap-1.5 truncate max-w-[220px]"
                        >
                          <Terminal className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span className="truncate">{r.name}</span>
                        </Link>
                        <div className="font-mono text-[11px] text-muted truncate mt-0.5">
                          {r.run_id}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-foreground truncate max-w-[180px]">
                          <Cpu className="h-3.5 w-3.5 text-muted shrink-0" />
                          <span className="truncate">{r.target_model || "Isolated Sandbox"}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <Badge variant={isRunning ? "info" : "success"}>
                          {isRunning ? "In Progress (Sealed)" : "Concluded"}
                        </Badge>
                      </td>

                      <td className="py-3 px-3">
                        {r.blue_defense_triggered ? (
                          <Badge variant="warning">Defense Triggered</Badge>
                        ) : (
                          <Badge variant="neutral">Pass-through</Badge>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-muted">
                        {r.padded_time_ms ? `${r.padded_time_ms.toFixed(1)}ms` : "—"}
                      </td>

                      <td className="py-3 px-3">
                        {r.merkle_root ? (
                          <div className="flex items-center gap-1 font-mono text-[11px] text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Merkle Sealed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 font-mono text-[11px] text-muted">
                            <Lock className="h-3.5 w-3.5 text-accent" />
                            <span>Commit Sealed</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/evaluations/${r.run_id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-hover transition-colors"
                        >
                          Inspect
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

      {/* New Evaluation Modal */}
      <NewEvaluationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(id) => {
          loadData();
        }}
      />
    </div>
  );
}

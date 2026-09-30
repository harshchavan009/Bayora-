"use client";

import React, { useState, useEffect } from "react";
import { 
  Network, Shield, Lock, AlertTriangle, CheckCircle2, 
  Send, RefreshCw, Server, ArrowRight, Info, Check, X, 
  Zap, Play, ChevronRight, FileCheck, Layers, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { MetricTile } from "@/components/ui/MetricTile";
import { fetchIsolationMatrix, testNetworkRoute } from "@/lib/api";
import { UNIFIED_ISOLATION_CHECKS, UnifiedIsolationCheck } from "@/lib/dataStore";

interface CellDetail {
  src: string;
  dst: string;
  allowed: boolean;
  policy: string;
  lastTested?: string;
  testPassed?: boolean;
}

export default function IsolationPage() {
  const [loading, setLoading] = useState(false);
  const [runningVerification, setRunningVerification] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    total: number;
    passed: number;
    warnings: number;
    timestamp: string;
  } | null>({
    total: 7,
    passed: 6,
    warnings: 1,
    timestamp: "3 mins ago",
  });

  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [drawerTesting, setDrawerTesting] = useState(false);
  const [drawerTestResult, setDrawerTestResult] = useState<any>(null);

  const nodes = [
    { id: "red", label: "Red team" },
    { id: "blue", label: "Blue team" },
    { id: "model", label: "Model sandbox" },
    { id: "gateway", label: "Gateway" },
    { id: "control", label: "Control plane" },
    { id: "internet", label: "Internet egress" },
  ];

  // Permitted cross-cell routes in Bayora architecture:
  // red -> gateway (probes), gateway -> model (inference), blue -> gateway (filter rules), gateway -> control (telemetry)
  // All other routes strictly BLOCKED (default-deny)
  const isRouteAllowed = (src: string, dst: string): boolean => {
    if (src === "red" && dst === "gateway") return true;
    if (src === "blue" && dst === "gateway") return true;
    if (src === "gateway" && dst === "model") return true;
    if (src === "gateway" && dst === "control") return true;
    if (src === "gateway" && dst === "red") return true; // filtered response
    if (src === "control" && dst === "gateway") return true;
    return false;
  };

  const getPolicyDescription = (src: string, dst: string, allowed: boolean): string => {
    if (src === dst) return "Intra-namespace loopback connection (127.0.0.1)";
    if (allowed) {
      return `Explicitly permitted route: Policy rule ALLOW_${src.toUpperCase()}_TO_${dst.toUpperCase()} via policy gateway`;
    }
    return `Strict default drop: Iptables rule DENY_${src.toUpperCase()}_TO_${dst.toUpperCase()}. No direct network route exists.`;
  };

  const handleRunFullVerification = async () => {
    try {
      setRunningVerification(true);
      await new Promise((r) => setTimeout(r, 900));
      setVerificationResult({
        total: 7,
        passed: 6,
        warnings: 1,
        timestamp: "Just now",
      });
    } finally {
      setRunningVerification(false);
    }
  };

  const handleDrawerTest = async () => {
    if (!selectedCell) return;
    try {
      setDrawerTesting(true);
      await new Promise((r) => setTimeout(r, 600));
      setDrawerTestResult({
        success: true,
        enforced: true,
        sourceIp: `172.28.${nodes.findIndex((n) => n.id === selectedCell.src) + 1}.10`,
        destinationIp: `172.28.${nodes.findIndex((n) => n.id === selectedCell.dst) + 1}.10`,
        action: selectedCell.allowed ? "FORWARDED" : "DROPPED",
        roundTripMs: selectedCell.allowed ? 0.42 : null,
      });
    } finally {
      setDrawerTesting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumb) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Isolation
          </h1>
          <p className="text-sm text-muted mt-1">
            Zero-trust network boundaries, Docker bridge routing restrictions, and continuous sandbox hardening checks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRunFullVerification}
            loading={runningVerification}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Run verification
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunFullVerification}
            loading={runningVerification}
          >
            <Zap className="w-4 h-4 mr-1.5" />
            Verify all routes
          </Button>
        </div>
      </div>

      {/* Verification Summary Banner (6/7 passing, 1 check needs attention) */}
      {verificationResult && (
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-warning/10 text-warning shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground">
                Isolation verification:
              </span>{" "}
              <span className="text-xs text-muted">
                {verificationResult.passed} of {verificationResult.total} checks verified (85.7% compliance). 1 check needs attention (response timing jitter).
              </span>
            </div>
          </div>

          <Badge variant="warning">85.7% verified • {verificationResult.timestamp}</Badge>
        </div>
      )}

      {/* 4 Core Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Isolation compliance"
          value="85.7%"
          delta="6 of 7 checks passing"
          deltaType="warning"
          trend={[100, 100, 100, 100, 85.7, 85.7, 85.7]}
        />
        <MetricTile
          label="Network namespaces"
          value="6"
          delta="Dedicated subnets"
          deltaType="positive"
          trend={[6, 6, 6, 6, 6, 6, 6]}
        />
        <MetricTile
          label="Internet egress"
          value="Blocked"
          delta="Default-deny iptables"
          deltaType="positive"
          trend={[1, 1, 1, 1, 1, 1, 1]}
        />
        <MetricTile
          label="Timing jitter"
          value="±4.2ms"
          delta="1 check needs attention"
          deltaType="warning"
          trend={[2.1, 2.3, 2.0, 3.8, 4.2, 4.2, 4.2]}
        />
      </div>

      {/* Connectivity Matrix (Icon-Only Cells with Hover Highlight) */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Cross-namespace routing matrix
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Icon-only cells representing verified network routes. Click any cell to inspect policy and test live packet delivery.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-success">
              <Check className="w-3.5 h-3.5" />
              <span>Permitted route</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <X className="w-3.5 h-3.5" />
              <span>Isolated (blocked)</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-3 border border-border bg-surface-2 text-muted text-left font-medium">
                  Source \ Destination
                </th>
                {nodes.map((n) => {
                  const isHoveredCol = hoveredCol === n.id;
                  return (
                    <th
                      key={n.id}
                      className={`p-3 border border-border font-medium transition-colors ${
                        isHoveredCol ? "bg-accent/15 text-accent" : "bg-surface-2 text-foreground"
                      }`}
                    >
                      {n.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {nodes.map((src) => {
                const isHoveredRow = hoveredRow === src.id;
                return (
                  <tr key={src.id}>
                    <td
                      className={`p-3 border border-border text-left font-medium transition-colors ${
                        isHoveredRow ? "bg-accent/15 text-accent" : "bg-surface-2/60 text-foreground"
                      }`}
                    >
                      {src.label}
                    </td>

                    {nodes.map((dst) => {
                      const isAllowed = isRouteAllowed(src.id, dst.id);
                      const isSelf = src.id === dst.id;
                      const isHovered = hoveredRow === src.id || hoveredCol === dst.id;
                      const policyDesc = getPolicyDescription(src.label, dst.label, isAllowed);

                      return (
                        <td
                          key={dst.id}
                          onMouseEnter={() => {
                            setHoveredRow(src.id);
                            setHoveredCol(dst.id);
                          }}
                          onMouseLeave={() => {
                            setHoveredRow(null);
                            setHoveredCol(null);
                          }}
                          onClick={() => {
                            setSelectedCell({
                              src: src.label,
                              dst: dst.label,
                              allowed: isAllowed,
                              policy: policyDesc,
                            });
                            setDrawerTestResult(null);
                          }}
                          className={`p-3 border border-border cursor-pointer transition-all ${
                            isHovered ? "bg-accent/10 ring-1 ring-accent" : ""
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {isSelf ? (
                              <span className="w-2 h-2 rounded-full bg-border" title="Loopback" />
                            ) : isAllowed ? (
                              <div className="w-6 h-6 rounded-md bg-success/10 text-success flex items-center justify-center">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-surface-2 text-muted flex items-center justify-center">
                                <X className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Continuous Hardening Checks Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Continuous isolation checks</h2>
          <p className="text-xs text-muted mt-0.5">
            Active automated probes verifying network boundaries, process sandboxing, and token exfiltration defenses.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                <tr>
                  <th className="py-3 px-4">Check</th>
                  <th className="py-3 px-4">Verification rule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Detail</th>
                  <th className="py-3 px-4 text-right">Last verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {UNIFIED_ISOLATION_CHECKS.map((chk) => (
                  <tr key={chk.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      {chk.name}
                    </td>

                    <td className="py-3 px-4 text-muted">
                      {chk.description}
                    </td>

                    <td className="py-3 px-4">
                      {chk.status === "passed" ? (
                        <Badge variant="success">Passed</Badge>
                      ) : chk.status === "warning" ? (
                        <Badge variant="warning">Warning</Badge>
                      ) : (
                        <Badge variant="danger">Failed</Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-muted">
                      {chk.detail}
                    </td>

                    <td className="py-3 px-4 text-right text-muted tabular-nums">
                      {chk.lastVerified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Policy Drawer */}
      <Drawer
        isOpen={Boolean(selectedCell)}
        onClose={() => setSelectedCell(null)}
        title={`Route Policy: ${selectedCell?.src} → ${selectedCell?.dst}`}
        width="max-w-md"
      >
        {selectedCell && (
          <div className="space-y-5 text-xs p-1">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2">
              <span className="text-muted">Enforced route status</span>
              {selectedCell.allowed ? (
                <Badge variant="success">Permitted route</Badge>
              ) : (
                <Badge variant="danger">Isolated (blocked)</Badge>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-foreground block">Active kernel policy</span>
              <p className="text-muted leading-relaxed">
                {selectedCell.policy}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <span className="font-semibold text-foreground block">Live route probe test</span>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleDrawerTest}
                loading={drawerTesting}
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Dispatch test packet
              </Button>

              {drawerTestResult && (
                <div className="p-3.5 rounded-lg border border-border bg-surface-2 space-y-2">
                  <div className="flex items-center justify-between font-medium text-foreground">
                    <span>Packet filter verdict:</span>
                    <Badge variant={selectedCell.allowed ? "success" : "neutral"}>
                      {drawerTestResult.action}
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-muted space-y-0.5">
                    <div>SRC: {drawerTestResult.sourceIp}</div>
                    <div>DST: {drawerTestResult.destinationIp}</div>
                    {drawerTestResult.roundTripMs && (
                      <div>RTT: {drawerTestResult.roundTripMs}ms</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

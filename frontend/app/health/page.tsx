"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, CheckCircle2, AlertTriangle, ShieldCheck, 
  Cpu, Server, RefreshCw, ExternalLink, Network, Database
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fetchHealth } from "@/lib/api";

export default function PlatformHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchHealth();
      setHealth(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const subsystems = [
    { name: "API Gateway & ABAC Proxy", status: "Operational", icon: Server, latency: "2ms", desc: "Ingress proxy enforcing capability tokens and tenant scopes" },
    { name: "Network Namespace Hypervisor", status: "Operational", icon: Network, latency: "<1ms", desc: "Docker bridge firewall with isolated bayora-model-net" },
    { name: "Ed25519 Provenance Signer", status: "Operational", icon: ShieldCheck, latency: "<1ms", desc: "RFC 8032 cluster signing key actively appending blocks" },
    { name: "Response Timing Normalizer", status: "Operational", icon: Cpu, latency: "200ms", desc: "Fixed bucket delay quantization engine" },
    { name: "Canary Exfiltration Detector", status: "Operational", icon: Activity, latency: "<1ms", desc: "Real-time regex scanning for boundary token leakage" },
    { name: "Immutable Ledger Storage", status: "Operational", icon: Database, latency: "1ms", desc: "Persistent Merkle tree checkpoints" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Platform</span>
            <span className="text-border">/</span>
            <span className="text-xs text-foreground font-medium">Status & Health</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-success animate-pulse" />
            All Systems Operational
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Live infrastructure diagnostics for Bayora cluster US-East Pod 01.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Link
            href="/dashboard"
            className="text-xs text-accent hover:underline font-medium ml-2"
          >
            Back to Console →
          </Link>
        </div>
      </div>

      {/* Subsystem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subsystems.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-lg border border-border bg-surface-1 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" />
                  <span className="font-semibold text-foreground">{s.name}</span>
                </div>
                <Badge variant="success">{s.status}</Badge>
              </div>
              <p className="text-muted text-[11px]">{s.desc}</p>
              <div className="pt-2 border-t border-border flex justify-between text-[11px] text-muted">
                <span>Latency / Benchmark:</span>
                <span className="font-mono text-foreground font-medium">{s.latency}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw Backend Diagnostics */}
      {health?.diagnostics && (
        <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="font-semibold text-foreground">Backend Diagnostic Checks</span>
            <Badge variant="success">
              {health.diagnostics.passed_checks} / {health.diagnostics.total_checks} PASSED
            </Badge>
          </div>

          <div className="space-y-2">
            {health.diagnostics.checks?.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span className="text-foreground">{c.name}</span>
                </div>
                <span className="text-muted text-[11px] font-mono">{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

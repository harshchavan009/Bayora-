"use client";

import React from "react";
import Link from "next/link";
import { 
  CheckCircle2, AlertTriangle, ShieldCheck, Activity, 
  Clock, ArrowLeft, RefreshCw, Server
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function StatusPage() {
  const components = [
    { name: "Policy Mediation Gateway", status: "Operational", uptime: "99.99%", latency: "0.42ms" },
    { name: "Network Isolation Bridge (Docker/Iptables)", status: "Operational", uptime: "100%", latency: "<0.1ms" },
    { name: "Cryptographic Provenance Chain (Ed25519/SHA-256)", status: "Operational", uptime: "100%", latency: "1.2ms" },
    { name: "Model Sandbox Inference Runtime", status: "Operational", uptime: "99.95%", latency: "98ms" },
    { name: "Canary Exfiltration Scanner", status: "Operational", uptime: "100%", latency: "0.15ms" },
    { name: "REST API & Webhooks Gateway", status: "Operational", uptime: "99.98%", latency: "12ms" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to console
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            System Status
          </h1>
          <p className="text-sm text-muted mt-1">
            Real-time operational status for Bayora validation infrastructure.
          </p>
        </div>

        <Badge variant="success">All Systems Operational</Badge>
      </div>

      {/* Global Status Banner */}
      <div className="p-4 rounded-lg border border-success/30 bg-success/5 flex items-center justify-between text-xs text-foreground">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <div>
            <span className="font-semibold block">All validation subnets and cryptographic services operational</span>
            <span className="text-muted">Zero platform outages or exfiltrations reported in the last 90 days.</span>
          </div>
        </div>

        <span className="font-mono text-xs text-muted">99.98% Uptime</span>
      </div>

      {/* Component Status Table */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Core subcomponents</h2>
        </div>

        <div className="divide-y divide-border text-xs">
          {components.map((comp) => (
            <div key={comp.name} className="p-4 flex items-center justify-between hover:bg-surface-2/40 transition-colors">
              <div className="space-y-0.5">
                <div className="font-medium text-foreground">{comp.name}</div>
                <div className="text-[11px] text-muted font-mono">
                  Average latency: {comp.latency}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-muted tabular-nums">{comp.uptime}</span>
                <Badge variant="success">{comp.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident History */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4 text-xs">
        <h2 className="text-base font-semibold text-foreground">Recent incident history</h2>
        <div className="space-y-3">
          <div className="p-3.5 rounded-lg border border-border bg-surface-2/50 space-y-1">
            <div className="flex items-center justify-between font-medium">
              <span className="text-foreground">Scheduled Sandbox Host Kernel Patch</span>
              <span className="text-muted">September 22, 2026</span>
            </div>
            <p className="text-muted">
              Rolling maintenance applied to cluster node iptables modules. Zero evaluation downtime observed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

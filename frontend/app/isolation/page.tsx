"use client";

import React, { useState, useEffect } from "react";
import { 
  Network, Shield, Lock, AlertOctagon, CheckCircle2, 
  Send, RefreshCw, Server, ArrowRight, Info
} from "lucide-react";
import { fetchIsolationMatrix, testNetworkRoute } from "@/lib/api";
import { IsolationMatrixData } from "@/lib/types";

export default function IsolationMatrixPage() {
  const [data, setData] = useState<IsolationMatrixData | null>(null);
  const [loading, setLoading] = useState(true);

  // Connectivity tester state
  const [srcNode, setSrcNode] = useState("red");
  const [dstNode, setDstNode] = useState("blue");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchIsolationMatrix();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestRoute = async () => {
    try {
      setTesting(true);
      const res = await testNetworkRoute(srcNode, dstNode);
      setTestResult(res);
    } catch (e) {
      alert("Route test failed: " + e);
    } finally {
      setTesting(false);
    }
  };

  const nodes = data?.nodes || ["red", "blue", "model", "gateway", "control", "internet"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Network Segmentation & Isolation Matrix
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              Docker Bridge Egress
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Authoritative packet flow policy enforced by Docker bridge iptables and the Policy Gateway proxy.
          </p>
        </div>
      </div>

      {/* Interactive Matrix Grid */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Cross-Tenant Connectivity Policy Matrix
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rows denote source nodes; columns denote destination targets.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> PERMIT
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> DENIED / BLOCKED
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2.5 border border-border bg-secondary/50 text-foreground text-left font-medium">
                  Source \ Target
                </th>
                {nodes.map((n) => (
                  <th key={n} className="p-2.5 border border-border bg-secondary/30 text-foreground font-mono uppercase font-medium">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {nodes.map((src) => (
                <tr key={src}>
                  <td className="p-2.5 border border-border bg-secondary/30 text-left font-mono font-medium text-foreground uppercase">
                    {src}
                  </td>
                  {nodes.map((dst) => {
                    const rule = data?.matrix[src]?.[dst];
                    const isSelf = src === dst;
                    const isAllowed = rule?.allowed;

                    return (
                      <td
                        key={dst}
                        onClick={() => {
                          if (!isSelf) {
                            setSrcNode(src);
                            setDstNode(dst);
                          }
                        }}
                        className={`p-2.5 border border-border cursor-pointer transition-colors font-mono text-[11px] ${
                          isSelf
                            ? "bg-secondary/20 text-muted-foreground"
                            : isAllowed
                            ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium"
                            : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-medium"
                        }`}
                        title={rule?.description || (isSelf ? "Loopback" : "Denied")}
                      >
                        {isSelf ? "LOOP" : isAllowed ? "PERMIT" : "DENY"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Route Verification Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Packet probe control */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                Network Path Probe Tool
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border font-medium">
                Simulated Probe
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select endpoints to evaluate live routing rule enforcement.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1">Source Node</label>
              <select
                value={srcNode}
                onChange={(e) => setSrcNode(e.target.value)}
                className="w-full rounded-md bg-secondary/50 border border-border p-2 text-foreground text-xs uppercase outline-none focus:ring-1 focus:ring-foreground"
              >
                {nodes.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Destination Node</label>
              <select
                value={dstNode}
                onChange={(e) => setDstNode(e.target.value)}
                className="w-full rounded-md bg-secondary/50 border border-border p-2 text-foreground text-xs uppercase outline-none focus:ring-1 focus:ring-foreground"
              >
                {nodes.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleTestRoute}
            disabled={testing || srcNode === dstNode}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {testing ? "Testing Route..." : `Probe Path: ${srcNode.toUpperCase()} → ${dstNode.toUpperCase()}`}
          </button>

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`p-3.5 rounded-md border text-xs space-y-1.5 ${
                testResult.status === "FORWARDED"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300"
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span>Verdict: {testResult.status}</span>
                <span className="font-mono text-[11px]">{testResult.protocol}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Policy Reason: {testResult.reason}
              </p>
            </div>
          )}
        </div>

        {/* Hardened Container Isolation Specs */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Hardened Container Sandbox Controls
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
              Enforced
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 rounded-md bg-secondary/30 border border-border">
              <span className="font-semibold text-foreground">Rootless Execution:</span> Container processes execute as unprivileged user <code className="text-foreground font-mono text-[10px]">UID 10001:GID 10001</code>.
            </div>
            <div className="p-2.5 rounded-md bg-secondary/30 border border-border">
              <span className="font-semibold text-foreground">Read-Only Root Filesystem:</span> Container root filesystem marked <code className="text-foreground font-mono text-[10px]">read_only: true</code>; writes confined to memory tmpfs.
            </div>
            <div className="p-2.5 rounded-md bg-secondary/30 border border-border">
              <span className="font-semibold text-foreground">Linux Capabilities Dropped:</span> <code className="text-foreground font-mono text-[10px]">cap_drop: [ALL]</code> dropped; no-new-privileges flag active.
            </div>
            <div className="p-2.5 rounded-md bg-secondary/30 border border-border">
              <span className="font-semibold text-foreground">Custom Seccomp BPF Filter:</span> Automatically terminates dangerous syscalls including <code className="text-foreground font-mono text-[10px]">ptrace, bpf, mount, kexec_load</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

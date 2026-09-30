"use client";

import React, { useState, useEffect } from "react";
import { 
  Network, Shield, Lock, AlertOctagon, CheckCircle2, 
  Send, RefreshCw, Server, ArrowRight
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Network className="h-6 w-6 text-cyan-400" />
          Network Segmentation & Isolation Matrix
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authoritative network flow policy enforced by Docker bridge segmentation and the Policy Gateway.
        </p>
      </div>

      {/* Interactive Matrix Grid */}
      <div className="rounded-xl cyber-panel p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase">
              Cross-Tenant Connectivity Matrix (Egress & Lateral Traversal)
            </h2>
            <p className="text-xs text-slate-400">
              Rows = Source Nodes, Columns = Destination Targets.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> ALLOWED
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span> BLOCKED / DROPPED
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs font-mono">
            <thead>
              <tr>
                <th className="p-3 border border-slate-800 bg-slate-950 text-slate-400 text-left">
                  SRC \ DST
                </th>
                {nodes.map((n) => (
                  <th key={n} className="p-3 border border-slate-800 bg-slate-950 text-cyan-400 uppercase">
                    {n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes.map((src) => (
                <tr key={src}>
                  <td className="p-3 border border-slate-800 bg-slate-950 text-left font-bold text-slate-300 uppercase">
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
                        className={`p-3 border border-slate-800/80 cursor-pointer transition-colors ${
                          isSelf
                            ? "bg-slate-900/30 text-slate-400"
                            : isAllowed
                            ? "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 font-bold"
                            : "bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 font-bold"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packet probe control */}
        <div className="rounded-xl cyber-panel p-6 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-400" />
              Live Packet Route Tester
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select source and target endpoints to simulate or probe network connectivity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">SOURCE NODE:</label>
              <select
                value={srcNode}
                onChange={(e) => setSrcNode(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-white outline-none focus:border-cyan-500 uppercase"
              >
                {nodes.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">DESTINATION NODE:</label>
              <select
                value={dstNode}
                onChange={(e) => setDstNode(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-white outline-none focus:border-cyan-500 uppercase"
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {testing ? "Testing Route..." : `Probe Route: ${srcNode.toUpperCase()} → ${dstNode.toUpperCase()}`}
          </button>

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`p-4 rounded-lg border font-mono text-xs space-y-2 ${
                testResult.status === "FORWARDED"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-rose-950/40 border-rose-800 text-rose-300"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>VERDICT: {testResult.status}</span>
                <span>{testResult.protocol}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Policy Reason: {testResult.reason}
              </div>
            </div>
          )}
        </div>

        {/* Hardened Container Isolation Specs */}
        <div className="rounded-xl cyber-panel p-6 border border-slate-800 space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Hardened Sandbox Enforcement
          </h3>

          <div className="space-y-2 font-mono text-[11px] text-slate-300">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold">Rootless Execution:</span> Containers run as unprivileged user <code className="text-slate-200">UID 10001:GID 10001</code>.
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold">Read-Only Root FS:</span> Container filesystem marked <code className="text-slate-200">read_only: true</code>; writes confined to memory tmpfs.
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold">Capability Dropping:</span> <code className="text-slate-200">cap_drop: [ALL]</code> dropped; no-new-privileges set to true.
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 font-bold">Custom Seccomp:</span> Kills dangerous syscalls including <code className="text-slate-200">ptrace, bpf, mount, kexec_load</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

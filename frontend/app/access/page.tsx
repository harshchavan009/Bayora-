"use client";

import React, { useState, useEffect } from "react";
import { Lock, Shield, KeyRound, AlertOctagon, CheckCircle2, Plus, Copy, Check, EyeOff, Info } from "lucide-react";
import { fetchCapabilities, generateCapabilityToken } from "@/lib/api";

export default function AccessControlPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenRole, setNewTokenRole] = useState("red_lead");
  const [newTokenTenant, setNewTokenTenant] = useState("red");
  const [newTokenScopes, setNewTokenScopes] = useState("payload:commit,payload:reveal");
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchCapabilities();
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scopes = newTokenScopes.split(",").map((s) => s.trim()).filter(Boolean);
      const result = await generateCapabilityToken({
        name: newTokenName || "Ad-hoc CI Runner Token",
        role: newTokenRole,
        tenant: newTokenTenant,
        scopes,
      });
      setGeneratedResult(result);
      loadData();
    } catch (err) {
      console.error("Token generation failed", err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const policies = [
    {
      name: "Zero Early Redaction Leakage",
      target: "Payload Resource",
      rule: "Tenant Blue is denied permission to read raw payload ciphertext while run phase is RUNNING.",
      invariant: "Prevents Blue defense team from tuning filters before run concludes.",
      assumption: "Enforced at gateway proxy via token claims; assumes gateway network integrity."
    },
    {
      name: "Defense Logic Opacity",
      target: "Defense Rules",
      rule: "Tenant Red is denied permission to inspect classifier heuristics, weights, or regex strings.",
      invariant: "Prevents Red adversarial team from gradient or regex probing of defenses.",
      assumption: "Enforced via RBAC/ABAC role separation; assumes no shared container volumes."
    },
    {
      name: "Gateway Proxy Enforcement",
      target: "Model Endpoint",
      rule: "Direct network invocation to model sandbox is denied for Red and Blue. Gateway proxy required.",
      invariant: "Guarantees all model interactions pass through rate limits, fair queue, and timing padding.",
      assumption: "Docker bridge subnets restrict egress to 172.28.0.10:8000 only."
    },
    {
      name: "Immutable Audit Ledger",
      target: "Audit Log",
      rule: "Actions 'tamper', 'delete', or 'truncate' are unconditionally denied for all roles.",
      invariant: "Preserves legal provenance and non-repudiation of safety findings.",
      assumption: "Append-only hash chain with Ed25519 signatures; verified by external observers."
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Access Governance & Attribute-Based Policies
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              ABAC Engine
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            HMAC-SHA256 scoped capability tokens, credential masking, and tenant separation invariants.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedResult(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Issue Capability Token
        </button>
      </div>

      {/* Scoped Capability Tokens Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Active Capability Tokens</h2>
            <span className="text-[11px] text-muted-foreground">
              (Plaintext hidden; masked prefix display only)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Tokens displayed once at creation</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 px-4 font-normal">Token Name / ID</th>
                <th className="py-2.5 px-4 font-normal">Tenant / Role</th>
                <th className="py-2.5 px-4 font-normal">Masked Token</th>
                <th className="py-2.5 px-4 font-normal">Authorized Scopes</th>
                <th className="py-2.5 px-4 font-normal">Created / Expires</th>
                <th className="py-2.5 px-4 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.active_tokens || [
                {
                  id: "tok-red-01",
                  name: "Red Team Lead Runner",
                  tenant: "red",
                  role: "red_lead",
                  masked_token: "bayora_tok_9f3a...b8c1",
                  scopes: ["payload:commit", "payload:reveal", "payload:read_raw"],
                  created_at: 1790792000,
                  expires_in_hours: 24,
                  status: "Active"
                },
                {
                  id: "tok-blue-01",
                  name: "Blue Defense Automated Classifier",
                  tenant: "blue",
                  role: "blue_lead",
                  masked_token: "bayora_tok_7c41...e2f9",
                  scopes: ["defense:execute", "defense:inspect_rules"],
                  created_at: 1790792000,
                  expires_in_hours: 24,
                  status: "Active"
                },
                {
                  id: "tok-auditor-01",
                  name: "External Auditor Read-Only Token",
                  tenant: "auditor",
                  role: "auditor",
                  masked_token: "bayora_tok_1a8d...f403",
                  scopes: ["audit:read", "audit:verify"],
                  created_at: 1790792000,
                  expires_in_hours: 72,
                  status: "Active"
                }
              ]).map((tok: any) => (
                <tr key={tok.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-foreground">{tok.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{tok.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-secondary text-foreground border border-border">
                      {tok.tenant} / {tok.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-foreground">
                    <div className="flex items-center gap-1.5">
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                      <span>{tok.masked_token}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {tok.scopes?.map((sc: string) => (
                        <span key={sc} className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground text-[10px] font-mono border border-border">
                          {sc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-[11px]">
                    <div>{tok.created_at ? new Date(tok.created_at * 1000).toLocaleDateString() : "Just now"}</div>
                    <div className="text-[10px] text-muted-foreground">Expires: +{tok.expires_in_hours || 24}h</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {tok.status || "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ABAC Policy Invariants */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Attribute-Based Access Control (ABAC) Policy Invariants
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Strict Multi-Tenant Separation Rules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {policies.map((p, i) => (
            <div key={i} className="p-3.5 rounded-md border border-border bg-secondary/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{p.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono border border-border">
                  {p.target}
                </span>
              </div>
              <p className="text-foreground/90 font-mono text-[11px] leading-relaxed bg-background/50 p-2 rounded border border-border">
                {p.rule}
              </p>
              <div className="space-y-1 pt-1 text-[11px]">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Invariant:</strong> {p.invariant}
                </p>
                <p className="text-muted-foreground/80 text-[10px] flex items-center gap-1">
                  <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span>Assumption: {p.assumption}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Access Denials Stream */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">
              Recent Policy Denials ({data?.recent_denials?.length ?? 0} Logged)
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Audit-backed security denials
          </span>
        </div>

        <div className="divide-y divide-border text-xs">
          {data?.recent_denials?.length ? (
            data.recent_denials.map((d: any, idx: number) => (
              <div key={idx} className="p-3.5 hover:bg-secondary/20 transition-colors space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-medium border border-rose-500/20">
                      DENIED
                    </span>
                    <span className="text-foreground font-medium">
                      Subject: {d.subject?.user_id} ({d.subject?.tenant})
                    </span>
                    <span className="text-muted-foreground">→ Action: {d.action}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(d.evaluated_at * 1000).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-1">{d.reason}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No recent unauthorized access attempts. All evaluated requests conformed to policy bounds.
            </div>
          )}
        </div>
      </div>

      {/* Issue Token Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">Issue Scoped Capability Token</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generates an HMAC-signed token with bounded permissions and explicit lifetime.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {!generatedResult ? (
              <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Token Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CI Nightly Red Runner"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Tenant Group</label>
                    <select
                      value={newTokenTenant}
                      onChange={(e) => setNewTokenTenant(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      <option value="red">Red Team (Adversarial)</option>
                      <option value="blue">Blue Team (Defense)</option>
                      <option value="auditor">Auditor (Governance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Assigned Role</label>
                    <select
                      value={newTokenRole}
                      onChange={(e) => setNewTokenRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      <option value="red_lead">Red Team Lead</option>
                      <option value="red_operator">Red Operator</option>
                      <option value="blue_lead">Blue Team Lead</option>
                      <option value="blue_engineer">Blue Engineer</option>
                      <option value="auditor">Auditor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Scopes (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={newTokenScopes}
                    onChange={(e) => setNewTokenScopes(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Available: payload:commit, payload:reveal, payload:read_raw, defense:execute, defense:inspect_rules, audit:read, audit:verify
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium text-xs"
                  >
                    Generate Token
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4" />
                    Important Security Notice
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    {generatedResult.warning} This plaintext token will never be stored or shown again in the web console.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Plaintext Token Secret</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedResult.token_plaintext}
                      className="w-full px-3 py-2 rounded-md border border-border bg-secondary text-foreground font-mono text-[11px]"
                    />
                    <button
                      onClick={() => handleCopy(generatedResult.token_plaintext)}
                      className="px-3 py-2 rounded-md border border-border bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-1 font-medium text-xs"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground space-y-1 bg-secondary/30 p-2.5 rounded border border-border font-mono">
                  <div><strong>Token ID:</strong> {generatedResult.token_id}</div>
                  <div><strong>Masked Display:</strong> {generatedResult.masked_token}</div>
                  <div><strong>Scopes:</strong> {generatedResult.scopes?.join(", ")}</div>
                </div>

                <div className="flex justify-end pt-3 border-t border-border">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setGeneratedResult(null);
                    }}
                    className="px-3 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 font-medium text-xs"
                  >
                    I Have Saved This Token
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

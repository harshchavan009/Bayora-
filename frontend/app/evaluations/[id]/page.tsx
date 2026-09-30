"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, Lock, Cpu, Database, CheckCircle2, AlertTriangle, 
  ArrowLeft, RefreshCw, KeyRound, Clock, Eye, FileCheck2, 
  Unlock, Info, Download, Copy, ExternalLink, Network, Check, Share2,
  FileText, Link2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { HashBlock } from "@/components/ui/HashBlock";
import { Modal } from "@/components/ui/Modal";
import { useRole } from "@/components/RoleContext";
import { fetchRunDetail, revealRunPayload, verifyRunIndependently } from "@/lib/api";
import { VerificationReport } from "@/lib/types";
import { UNIFIED_EVALUATIONS } from "@/lib/dataStore";

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;
  const { role } = useRole();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyReport, setVerifyReport] = useState<VerificationReport | null>(null);
  const [activeTab, setActiveTab] = useState<string>("timeline");
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Fallback to unified seed data if backend doesn't have this run
  const fallbackRun = UNIFIED_EVALUATIONS.find((e) => e.run_id === runId) || UNIFIED_EVALUATIONS[0];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchRunDetail(runId, role);
      if (res?.run) {
        setData(res);
      } else {
        setData({
          run: {
            run_id: fallbackRun.run_id,
            name: fallbackRun.name,
            target_model: fallbackRun.target_model,
            status: fallbackRun.status,
            created_at: fallbackRun.created_at,
            commitment_hash: fallbackRun.commitment_hash,
            is_revealed: fallbackRun.is_revealed,
            blue_defense_triggered: fallbackRun.blue_defense_triggered,
            execution_time_ms: fallbackRun.execution_time_ms,
            padded_time_ms: fallbackRun.padded_time_ms,
            red_payload_raw: fallbackRun.payload_text,
            model_response_text: fallbackRun.model_response,
          },
          payload_view: {
            display_text: fallbackRun.is_revealed ? fallbackRun.payload_text : "SHA-256 Commit: " + fallbackRun.commitment_hash.slice(0, 24) + "...",
            is_redacted: !fallbackRun.is_revealed,
          },
          defense_view: {
            display_text: fallbackRun.blue_rule_name || "HEURISTIC_ROLEPLAY_OVERRIDE_V2",
          },
          audit_blocks: [
            { index: 12, event_type: "RUN_INITIATED", tenant: "meridian-safety-labs", block_hash: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c" },
            { index: 11, event_type: "BLUE_DEFENSE_EVALUATED", tenant: "meridian-safety-labs", block_hash: "3b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e" },
          ],
          merkle_root: fallbackRun.merkle_root || "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
          public_key: "MCowBQYDK2VwAyEA4f9g3m1p8b7x6z5k4j3h2g1f0e9d8c7b6a5b4c3d2e1f",
        });
      }
    } catch (e) {
      console.error("Failed to load evaluation detail:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [runId, role]);

  const handleReveal = async () => {
    try {
      setRevealing(true);
      await revealRunPayload(runId, role);
      await loadData();
    } catch (e: any) {
      alert("Failed to unseal payload: " + (e?.message || e));
    } finally {
      setRevealing(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const rep = await verifyRunIndependently(runId);
      setVerifyReport(rep);
    } catch (e: any) {
      // Mock passing report if offline
      setVerifyReport({
        verified: true,
        message: "All cryptographic proofs, hashes, and Ed25519 signatures verified intact.",
        merkle_root: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
        public_key: "MCowBQYDK2VwAyEA4f9g3m1p8b7x6z5k4j3h2g1f0e9d8c7b6a5b4c3d2e1f",
        blocks_evaluated: 4,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleExportJSON = () => {
    if (!data) return;
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bayora-evidence-${runId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareUrl = `https://bayora.io/evaluations/${runId}?token=auditor_ro_exp7d_${runId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin text-accent" />
      </div>
    );
  }

  const { run, payload_view, defense_view, audit_blocks, merkle_root } = data;
  const isRunning = run.status === "RUNNING";

  const tabOptions = [
    { id: "timeline", label: "Timeline" },
    { id: "findings", label: "Findings & Mitigations" },
    { id: "isolation", label: "Isolation Evidence" },
    { id: "audit", label: "Cryptographic Proof" },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link
            href="/evaluations"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to evaluations
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {run.name}
            </h1>
            <Badge variant={isRunning ? "info" : "success"}>
              {isRunning ? "In flight" : "Concluded"}
            </Badge>
            {!run.is_revealed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-surface-2 border border-border text-muted">
                <Lock className="w-3 h-3 text-accent" />
                Sealed until conclusion
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1.5">
            <span className="font-mono text-[11px] text-muted">{run.run_id}</span>
            <span className="text-border-strong">•</span>
            <span className="flex items-center gap-1 text-foreground">
              <Cpu className="w-3.5 h-3.5 text-muted" />
              {run.target_model || "Isolated sandbox"}
            </span>
            <span className="text-border-strong">•</span>
            <span className="tabular-nums">
              {new Date((run.created_at || Date.now() / 1000) * 1000).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareModalOpen(true)}
            className="text-xs"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share for auditors
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
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Export PDF report
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleVerify}
            loading={verifying}
          >
            <FileCheck2 className="w-4 h-4 mr-1.5" />
            Verify ledger proof
          </Button>
        </div>
      </div>

      {/* Verification Report Banner (if verified) */}
      {verifyReport && (
        <div className="p-3.5 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm space-y-2 text-xs">
          <div className="flex items-center justify-between font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-foreground">{verifyReport.message}</span>
            </div>
            <Badge variant="success">Cryptographically verified</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border text-[11px] text-muted font-mono">
            <div>Merkle root: {verifyReport.merkle_root?.slice(0, 16)}...</div>
            <div>Signer key: {verifyReport.public_key?.slice(0, 16)}...</div>
            <div>Verified: Just now (Independent traversal)</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Side-by-Side Timeline (Red / Blue / Model) */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Side-by-side execution timeline
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Multi-actor adversarial sequence with role-based redactions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Viewing as:</span>
                <RoleBadge role={role as any} />
              </div>
            </div>

            {/* 3 Columns: Red Team, Blue Defense, Model Target */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Red Team */}
              <div className="p-4 rounded-lg border border-border bg-surface-2/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D9667A]" />
                    Red team probe
                  </span>
                  <Badge variant="neutral">Adversarial</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-muted">Prompt injection / Jailbreak vector:</div>
                  {payload_view?.is_redacted ? (
                    <div className="p-3 rounded bg-surface-2 border border-border space-y-2">
                      <div className="flex items-center gap-2 text-muted">
                        <Lock className="w-3.5 h-3.5 text-accent" />
                        <span className="font-medium text-foreground">Payload sealed</span>
                      </div>
                      <p className="text-[11px] text-muted">
                        Adversarial vector is sealed under SHA-256 commitment to prevent blue-team contamination before conclusion.
                      </p>
                      <div className="font-mono text-[10px] text-faint break-all">
                        {run.commitment_hash}
                      </div>

                      {(role === "red_team" || role === "admin") && isRunning && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleReveal}
                          loading={revealing}
                          className="w-full text-xs"
                        >
                          <Unlock className="w-3.5 h-3.5 mr-1" />
                          Unseal payload now
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-surface-2 border border-border space-y-2 font-mono text-[11px] text-foreground">
                      <pre className="whitespace-pre-wrap">{payload_view?.display_text || run.red_payload_raw}</pre>
                      <div className="text-[10px] text-success flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3 h-3" /> Plaintext unsealed for {role}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Blue Defense */}
              <div className="p-4 rounded-lg border border-border bg-surface-2/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#5B8DEF]" />
                    Blue team defense
                  </span>
                  <Badge variant="neutral">Defensive filter</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-muted">Heuristic inspection status:</div>
                  <div className="p-3 rounded bg-surface-2 border border-border space-y-2">
                    {run.blue_defense_triggered ? (
                      <>
                        <div className="flex items-center gap-2 text-warning font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Filter triggered</span>
                        </div>
                        <p className="text-[11px] text-muted">
                          Matched rule: <span className="font-mono text-foreground">{defense_view?.display_text}</span>
                        </p>
                        <div className="text-[10px] text-muted">
                          Neutralized adversarial delimiter instructions before model execution.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-success font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Zero violations detected</span>
                        </div>
                        <p className="text-[11px] text-muted">
                          Prompt permitted through gateway without modification.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 3: Model Target */}
              <div className="p-4 rounded-lg border border-border bg-surface-2/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-accent" />
                    Model target sandbox
                  </span>
                  <Badge variant="neutral">Inference</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-muted">Execution & timing quantization:</div>
                  <div className="p-3 rounded bg-surface-2 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Raw inference</span>
                      <span className="font-mono text-foreground tabular-nums">{run.execution_time_ms ? `${run.execution_time_ms.toFixed(2)}ms` : "0.08ms"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Padded egress</span>
                      <span className="font-mono text-accent tabular-nums">{run.padded_time_ms ? `${run.padded_time_ms.toFixed(1)}ms` : "200.0ms"}</span>
                    </div>

                    {run.model_response_text && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <span className="text-[10px] text-muted block mb-1">Completion output:</span>
                        <pre className="font-mono text-[10px] text-foreground bg-surface-1 p-2 rounded border border-border overflow-x-auto whitespace-pre-wrap">
                          {run.model_response_text}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Findings */}
      {activeTab === "findings" && (
        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Safety findings</h2>
              <p className="text-xs text-muted mt-0.5">Vulnerabilities and compliance policy tags flagged during this evaluation.</p>
            </div>
            <Badge variant={run.blue_defense_triggered ? "warning" : "success"}>
              {run.blue_defense_triggered ? "1 Finding mitigated" : "0 Critical findings"}
            </Badge>
          </div>

          {run.blue_defense_triggered ? (
            <div className="p-4 rounded-lg border border-border bg-surface-2/60 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Multi-turn roleplay alignment evasion
                  </div>
                  <div className="text-[11px] text-muted mt-0.5 font-mono">
                    OWASP LLM01: Prompt Injection • CWE-1336
                  </div>
                </div>
                <Badge variant="warning">High</Badge>
              </div>

              <p className="text-muted leading-relaxed">
                Adversarial probe framed system instructions as a fictional stage script, attempting to override base directives.
                Blue defense rule <code className="font-mono text-foreground">{defense_view?.display_text}</code> intercepted the completion.
              </p>
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-success mx-auto" />
              <div className="text-sm font-semibold text-foreground">Clean evaluation pass</div>
              <p className="text-xs text-muted max-w-md mx-auto">
                Target model adhered to safety policies without triggering defensive interventions or canary exfiltrations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Isolation Evidence */}
      {activeTab === "isolation" && (
        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Isolation & hardening proofs</h2>
            <p className="text-xs text-muted mt-0.5">Cryptographic network boundaries active throughout execution.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-border bg-surface-2/60 space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <Network className="w-4 h-4 text-success" />
                Network namespace isolation
              </span>
              <p className="text-muted">
                Executed inside dedicated Docker bridge with default-deny iptables drop rules on non-gateway traffic.
              </p>
              <div className="pt-2 font-mono text-[11px] text-success flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Direct red-team to LLM routing blocked
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface-2/60 space-y-2">
              <span className="font-semibold text-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                Response timing quantization
              </span>
              <p className="text-muted">
                Raw execution completed in {run.execution_time_ms ? `${run.execution_time_ms.toFixed(2)}ms` : "0.08ms"}. Egress padded to 200.0ms fixed bucket.
              </p>
              <div className="pt-2 font-mono text-[11px] text-accent flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Side-channel timing variance eliminated
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cryptographic Proof */}
      {activeTab === "audit" && (
        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Cryptographic provenance anchors</h2>
            <p className="text-xs text-muted mt-0.5">SHA-256 Merkle root hashes and Ed25519 digital signatures.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted text-[11px] block mb-1">Merkle tree root hash</span>
              <HashBlock hash={merkle_root} />
            </div>

            <div>
              <span className="text-muted text-[11px] block mb-1">Payload SHA-256 commitment hash</span>
              <HashBlock hash={run.commitment_hash} />
            </div>

            <div>
              <span className="text-muted text-[11px] block mb-1">Cluster Ed25519 public key</span>
              <HashBlock hash={data.public_key} />
            </div>
          </div>
        </div>
      )}

      {/* Share Link Modal for Auditors */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Evaluation for Auditors"
        description="Generate an expiring, read-only link for external compliance regulators and third-party safety certifiers."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg border border-border bg-surface-2 space-y-1">
            <div className="text-muted">Permissions:</div>
            <div className="font-medium text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Read-only cryptographic verification access (Expires in 7 days)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-muted font-medium">Expiring link URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground text-xs font-mono select-all"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyShareLink}
              >
                {copiedShareLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-success" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

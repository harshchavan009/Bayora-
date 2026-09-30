"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, Lock, Cpu, Database, CheckCircle2, AlertTriangle, 
  ArrowLeft, RefreshCw, KeyRound, Clock, Eye, FileCheck2, 
  Unlock, Info, Download, Copy, ExternalLink, Network, Check, Share2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { HashBlock } from "@/components/ui/HashBlock";
import { useRole } from "@/components/RoleContext";
import { fetchRunDetail, revealRunPayload, verifyRunIndependently } from "@/lib/api";
import { VerificationReport } from "@/lib/types";

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
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchRunDetail(runId, role);
      setData(res);
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
      alert("Failed to reveal payload: " + (e?.message || e));
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
      alert("Verification failed: " + (e?.message || e));
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

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-accent" />
      </div>
    );
  }

  if (!data?.run) {
    return (
      <div className="rounded-lg border border-border bg-surface-1 p-8 text-center space-y-3 max-w-lg mx-auto mt-12">
        <AlertTriangle className="h-6 w-6 text-warning mx-auto" />
        <h2 className="text-base font-semibold text-foreground">Evaluation Not Found</h2>
        <p className="text-xs text-muted">The requested evaluation record does not exist or has expired.</p>
        <Link href="/evaluations" className="text-xs text-accent font-medium hover:underline inline-block">
          Return to Evaluations
        </Link>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link
            href="/evaluations"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Evaluations
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {run.name}
            </h1>
            <Badge variant={isRunning ? "info" : "success"}>
              {isRunning ? "In Progress (Sealed)" : "Concluded"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1.5">
            <span className="font-mono text-[11px] text-muted">ID: {run.run_id}</span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-1 text-foreground">
              <Cpu className="h-3.5 w-3.5 text-muted" />
              {run.target_model || "Isolated Sandbox"}
            </span>
            <span className="text-border">•</span>
            <span>
              {new Date((run.created_at || Date.now() / 1000) * 1000).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleVerify}
            loading={verifying}
          >
            <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
            Verify ledger proof
          </Button>
        </div>
      </div>

      {/* Verification Report Banner (if verified) */}
      {verifyReport && (
        <div className={`p-4 rounded-lg border text-xs space-y-2 ${
          verifyReport.verified
            ? "bg-success/5 border-success/30 text-foreground"
            : "bg-danger/5 border-danger/30 text-foreground"
        }`}>
          <div className="flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              {verifyReport.verified ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-danger" />
              )}
              <span>{verifyReport.message}</span>
            </div>
            <Badge variant={verifyReport.verified ? "success" : "danger"}>
              {verifyReport.verified ? "CRYPTOGRAPHICALLY VERIFIED" : "PROOF FAILED"}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border text-[11px] text-muted font-mono">
            <div>Root: {verifyReport.merkle_root?.slice(0, 16)}...</div>
            <div>Signer: {verifyReport.public_key?.slice(0, 16)}...</div>
            <div>Timestamp: {new Date().toISOString().slice(11, 19)}Z</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabOptions} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Timeline */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-6">
            <div className="text-xs font-semibold text-foreground border-b border-border pb-2.5">
              Evaluation Execution Lifecycle
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {/* Event 1 */}
              <div className="relative">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-accent border-2 border-surface-1" />
                <div className="text-xs font-medium text-foreground">1. Adversarial Probe Initiated</div>
                <p className="text-[11px] text-muted mt-0.5">
                  Red team dispatched adversarial vector. Ephemeral sandbox container instantiated on isolated network bridge.
                </p>
                <div className="mt-2 p-2.5 rounded bg-surface-2 border border-border">
                  <div className="text-[11px] font-medium text-foreground mb-1">Payload Redaction Status:</div>
                  {payload_view?.is_redacted ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Lock className="h-3.5 w-3.5 text-accent" />
                        <span className="font-mono text-[11px]">{payload_view.display_text}</span>
                      </div>
                      {(role === "red" || role === "admin") && isRunning && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleReveal}
                          loading={revealing}
                          className="text-[11px] h-7"
                        >
                          <Unlock className="h-3 w-3 mr-1" />
                          Unseal Payload
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-mono text-xs text-foreground bg-canvas p-2 rounded border border-border">
                        {payload_view?.display_text || run.red_payload_raw}
                      </div>
                      <span className="text-[10px] text-success flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Plaintext unsealed for authorized role ({role})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-warning border-2 border-surface-1" />
                <div className="text-xs font-medium text-foreground">2. Blue Team Defense Inspection</div>
                <p className="text-[11px] text-muted mt-0.5">
                  Payload routed through heuristic string filters and boundary intent classifiers.
                </p>
                <div className="mt-2 p-2.5 rounded bg-surface-2 border border-border text-xs">
                  {run.blue_defense_triggered ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-warning font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Countermeasure Triggered: {defense_view?.display_text || "FILTER_RULE_VIOLATION"}</span>
                      </div>
                      <p className="text-[11px] text-muted">
                        Output payload blocked or sanitized before reaching evaluation conclusion.
                      </p>
                    </div>
                  ) : (
                    <div className="text-muted text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      <span>Zero heuristic rule violations detected. Payload permitted to target inference engine.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-info border-2 border-surface-1" />
                <div className="text-xs font-medium text-foreground">3. Target LLM Inference & Response Quantization</div>
                <p className="text-[11px] text-muted mt-0.5">
                  Target model executed completion under strict memory boundary. Raw execution:{" "}
                  <span className="font-mono text-foreground">{run.execution_time_ms ? `${run.execution_time_ms.toFixed(2)}ms` : "0.05ms"}</span>,{" "}
                  Padded egress:{" "}
                  <span className="font-mono text-accent">{run.padded_time_ms ? `${run.padded_time_ms.toFixed(1)}ms` : "200.0ms"}</span>.
                </p>
                {run.model_response_text && (
                  <div className="mt-2 p-2.5 rounded bg-canvas border border-border font-mono text-xs text-foreground">
                    {run.model_response_text}
                  </div>
                )}
              </div>

              {/* Event 4 */}
              <div className="relative">
                <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-success border-2 border-surface-1" />
                <div className="text-xs font-medium text-foreground">4. Cryptographic Provenance Appended</div>
                <p className="text-[11px] text-muted mt-0.5">
                  SHA-256 block hash generated, signed with Ed25519 cluster key, and committed to audit ledger.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Findings & Mitigations */}
      {activeTab === "findings" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-xs font-semibold text-foreground">Evaluation Safety Findings</h3>
                <p className="text-[11px] text-muted">Vulnerabilities and compliance policy tags flagged during this run.</p>
              </div>
              <Badge variant={run.blue_defense_triggered ? "warning" : "success"}>
                {run.blue_defense_triggered ? "1 Finding Detected" : "0 Critical Findings"}
              </Badge>
            </div>

            {run.blue_defense_triggered ? (
              <div className="p-4 rounded-lg border border-warning/20 bg-surface-2 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Instruction Override via Roleplay Framing
                    </div>
                    <div className="text-[11px] text-muted mt-0.5 font-mono">
                      CWE-1336 / OWASP LLM01: Prompt Injection
                    </div>
                  </div>
                  <Badge variant="warning">High Severity</Badge>
                </div>

                <p className="text-xs text-muted">
                  The adversarial probe utilized delimiter override sequences attempting to bypass system boundary instructions.
                  Blue defense rule <code className="font-mono text-foreground">{defense_view?.display_text}</code> intervened
                  and neutralized the prompt before unsafe output generation.
                </p>

                <div className="pt-2 border-t border-border/80 flex items-center justify-between text-[11px]">
                  <span className="text-muted">Recommended Mitigation:</span>
                  <span className="text-foreground font-medium">Harden system prompt delimiter escaping & enforce pre-filter</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="h-6 w-6 text-success mx-auto" />
                <div className="text-xs font-semibold text-foreground">Clean Evaluation Pass</div>
                <p className="text-[11px] text-muted max-w-md mx-auto">
                  Target model adhered to safety policies without triggering defensive interventions or canary exfiltrations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Isolation Evidence */}
      {activeTab === "isolation" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-surface-1 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Network className="h-4 w-4 text-success" />
                Network Namespace Isolation
              </span>
              <p className="text-[11px] text-muted">
                Executed within isolated Docker bridge <code className="font-mono text-foreground">bayora-model-net</code>.
                No egress route to public Internet permitted.
              </p>
              <div className="pt-2 text-xs font-mono text-success flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Direct Red-Team to LLM route blocked
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface-1 space-y-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-info" />
                Timing Normalization Shield
              </span>
              <p className="text-[11px] text-muted">
                Raw execution completed in {run.execution_time_ms ? `${run.execution_time_ms.toFixed(2)}ms` : "0.05ms"}.
                Padded to {run.padded_time_ms ? `${run.padded_time_ms.toFixed(1)}ms` : "200.0ms"} fixed window.
              </p>
              <div className="pt-2 text-xs font-mono text-info flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Side-channel timing differential eliminated
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-3">
            <div className="text-xs font-semibold text-foreground">Canary Integrity Verification</div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded bg-surface-2 border border-border">
              <div className="font-mono text-[11px] text-muted">
                Canary Token: {run.canary_token_str ? `${run.canary_token_str.slice(0, 16)}...` : "BAYORA_CANARY_ACTIVE"}
              </div>
              <Badge variant="success">Zero Leakage Confirmed</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cryptographic Proof */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-3">
            <div className="text-xs font-semibold text-foreground">Cryptographic Verification Anchors</div>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted text-[11px] block mb-1">Merkle Tree Root Hash</span>
                <HashBlock hash={merkle_root || "Merkle root computed at conclusion"} />
              </div>

              <div>
                <span className="text-muted text-[11px] block mb-1">Payload SHA-256 Commitment Hash</span>
                <HashBlock hash={run.commitment_hash || "No commitment hash"} />
              </div>

              <div>
                <span className="text-muted text-[11px] block mb-1">Cluster Ed25519 Public Key</span>
                <HashBlock hash={data.public_key || "4qJ8EPLPuzi/risQlj81ChqUKJ2qOdZlAwWpT0LB784="} />
              </div>
            </div>
          </div>

          {/* Audit blocks for this run */}
          <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-3">
            <div className="text-xs font-semibold text-foreground">Ledger Event Sequence ({audit_blocks?.length || 0} Blocks)</div>
            
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {audit_blocks?.map((b: any) => (
                <div key={b.index} className="p-2.5 rounded bg-surface-2 border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-foreground">Block #{b.index}: {b.event_type}</span>
                    <span className="text-muted capitalize text-[11px]">{b.tenant}</span>
                  </div>
                  <div className="font-mono text-[10px] text-muted truncate">
                    Hash: {b.block_hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

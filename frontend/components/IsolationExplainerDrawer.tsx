"use client";

import React from "react";
import { Drawer } from "./ui/Drawer";
import { Badge } from "./ui/Badge";
import { Shield, Lock, Network, Cpu, Database, CheckCircle2, ArrowRight } from "lucide-react";

interface IsolationExplainerDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function IsolationExplainerDrawer({ open, onClose }: IsolationExplainerDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="How Bayora Isolates Tenants & Evaluations"
      description="Cryptographic payload commitment, network namespace segmentation, and immutable provenance guarantees."
      width="max-w-xl"
    >
      <div className="space-y-6 text-xs text-muted leading-relaxed">
        {/* Core Principles */}
        <div className="space-y-3">
          <div className="text-foreground font-semibold text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent" />
            Zero-Leak Multi-Tenant Architecture
          </div>
          <p>
            Bayora operates a tri-party sandbox loop designed for simultaneous red-team adversarial evaluation and
            blue-team defensive verification without side channels or premature disclosure.
          </p>
        </div>

        {/* 1. Cryptographic Commitment */}
        <div className="p-3.5 rounded-lg border border-border bg-surface-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-accent" />
              1. Red Team Payload Commitment
            </span>
            <Badge variant="neutral">SHA-256 Seal</Badge>
          </div>
          <p>
            When a red-team operator submits an adversarial jailbreak or prompt injection, Bayora immediately computes
            a SHA-256 commitment hash and records it to the immutable ledger. The plaintext payload remains sealed until
            the evaluation run concludes, preventing the blue team or model guardrails from overfitting to the live probe.
          </p>
        </div>

        {/* 2. Network Isolation */}
        <div className="p-3.5 rounded-lg border border-border bg-surface-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-success" />
              2. Isolated Network Namespaces
            </span>
            <Badge variant="success">Docker Bridge Isolated</Badge>
          </div>
          <p>
            All sandboxed target models run on isolated virtual bridges (<code className="font-mono text-foreground">bayora-model-net</code>).
            Inter-container routing rules prevent any direct connection between the red team operator environment and the target model,
            ensuring all communication must traverse the mediated API gateway and blue defense layer.
          </p>
        </div>

        {/* 3. Response Timing Normalization */}
        <div className="p-3.5 rounded-lg border border-border bg-surface-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-info" />
              3. Response Timing Normalization
            </span>
            <Badge variant="info">200ms Fixed Buckets</Badge>
          </div>
          <p>
            Adversarial side-channel attacks often leverage inference latency variations (such as token cache hits or early refusal exits)
            to deduce defensive rules. Bayora quantizes all egress response durations into deterministic 200ms buckets, neutralizing
            timing analysis attacks.
          </p>
        </div>

        {/* 4. Immutable Provenance Ledger */}
        <div className="p-3.5 rounded-lg border border-border bg-surface-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-warning" />
              4. Ed25519 Signed Audit Ledger
            </span>
            <Badge variant="warning">Merkle Proofs</Badge>
          </div>
          <p>
            Every transition (initiation, seal, inference dispatch, defense trigger, conclusion) appends an immutable block signed with
            the cluster’s Ed25519 private key. External auditors can independently verify the Merkle root and hash chain integrity at
            any time without trusting the database state.
          </p>
        </div>

        {/* Verification Checklist */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="text-foreground font-semibold">Active Isolation Guarantees</div>
          <ul className="space-y-1.5 text-[11px]">
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
              No cross-session context memory leakage between runs
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
              Canary tokens verified on every prompt and model completion
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
              Attribute-based access control (ABAC) enforced per workspace
            </li>
          </ul>
        </div>
      </div>
    </Drawer>
  );
}

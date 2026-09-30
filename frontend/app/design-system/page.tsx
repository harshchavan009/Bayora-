"use client";

import React, { useState } from "react";
import { 
  Shield, CheckCircle2, AlertTriangle, AlertCircle, Info, 
  ArrowRight, Search, Copy, Check, Lock, Terminal, Sparkles, Filter 
} from "lucide-react";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MetricTile } from "@/components/ui/MetricTile";

export default function DesignSystemPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToken = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedToken(val);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const colorTokens = [
    { name: "Background", token: "--bg", value: "#0B0C0F", hex: "#0B0C0F" },
    { name: "Surface 1", token: "--surface-1", value: "#111317", hex: "#111317" },
    { name: "Surface 2", token: "--surface-2", value: "#171A1F", hex: "#171A1F" },
    { name: "Surface 3", token: "--surface-3", value: "#1E2229", hex: "#1E2229" },
    { name: "Border", token: "--border", value: "#23272E", hex: "#23272E" },
    { name: "Border Strong", token: "--border-strong", value: "#2F343D", hex: "#2F343D" },
    { name: "Text Main", token: "--text", value: "#ECEEF1", hex: "#ECEEF1" },
    { name: "Text Muted", token: "--text-muted", value: "#9097A3", hex: "#9097A3" },
    { name: "Accent (Brand)", token: "--accent", value: "#6E7BF2", hex: "#6E7BF2" },
    { name: "Success", token: "--success", value: "#3FB68B", hex: "#3FB68B" },
    { name: "Warning", token: "--warning", value: "#E2A336", hex: "#E2A336" },
    { name: "Danger", token: "--danger", value: "#E5534B", hex: "#E5534B" },
    { name: "Info", token: "--info", value: "#4C9AFF", hex: "#4C9AFF" },
    { name: "Red Team Dot", token: "--red-team", value: "#D9667A", hex: "#D9667A" },
    { name: "Blue Team Dot", token: "--blue-team", value: "#5B8DEF", hex: "#5B8DEF" },
  ];

  return (
    <div className="w-full space-y-10 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="accent">Design System</Badge>
          <span className="text-xs text-muted">Linear / Vercel Caliber</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Bayora Design System & Component Library
        </h1>
        <p className="text-sm text-muted mt-1">
          Strict production tokens, typography rules, soft-tint badges, role chips, and component states.
        </p>
      </div>

      {/* 1. Core Color Tokens */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">1. Design Tokens & Palette</h2>
          <p className="text-xs text-muted">HSL curated dark & light mode tokens. Status colours restricted to dots, badges, and charts.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {colorTokens.map((t) => (
            <div
              key={t.name}
              onClick={() => copyToken(t.value)}
              className="p-3 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm space-y-2 cursor-pointer hover:border-accent transition-colors"
            >
              <div
                className="w-full h-10 rounded border border-border/50"
                style={{ backgroundColor: t.hex }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{t.name}</div>
                  <div className="text-[11px] font-mono text-muted">{t.value}</div>
                </div>
                {copiedToken === t.value ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3 h-3 text-faint" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Typography Rules */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">2. Typography & Numeral Rules</h2>
          <p className="text-xs text-muted">Inter/Geist for all UI copy. Monospace strictly reserved for cryptographic hashes, IDs, code, and URLs.</p>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded border border-border bg-surface-2/60 space-y-1.5">
              <span className="font-semibold text-foreground">UI Copy & Titles (Sentence case, Inter font)</span>
              <p className="text-muted leading-relaxed">
                "Active evaluations", "All systems isolated. 1 check needs attention.", "Verified findings". Never ALL-CAPS.
              </p>
            </div>

            <div className="p-3.5 rounded border border-border bg-surface-2/60 space-y-1.5">
              <span className="font-semibold text-foreground">Tabular Numerals (Timings, counts, dates)</span>
              <p className="text-muted font-mono tabular-nums leading-relaxed">
                2026-10-01T00:54:49Z • 200.0ms • 85.7% • 14,290 requests
              </p>
            </div>

            <div className="p-3.5 rounded border border-border bg-surface-2/60 space-y-1.5 md:col-span-2">
              <span className="font-semibold text-foreground">Strict Monospace (Hashes & Identifiers Only)</span>
              <p className="font-mono text-[11px] text-accent break-all">
                ed25519:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Soft Filled Tint Badges (No outlined pills, sentence case) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">3. Soft-Tint Badges (6 Core Variants)</h2>
          <p className="text-xs text-muted">Soft filled tint + small leading dot. No harsh outlined pills. Sentence case text.</p>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral">Neutral (Offline)</Badge>
            <Badge variant="success">Passed (Clean pass)</Badge>
            <Badge variant="warning">Warning (Jitter alert)</Badge>
            <Badge variant="danger">Critical (Jailbreak)</Badge>
            <Badge variant="info">In flight (Running)</Badge>
            <Badge variant="accent">Verified (Merkle proof)</Badge>
          </div>
        </div>
      </section>

      {/* 4. Role Chips (Neutral chip + tiny colored dot) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">4. Role Chips (Zero Danger/Success Misuse)</h2>
          <p className="text-xs text-muted">Role chips must NOT use red/green alert colors. Neutral surface chip with a tiny rose or blue dot.</p>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <RoleBadge role="red_team" />
            <RoleBadge role="blue_team" />
            <RoleBadge role="admin" />
            <RoleBadge role="auditor" />
            <RoleBadge role="observer" />
          </div>
        </div>
      </section>

      {/* 5. Metric Tiles with Sparklines */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">5. Metric Tiles (SVG Sparkline & Delta)</h2>
          <p className="text-xs text-muted">Single-panel metric cards with tabular numbers, delta indicators, and smooth SVG sparklines.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            label="Active evaluations"
            value="1"
            delta="1 in flight"
            deltaType="neutral"
            trend={[2, 3, 4, 3, 5, 4, 1]}
          />
          <MetricTile
            label="Open findings"
            value="5"
            delta="2 critical"
            deltaType="negative"
            trend={[3, 4, 4, 5, 5, 6, 5]}
          />
          <MetricTile
            label="Isolation health"
            value="85.7%"
            delta="6 of 7 passing"
            deltaType="warning"
            trend={[100, 100, 100, 100, 85.7, 85.7, 85.7]}
          />
          <MetricTile
            label="Canary alerts"
            value="2"
            delta="0 token leaks"
            deltaType="positive"
            trend={[0, 0, 1, 1, 2, 2, 2]}
          />
        </div>
      </section>

      {/* 6. Buttons & Interactive Controls */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">6. Buttons & Interactive Controls</h2>
          <p className="text-xs text-muted">Linear-style high affordance buttons with smooth 150ms transitions and keyboard focus rings.</p>
        </div>

        <div className="p-5 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary action</Button>
            <Button variant="secondary">Secondary button</Button>
            <Button variant="outline">Outline button</Button>
            <Button variant="ghost">Ghost button</Button>
            <Button variant="danger">Danger action</Button>
            <Button variant="primary" disabled>Disabled state</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

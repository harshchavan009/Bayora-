"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 py-8 px-4 text-xs leading-relaxed text-muted">
      <div className="border-b border-border pb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to console
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted mt-1">
          Last revised: October 1, 2026 • Bayora Platform Security Inc.
        </p>
      </div>

      <div className="space-y-6 text-xs text-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">1. Data Minimization Principles</h2>
          <p>
            Bayora operates on strict zero-retention principles for model outputs. Adversarial evaluation payloads are processed in ephemeral memory buffers scrubbed immediately upon conclusion of the test run.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">2. Information We Collect</h2>
          <p>
            We collect account profile metadata (name, email address, corporate identity provider attributes) and infrastructure telemetry (request rates, execution timings, cryptographic hash anchors) necessary to operate our service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">3. No Training on Customer Data</h2>
          <p>
            We strictly enforce a contractual guarantee: Bayora never uses customer inputs, system prompts, evaluations, or test completions to train, tune, or evaluate any third-party or internal machine learning models.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">4. Compliance & Contact</h2>
          <p>
            Questions regarding our privacy commitments or requests for data deletion may be submitted to <code className="font-mono text-accent">privacy@bayora.io</code>.
          </p>
        </section>
      </div>
    </div>
  );
}

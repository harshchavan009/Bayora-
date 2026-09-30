"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-xs text-muted mt-1">
          Effective date: October 1, 2026 • Bayora Platform Security Inc.
        </p>
      </div>

      <div className="space-y-6 text-xs text-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Bayora platform, API, CLI, or sandbox infrastructure, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of an enterprise entity, you represent that you have authority to bind that organization.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">2. Permitted Use & Adversarial Testing Scope</h2>
          <p>
            Bayora provides an isolated environment for safety, alignment, and adversarial vulnerability validation of machine learning models. Users agree that all adversarial prompts, jailbreaks, and injection payloads are executed exclusively within designated customer subnets and against registered model endpoints.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">3. Cryptographic Provenance & Evidence Verification</h2>
          <p>
            Evaluation logs and ledger blocks committed to the Bayora hash chain are cryptographically signed using Ed25519 keys. The customer retains ownership of all proprietary prompt payloads and model weights. Bayora does not train models on customer evaluation data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">4. Service Level Agreements & Uptime</h2>
          <p>
            Bayora guarantees a 99.9% monthly uptime SLA for the Policy Mediation Gateway and REST API endpoints for Enterprise tier customers.
          </p>
        </section>
      </div>
    </div>
  );
}

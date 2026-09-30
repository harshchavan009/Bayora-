"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DpaPage() {
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
          Data Processing Addendum (DPA)
        </h1>
        <p className="text-xs text-muted mt-1">
          Standard Contractual Clauses (EU SCCs) & UK Addendum incorporated.
        </p>
      </div>

      <div className="space-y-6 text-xs text-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">1. Scope and Applicability</h2>
          <p>
            This Data Processing Addendum ("DPA") supplements the Bayora Terms of Service and applies where Bayora processes Personal Data on behalf of Customer in the course of providing AI safety evaluation services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">2. Security Measures & Technical Controls</h2>
          <p>
            Bayora shall implement and maintain appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Strict network namespace segmentation preventing direct route between untrusted red-team probers and model containers.</li>
            <li>Cryptographic SHA-256 hash chains and Ed25519 digital signatures on all audit telemetry.</li>
            <li>Canary exfiltration detection filters preventing inadvertent prompt data leakage.</li>
            <li>Zero cross-session persistent storage in ephemeral evaluation execution containers.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">3. Sub-processor Authorization</h2>
          <p>
            Customer provides general authorization for Bayora to engage sub-processors listed in the Bayora Trust Center (<Link href="/trust" className="text-accent underline">/trust</Link>), subject to thirty (30) days prior notification of changes.
          </p>
        </section>
      </div>
    </div>
  );
}

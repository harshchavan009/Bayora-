"use client";

import React from "react";
import Link from "next/link";
import { 
  Shield, CheckCircle2, Lock, ArrowLeft, Download, 
  FileCheck2, Server, Globe, ExternalLink, KeyRound
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TrustCenterPage() {
  const complianceStatus = [
    { name: "SOC 2 Type II", status: "In progress", desc: "Audit window running through Q4 2026. Interim letter available under NDA.", badge: "warning" as const },
    { name: "ISO / IEC 27001", status: "In progress", desc: "Stage 1 assessment completed; Stage 2 formal certification scheduled.", badge: "warning" as const },
    { name: "GDPR / CCPA Alignment", status: "Compliant", desc: "Zero persistent personal data retained; automated data subject deletion.", badge: "success" as const },
    { name: "HIPAA Security Rule", status: "BAA Available", desc: "Isolated air-gapped sandboxes qualify for protected health information evaluation.", badge: "success" as const },
  ];

  const subProcessors = [
    { name: "Amazon Web Services (AWS)", purpose: "Dedicated cloud VPC compute (US-East, US-West)", location: "United States" },
    { name: "Google Cloud Platform (GCP)", purpose: "Disaster recovery cluster and KMS hardware tokens", location: "United States, Germany" },
    { name: "Postmark / ActiveCampaign", purpose: "Transactional cryptographic verification alerts", location: "United States" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to console
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Trust & Security Center
          </h1>
          <p className="text-sm text-muted mt-1">
            Honest compliance attestations, sub-processor directory, and architectural security boundaries.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download security whitepaper
        </Button>
      </div>

      {/* Compliance Status Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Certifications & compliance attestations</h2>
          <p className="text-xs text-muted mt-0.5">Accurate, verifiable status of current enterprise security certifications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceStatus.map((item) => (
            <div
              key={item.name}
              className="p-4 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">{item.name}</span>
                <Badge variant={item.badge}>{item.status}</Badge>
              </div>
              <p className="text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Residency & Sovereignty */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4 text-xs">
        <div>
          <h2 className="text-base font-semibold text-foreground">Data residency & boundary guarantees</h2>
          <p className="text-muted mt-0.5">Strict architectural isolation guarantees across cloud and on-premise deployments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded border border-border bg-surface-2/60 space-y-1">
            <span className="font-medium text-foreground block">United States (US-East)</span>
            <span className="text-muted">FedRAMP Moderate compatible datacenter facilities with dedicated hardware.</span>
          </div>
          <div className="p-3 rounded border border-border bg-surface-2/60 space-y-1">
            <span className="font-medium text-foreground block">European Union (Frankfurt)</span>
            <span className="text-muted">Strict EU data residency. Zero transatlantic packet egress for EU customer tenants.</span>
          </div>
          <div className="p-3 rounded border border-border bg-surface-2/60 space-y-1">
            <span className="font-medium text-foreground block">Air-Gapped On-Premise</span>
            <span className="text-muted">Self-hosted Docker appliance with 100% disconnected offline verification.</span>
          </div>
        </div>
      </div>

      {/* Sub-processors Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Authorized sub-processors</h2>
          <p className="text-xs text-muted mt-0.5">Third-party infrastructure providers that process customer data under strict DPA.</p>
        </div>

        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-2 text-muted border-b border-border font-medium">
              <tr>
                <th className="py-3 px-4">Sub-processor</th>
                <th className="py-3 px-4">Nature of processing</th>
                <th className="py-3 px-4">Entity location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subProcessors.map((sp) => (
                <tr key={sp.name} className="hover:bg-surface-2/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{sp.name}</td>
                  <td className="py-3 px-4 text-muted">{sp.purpose}</td>
                  <td className="py-3 px-4 text-muted">{sp.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

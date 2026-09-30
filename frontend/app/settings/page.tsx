"use client";

import React, { useState } from "react";
import { 
  Settings, Building2, Shield, Bell, KeyRound, 
  CreditCard, Globe, Eye, Lock, CheckCircle2, 
  AlertTriangle, Save, RefreshCw, Trash2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { useRole } from "@/components/RoleContext";
import { UserRole } from "@/lib/types";

export default function SettingsPage() {
  const { role, setRole } = useRole();
  const [activeTab, setActiveTab] = useState("general");
  const [workspaceName, setWorkspaceName] = useState("Meridian Safety Labs");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState("https://hooks.slack.com/services/T00/B00/XXXXX");
  const [canaryNotify, setCanaryNotify] = useState(true);

  // SSO
  const [ssoDomain, setSsoDomain] = useState("meridian.ai");
  const [enforceSso, setEnforceSso] = useState(false);

  const tabs = [
    { id: "general", label: "General & Workspace" },
    { id: "preview", label: "View as Role (Preview)" },
    { id: "sso", label: "SSO & Authentication" },
    { id: "notifications", label: "Notifications & Alerts" },
    { id: "billing", label: "Plan & Billing" },
    { id: "danger", label: "Danger Zone" },
  ];

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const rolesList: { id: UserRole; name: string; desc: string; badge: "danger" | "info" | "warning" | "neutral" | "accent" }[] = [
    { id: "owner", name: "Workspace Owner", desc: "Full administrative authority over workspace, members, and billing.", badge: "accent" },
    { id: "admin", name: "Administrator", desc: "Configure policies, manage model targets, and invite team members.", badge: "info" },
    { id: "red", name: "Red Team Lead", desc: "Launch adversarial probes, commit sealed payloads, and unseal after run.", badge: "danger" },
    { id: "blue", name: "Blue Team Lead", desc: "Inspect telemetry, develop defensive countermeasure rules, and verify.", badge: "info" },
    { id: "auditor", name: "Compliance Auditor", desc: "Read-only verification of Ed25519 signatures, Merkle roots, and exports.", badge: "warning" },
    { id: "viewer", name: "Viewer", desc: "Read-only visibility into completed evaluation summaries.", badge: "neutral" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Configuration</span>
            <span className="text-border">/</span>
            <span className="text-xs text-foreground font-medium">Settings</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Workspace Settings
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage organization identity, persona simulation previews, single sign-on, and notifications.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Changes saved successfully
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4 shadow-subtle">
            <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2.5">
              Workspace Profile
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Workspace Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 rounded-l-md bg-surface-2 border border-r-0 border-border text-muted">
                    bayora.io/ws/
                  </span>
                  <input
                    type="text"
                    disabled
                    value="meridian-safety-labs"
                    className="flex-1 px-3 py-2 rounded-r-md bg-surface-2/60 border border-border text-muted font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Primary Data Region
                </label>
                <select
                  disabled
                  className="w-full px-3 py-2 rounded-md bg-surface-2/60 border border-border text-muted"
                >
                  <option>US-East (N. Virginia) • Air-Gapped Pod 01</option>
                  <option>EU-Central (Frankfurt) • Regulated Pod 02</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: View as Role (Preview) */}
      {activeTab === "preview" && (
        <div className="max-w-3xl space-y-6">
          <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Eye className="h-4 w-4 text-accent" />
              <span>Role-Based Preview Simulator (Administrator Tool)</span>
            </div>
            <p className="text-muted leading-relaxed">
              In accordance with enterprise security design, the "Preview as role" switcher has been relocated from
              the main navigation header to this administrative settings pane. Select a persona below to preview how
              the UI renders, what data is redacted (e.g. sealed payloads for Blue Team), and verify ABAC enforcement.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h2 className="text-sm font-semibold text-foreground">
                Active Simulation Persona
              </h2>
              <span className="text-xs text-muted">
                Current Role: <strong className="text-accent uppercase">{role}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {rolesList.map((r) => {
                const isSelected = role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-accent/10 border-accent shadow-sm"
                        : "bg-surface-2 border-border hover:bg-surface-1 hover:border-border-strong"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{r.name}</span>
                        <Badge variant={r.badge}>{r.id.toUpperCase()}</Badge>
                        {isSelected && (
                          <span className="text-[10px] text-accent font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> ACTIVE PREVIEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted">{r.desc}</p>
                    </div>

                    <Button
                      variant={isSelected ? "primary" : "secondary"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRole(r.id);
                      }}
                      className="shrink-0"
                    >
                      {isSelected ? "Simulating" : "Switch to this role"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SSO */}
      {activeTab === "sso" && (
        <div className="max-w-2xl rounded-lg border border-border bg-surface-1 p-5 space-y-4 shadow-subtle text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h2 className="text-sm font-semibold text-foreground">
              Single Sign-On (SAML 2.0 / OIDC)
            </h2>
            <Badge variant="neutral">Enterprise Feature</Badge>
          </div>

          <p className="text-muted leading-relaxed">
            Allow members to authenticate through your enterprise identity provider (Okta, Microsoft Entra ID, Google Workspace).
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Authorized Corporate Email Domain
              </label>
              <input
                type="text"
                value={ssoDomain}
                onChange={(e) => setSsoDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-surface-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enforceSso}
                onChange={(e) => setEnforceSso(e.target.checked)}
                className="mt-0.5 rounded border-border text-accent focus:ring-accent"
              />
              <div>
                <div className="font-semibold text-foreground">Enforce SSO for all workspace members</div>
                <div className="text-[11px] text-muted">
                  Disables standard password authentication for users with the domain above.
                </div>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <Button variant="primary" size="sm" onClick={() => alert("SSO settings saved.")}>
              Save SSO Configuration
            </Button>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl rounded-lg border border-border bg-surface-1 p-5 space-y-4 shadow-subtle text-xs">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2.5">
            Alert Dispatch & Webhooks
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-surface-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-0.5 rounded border-border text-accent focus:ring-accent"
              />
              <div>
                <div className="font-semibold text-foreground">Email Notifications for Critical Jailbreaks</div>
                <div className="text-[11px] text-muted">
                  Send immediate alert emails to Security Leads whenever an adversarial probe bypasses defense filters.
                </div>
              </div>
            </label>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Slack Incident Webhook URL
              </label>
              <input
                type="url"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <Button variant="primary" size="sm" onClick={() => alert("Notification settings saved.")}>
              Save Notification Preferences
            </Button>
          </div>
        </div>
      )}

      {/* Tab 5: Plan & Billing */}
      {activeTab === "billing" && (
        <div className="max-w-2xl rounded-lg border border-border bg-surface-1 p-5 space-y-4 shadow-subtle text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Current Subscription Tier</h2>
              <span className="text-[11px] text-muted">Billed annually • Invoiced</span>
            </div>
            <Badge variant="accent">ENTERPRISE SCALE</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-2 border border-border text-xs">
            <div>
              <span className="text-muted block text-[11px]">Included Evaluations</span>
              <strong className="text-foreground">Unlimited Air-Gapped Runs</strong>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Seat Allocation</span>
              <strong className="text-foreground">10 Included (6 Assigned)</strong>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Audit Retention</span>
              <strong className="text-foreground">365-Day Immutable Ledger</strong>
            </div>
            <div>
              <span className="text-muted block text-[11px]">Dedicated Deployment</span>
              <strong className="text-foreground">Single-Tenant VPC Pod</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Danger Zone */}
      {activeTab === "danger" && (
        <div className="max-w-2xl rounded-lg border border-danger/30 bg-surface-1 p-5 space-y-4 shadow-subtle text-xs">
          <h2 className="text-sm font-semibold text-danger border-b border-danger/20 pb-2.5">
            Danger Zone
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Revoke All Active API Keys & Sessions</div>
                <div className="text-[11px] text-muted">
                  Immediately invalidates all CI/CD capability tokens and forces all members to sign in again.
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => alert("Sessions revoked.")}>
                Revoke All
              </Button>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Delete Workspace</div>
                <div className="text-[11px] text-muted">
                  Permanently wipe this workspace and all associated evaluations. Audit cryptographic proofs will be finalized.
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => alert("Deletion blocked on demo workspace.")}>
                Delete Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

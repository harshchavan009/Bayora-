"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, Shield, Bell, KeyRound, 
  CreditCard, Globe, Eye, Lock, CheckCircle2, 
  AlertTriangle, Save, RefreshCw, Trash2, ExternalLink,
  Sparkles, Palette, Monitor, Sun, Moon, Laptop, Link2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { useRole } from "@/components/RoleContext";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { role, setRole } = useRole();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("workspace");
  const [workspaceName, setWorkspaceName] = useState("Meridian Safety Labs");
  const [workspaceSlug, setWorkspaceSlug] = useState("meridian-safety-labs");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Background effects preference
  const [bgMode, setBgMode] = useState<"full" | "reduced" | "off">("full");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bayora-bg-mode");
      if (stored === "full" || stored === "reduced" || stored === "off") {
        setBgMode(stored);
      }
    }
  }, []);

  const handleUpdateBgMode = (mode: "full" | "reduced" | "off") => {
    setBgMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("bayora-bg-mode", mode);
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);

  // SSO
  const [ssoDomain, setSsoDomain] = useState("meridian.ai");
  const [enforceSso, setEnforceSso] = useState(true);

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "workspace", label: "Workspace" },
    { id: "appearance", label: "Appearance" },
    { id: "notifications", label: "Notifications" },
    { id: "integrations", label: "Integrations" },
    { id: "sso", label: "SSO" },
    { id: "billing", label: "Billing & Usage" },
    { id: "admin_tools", label: "Admin Tools" },
    { id: "danger", label: "Danger Zone" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumb) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage profile preferences, workspace tokens, appearance effects, and enterprise authentication.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-success font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Changes saved
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">User profile</h2>
              <p className="text-xs text-muted mt-0.5">Your personal credentials and display identity.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-medium mb-1">Full name</label>
                <input
                  type="text"
                  defaultValue="Dr. Aris Thorne"
                  className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Email address</label>
                <input
                  type="email"
                  defaultValue="aris.thorne@meridian.ai"
                  disabled
                  className="w-full px-3 py-2 rounded-md bg-surface-2/60 border border-border text-muted text-xs cursor-not-allowed"
                />
                <span className="text-[11px] text-faint mt-1 block">
                  Managed via Enterprise SSO (Okta)
                </span>
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Timezone</label>
                <select
                  defaultValue="America/Los_Angeles"
                  className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground text-xs focus:outline-none focus:border-accent"
                >
                  <option value="America/Los_Angeles">Pacific Time (US & Canada) (UTC-08:00)</option>
                  <option value="America/New_York">Eastern Time (US & Canada) (UTC-05:00)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="Europe/London">London (UTC+00:00)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  Save profile
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Workspace */}
      {activeTab === "workspace" && (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Workspace configuration</h2>
              <p className="text-xs text-muted mt-0.5">Organization identifier and cryptographic domain parameters.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-medium mb-1">Workspace name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground text-xs focus:outline-none focus:border-accent"
                />
              </div>

              {/* Workspace slug input - theme tokens guaranteed */}
              <div>
                <label className="block text-muted font-medium mb-1">Workspace slug URL</label>
                <div className="flex items-center rounded-md bg-surface-2 border border-border overflow-hidden">
                  <span className="px-3 py-2 text-muted text-xs bg-surface-3 border-r border-border shrink-0 select-none">
                    bayora.io/
                  </span>
                  <input
                    type="text"
                    value={workspaceSlug}
                    onChange={(e) => setWorkspaceSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-2 text-foreground text-xs font-mono focus:outline-none focus:bg-surface-2"
                  />
                </div>
                <span className="text-[11px] text-faint mt-1 block">
                  Used in CLI configuration, webhook signatures, and API routing.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="sm">
                  Save workspace
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab: Appearance */}
      {activeTab === "appearance" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Theme & Interface</h2>
              <p className="text-xs text-muted mt-0.5">Select interface color scheme and backdrop graphics rendering.</p>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-2 text-xs">
              <span className="text-muted font-medium block">Color theme</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "dark", label: "Dark default", icon: Moon },
                  { id: "light", label: "Light theme", icon: Sun },
                  { id: "system", label: "System sync", icon: Laptop },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id as any)}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      theme === th.id
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border bg-surface-2 text-muted hover:text-foreground"
                    }`}
                  >
                    <th.icon className="w-5 h-5" />
                    <span className="font-medium text-xs">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Background Effects Setting */}
            <div className="space-y-2 text-xs pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-muted font-medium block">3D Background effects</span>
                  <span className="text-[11px] text-faint">
                    Procedural WebGL glass cells with pulse telemetry and mouse parallax.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "full",
                    label: "Full effects",
                    desc: "Interactive 3D WebGL scene with camera parallax and pulse packets",
                  },
                  {
                    id: "reduced",
                    label: "Reduced motion",
                    desc: "Static drift, lower particle count, zero mouse parallax",
                  },
                  {
                    id: "off",
                    label: "Off",
                    desc: "Static CSS gradient with zero GPU overhead",
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleUpdateBgMode(m.id as any)}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between gap-1 transition-all ${
                      bgMode === m.id
                        ? "border-accent bg-accent/10"
                        : "border-border bg-surface-2 hover:border-border-strong"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs">{m.label}</span>
                      {bgMode === m.id && <CheckCircle2 className="w-3.5 h-3.5 text-accent" />}
                    </div>
                    <span className="text-[11px] text-muted">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === "notifications" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Alert notifications</h2>
              <p className="text-xs text-muted mt-0.5">Control email digests and incident dispatching.</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2 cursor-pointer">
                <div>
                  <div className="font-medium text-foreground">Real-time critical alerts</div>
                  <div className="text-[11px] text-muted">Immediate email notification upon critical jailbreak or canary exfiltration.</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-border bg-surface-1 text-accent focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2 cursor-pointer">
                <div>
                  <div className="font-medium text-foreground">Weekly executive safety summary</div>
                  <div className="text-[11px] text-muted">Curated Monday report with evaluation trends and ledger attestation.</div>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="rounded border-border bg-surface-1 text-accent focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Integrations */}
      {activeTab === "integrations" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground">Third-party integrations</h2>
                <p className="text-xs text-muted mt-0.5">Connect Slack, Jira, PagerDuty, and CI/CD pipelines.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => window.location.href = "/integrations"}>
                Manage integrations
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded border border-border bg-surface-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Slack alerts</div>
                  <div className="text-[11px] text-muted">#security-evals</div>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>

              <div className="p-3 rounded border border-border bg-surface-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">PagerDuty</div>
                  <div className="text-[11px] text-muted">Critical escalation</div>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: SSO */}
      {activeTab === "sso" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Single Sign-On (SAML / OIDC)</h2>
              <p className="text-xs text-muted mt-0.5">Corporate identity provider configuration.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-medium mb-1">Corporate email domain</label>
                <input
                  type="text"
                  value={ssoDomain}
                  onChange={(e) => setSsoDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2 cursor-pointer">
                <div>
                  <div className="font-medium text-foreground">Enforce SSO authentication</div>
                  <div className="text-[11px] text-muted">Prevent password-based authentication for all domain users.</div>
                </div>
                <input
                  type="checkbox"
                  checked={enforceSso}
                  onChange={(e) => setEnforceSso(e.target.checked)}
                  className="rounded border-border bg-surface-1 text-accent focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Billing & Usage */}
      {activeTab === "billing" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground">Enterprise subscription</h2>
                <p className="text-xs text-muted mt-0.5">High-assurance safety validation tier.</p>
              </div>
              <Badge variant="accent">Enterprise plan</Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded border border-border bg-surface-2 space-y-1">
                <span className="text-muted block">Active seats</span>
                <span className="text-lg font-semibold text-foreground tabular-nums">5 / 20</span>
              </div>
              <div className="p-3.5 rounded border border-border bg-surface-2 space-y-1">
                <span className="text-muted block">Monthly evaluations</span>
                <span className="text-lg font-semibold text-foreground tabular-nums">142 / Unlimited</span>
              </div>
              <div className="p-3.5 rounded border border-border bg-surface-2 space-y-1">
                <span className="text-muted block">Audit retention</span>
                <span className="text-lg font-semibold text-foreground">7 years (Cryptographic)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Admin Tools (View as Role) */}
      {activeTab === "admin_tools" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Admin tools: View as role</h2>
              <p className="text-xs text-muted mt-0.5">
                Simulate role-based UI access and permission boundaries for testing and compliance.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { id: "admin", label: "Administrator", desc: "Full access across all views, policies, and keys" },
                { id: "red_team", label: "Red team operator", desc: "Adversarial payload dispatch, sealed commitment actions" },
                { id: "blue_team", label: "Blue team defense", desc: "Inspection and heuristics; zero access to unsealed payloads" },
                { id: "auditor", label: "Compliance auditor", desc: "Cryptographic proof verification, evidence bundles, zero execution permissions" },
                { id: "observer", label: "Observer", desc: "Read-only access to concluded safety reports" },
              ].map((r) => (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id as any)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                    role === r.id
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface-2 hover:border-border-strong"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-foreground text-xs flex items-center gap-2">
                      <span>{r.label}</span>
                      <RoleBadge role={r.id as any} />
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">{r.desc}</div>
                  </div>

                  {role === r.id ? (
                    <Badge variant="accent">Active</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-xs">
                      Switch
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Danger Zone */}
      {activeTab === "danger" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-danger">Danger zone</h2>
              <p className="text-xs text-muted mt-0.5">Irreversible actions that purge workspace records.</p>
            </div>

            <div className="p-3.5 rounded bg-surface-1 border border-border flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-foreground">Purge evaluation telemetry</div>
                <div className="text-[11px] text-muted">Clear concluded run records while preserving cryptographic hash chain.</div>
              </div>
              <Button variant="danger" size="sm">
                Purge runs
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

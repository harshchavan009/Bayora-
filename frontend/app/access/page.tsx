"use client";

import React, { useState } from "react";
import { 
  Users, Shield, KeyRound, Lock, AlertOctagon, CheckCircle2, 
  Plus, Copy, Check, EyeOff, Info, Trash2, Mail, ShieldAlert, 
  X, CheckSquare, Square, ChevronRight, UserPlus, Globe, Laptop,
  Key, ShieldCheck, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, RoleBadge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";

interface Member {
  id: string;
  email: string;
  name: string;
  role: "admin" | "red_team" | "blue_team" | "auditor" | "observer";
  joined_at: string;
  status: "active" | "invited";
}

interface ApiKeyItem {
  id: string;
  name: string;
  maskedKey: string;
  scopes: string[];
  role: string;
  expiry: string;
  lastUsed: string;
}

interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function AccessPage() {
  const [activeTab, setActiveTab] = useState<string>("members");

  const [members, setMembers] = useState<Member[]>([
    { id: "usr-1", email: "aris.thorne@bayora.io", name: "Dr. Aris Thorne", role: "admin", joined_at: "2026-08-15", status: "active" },
    { id: "usr-2", email: "marcus.vance@bayora.io", name: "Marcus Vance", role: "red_team", joined_at: "2026-09-01", status: "active" },
    { id: "usr-3", email: "elena.rostova@bayora.io", name: "Elena Rostova", role: "blue_team", joined_at: "2026-09-02", status: "active" },
    { id: "usr-4", email: "sarah.lin@bayora.io", name: "Sarah Lin", role: "auditor", joined_at: "2026-09-10", status: "active" },
    { id: "usr-5", email: "jordan.bell@bayora.io", name: "Jordan Bell", role: "observer", joined_at: "2026-09-18", status: "active" },
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: "key-1",
      name: "GitHub Actions CI Safety Runner",
      maskedKey: "byr_live_••••••••9a2f",
      scopes: ["evaluations:create", "evaluations:read"],
      role: "red_team",
      expiry: "2027-09-25",
      lastUsed: "14 mins ago",
    },
    {
      id: "key-2",
      name: "Defense Heuristics Sync Service",
      maskedKey: "byr_live_••••••••81bc",
      scopes: ["rules:read", "rules:write"],
      role: "blue_team",
      expiry: "2027-09-27",
      lastUsed: "2 hours ago",
    },
    {
      id: "key-3",
      name: "Auditor Merkle Chain Verifier",
      maskedKey: "byr_live_••••••••c4e7",
      scopes: ["audit:verify", "ledger:read"],
      role: "auditor",
      expiry: "2027-09-28",
      lastUsed: "Yesterday",
    },
  ]);

  const [ipAllowlist, setIpAllowlist] = useState<string[]>([
    "192.168.1.0/24",
    "10.240.0.0/16",
    "64.104.22.45/32",
  ]);
  const [newIp, setNewIp] = useState("");

  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: "sess-1",
      device: "Chrome 128 (macOS Sonoma)",
      ip: "64.104.22.45",
      location: "San Francisco, US",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "sess-2",
      device: "Firefox 130 (Ubuntu Linux)",
      ip: "10.240.12.8",
      location: "Fremont, US",
      lastActive: "34 mins ago",
      isCurrent: false,
    },
  ]);

  const [denials, setDenials] = useState([
    {
      id: "den-1",
      actor: "blue_team_svc",
      action: "payload:read",
      target: "run-8f2c-104",
      reason: "Payload sealed until conclusion",
      time: "18 mins ago",
    },
    {
      id: "den-2",
      actor: "marcus.vance",
      action: "defense:read_weights",
      target: "classifier_v2",
      reason: "Defense model opacity invariant",
      time: "1 hour ago",
    },
    {
      id: "den-3",
      actor: "guest_probe",
      action: "network:direct_connect",
      target: "bayora-model-net",
      reason: "Direct route dropped by bridge firewall",
      time: "3 hours ago",
    },
  ]);

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Member["role"]>("observer");

  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyRole, setKeyRole] = useState("red_team");
  const [keyExpiryDays, setKeyExpiryDays] = useState("90");
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);

  const tabs = [
    { id: "members", label: "Members" },
    { id: "roles", label: "Roles Matrix" },
    { id: "sso", label: "SSO & SCIM" },
    { id: "keys", label: "API Keys" },
    { id: "network", label: "IP Allowlist" },
    { id: "sessions", label: "Active Sessions" },
    { id: "denials", label: "Recent Denials" },
  ];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: Member = {
      id: `usr-${Date.now()}`,
      email: inviteEmail,
      name: inviteEmail.split("@")[0],
      role: inviteRole,
      joined_at: new Date().toISOString().slice(0, 10),
      status: "invited",
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteModalOpen(false);
    setInviteEmail("");
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;
    const rawSecret = `byr_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: keyName,
      maskedKey: `${rawSecret.slice(0, 9)}••••••••${rawSecret.slice(-4)}`,
      scopes: ["evaluations:create", "evaluations:read"],
      role: keyRole,
      expiry: `${keyExpiryDays} days`,
      lastUsed: "Never",
    };
    setApiKeys((prev) => [newKey, ...prev]);
    setCreatedKeySecret(rawSecret);
  };

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;
    setIpAllowlist((prev) => [...prev, newIp]);
    setNewIp("");
  };

  const handleRemoveIp = (ip: string) => {
    setIpAllowlist((prev) => prev.filter((item) => item !== ip));
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumbs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Access
          </h1>
          <p className="text-sm text-muted mt-1">
            Organization members, cryptographic role-based access control, SSO/SCIM status, and token security.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCreateKeyModalOpen(true)}
          >
            <KeyRound className="w-3.5 h-3.5 mr-1.5" />
            Generate API key
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setInviteModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Invite member
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Members */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Workspace members</h2>
              <p className="text-xs text-muted mt-0.5">Teammates with access to this tenant workspace.</p>
            </div>
            <span className="text-xs text-muted tabular-nums">
              {members.length} members
            </span>
          </div>

          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Assigned role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{m.name}</div>
                        <div className="text-[11px] text-muted">{m.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <RoleBadge role={m.role} />
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={m.status === "active" ? "success" : "neutral"}>
                          {m.status === "active" ? "Active" : "Invited"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-muted tabular-nums">
                        {m.joined_at}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted hover:text-danger"
                          onClick={() => setMembers((prev) => prev.filter((u) => u.id !== m.id))}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roles Matrix */}
      {activeTab === "roles" && (
        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Role permissions matrix</h2>
            <p className="text-xs text-muted mt-0.5">Strict separation of duties between adversarial red team and blue defense.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="p-3 text-muted font-medium">Capability / Permission</th>
                  <th className="p-3 text-foreground font-medium text-center">Admin</th>
                  <th className="p-3 text-foreground font-medium text-center">Red team</th>
                  <th className="p-3 text-foreground font-medium text-center">Blue team</th>
                  <th className="p-3 text-foreground font-medium text-center">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "Execute adversarial evaluations", admin: true, red: true, blue: false, auditor: false },
                  { name: "View unsealed payloads before conclusion", admin: true, red: true, blue: false, auditor: false },
                  { name: "Configure blue defense rules & heuristics", admin: true, red: false, blue: true, auditor: false },
                  { name: "Reconstruct offline cryptographic Merkle chain", admin: true, red: true, blue: true, auditor: true },
                  { name: "Manage organization members & API tokens", admin: true, red: false, blue: false, auditor: false },
                  { name: "Export compliance evidence bundle", admin: true, red: true, blue: true, auditor: true },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-2/40 transition-colors">
                    <td className="p-3 text-foreground font-medium">{row.name}</td>
                    <td className="p-3 text-center">{row.admin ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-muted mx-auto" />}</td>
                    <td className="p-3 text-center">{row.red ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-muted mx-auto" />}</td>
                    <td className="p-3 text-center">{row.blue ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-muted mx-auto" />}</td>
                    <td className="p-3 text-center">{row.auditor ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-muted mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: SSO & SCIM */}
      {activeTab === "sso" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-foreground">SAML 2.0 & OIDC Single Sign-On</h2>
                <p className="text-xs text-muted mt-0.5">Enforce enterprise identity provider authentication.</p>
              </div>
              <Badge variant="success">SSO Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded border border-border bg-surface-2/60 space-y-1">
                <span className="text-muted block">Identity provider</span>
                <span className="font-semibold text-foreground">Okta Enterprise IDP</span>
              </div>
              <div className="p-3.5 rounded border border-border bg-surface-2/60 space-y-1">
                <span className="text-muted block">SSO enforcement</span>
                <span className="font-semibold text-foreground">Required for all users</span>
              </div>
              <div className="p-3.5 rounded border border-border bg-surface-2/60 space-y-1">
                <span className="text-muted block">SCIM directory sync</span>
                <span className="font-semibold text-foreground">Synchronized (14 mins ago)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: API Keys */}
      {activeTab === "keys" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Programmatic API tokens</h2>
              <p className="text-xs text-muted mt-0.5">Automated CI/CD integration keys with scoped permissions.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setCreateKeyModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              New key
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                  <tr>
                    <th className="py-3 px-4">Key name</th>
                    <th className="py-3 px-4">Token prefix</th>
                    <th className="py-3 px-4">Scopes</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Last used</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-foreground">{k.name}</td>
                      <td className="py-3.5 px-4 font-mono text-muted">{k.maskedKey}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-muted font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted tabular-nums">{k.expiry}</td>
                      <td className="py-3.5 px-4 text-muted tabular-nums">{k.lastUsed}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted hover:text-danger"
                          onClick={() => setApiKeys((prev) => prev.filter((item) => item.id !== k.id))}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: IP Allowlist */}
      {activeTab === "network" && (
        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Trusted IP address allowlist</h2>
            <p className="text-xs text-muted mt-0.5">Restrict API and dashboard traffic to explicit CIDR ranges.</p>
          </div>

          <form onSubmit={handleAddIp} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="e.g. 192.168.1.0/24 or 1.2.3.4/32"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground text-xs font-mono focus:outline-none focus:border-accent"
            />
            <Button type="submit" variant="secondary" size="sm">
              Add CIDR
            </Button>
          </form>

          <div className="space-y-2 max-w-md">
            {ipAllowlist.map((ip) => (
              <div key={ip} className="flex items-center justify-between p-2.5 rounded bg-surface-2 border border-border text-xs">
                <span className="font-mono text-foreground">{ip}</span>
                <button
                  onClick={() => handleRemoveIp(ip)}
                  className="text-muted hover:text-danger text-[11px]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Active Sessions */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Active user sessions</h2>
              <p className="text-xs text-muted mt-0.5">Currently authenticated browser sessions for this user.</p>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-3.5 rounded-lg border border-border bg-surface-2/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-accent" />
                    <div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        <span>{sess.device}</span>
                        {sess.isCurrent && <Badge variant="success">Current session</Badge>}
                      </div>
                      <div className="text-[11px] text-muted font-mono mt-0.5">
                        {sess.ip} • {sess.location} • {sess.lastActive}
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs text-danger border-danger/30 hover:bg-danger/10"
                      onClick={() => handleRevokeSession(sess.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Recent Denials */}
      {activeTab === "denials" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent ABAC denial events</h2>
              <p className="text-xs text-muted mt-0.5">Audit log of unauthorized access attempts intercepted by security invariants.</p>
            </div>

            <div className="space-y-2.5">
              {denials.map((den) => (
                <div key={den.id} className="p-3 rounded-lg border border-border bg-surface-2/40 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <span className="font-mono text-accent">{den.actor}</span>
                      <span className="text-muted">attempted</span>
                      <span className="font-mono text-danger">{den.action}</span>
                      <span className="text-muted">on</span>
                      <span className="font-mono text-foreground">{den.target}</span>
                    </div>
                    <div className="text-[11px] text-muted">{den.reason}</div>
                  </div>

                  <span className="text-[11px] text-muted tabular-nums shrink-0">{den.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Organization Teammate"
        description="Grant workspace access with cryptographic separation of duties."
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">Email address</label>
            <input
              type="email"
              required
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">Assigned role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
            >
              <option value="red_team">Red team (Adversarial operator)</option>
              <option value="blue_team">Blue team (Defense engineer)</option>
              <option value="auditor">Auditor (Ledger proof verifier)</option>
              <option value="admin">Admin (Full organization access)</option>
              <option value="observer">Observer (Read-only)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generate API Key Modal */}
      <Modal
        isOpen={createKeyModalOpen}
        onClose={() => {
          setCreateKeyModalOpen(false);
          setCreatedKeySecret(null);
        }}
        title={createdKeySecret ? "Save Your Secret Token" : "Generate Scoped API Token"}
        description={
          createdKeySecret
            ? "Make sure to copy your API key now. You will not be able to see it again."
            : "Create a programmatic credential for automated CI/CD safety testing pipelines."
        }
      >
        {createdKeySecret ? (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg border border-warning/30 bg-warning/5 text-foreground space-y-2">
              <span className="font-semibold block">Generated secret key:</span>
              <div className="p-2.5 rounded bg-surface-2 border border-border font-mono text-accent text-[11px] break-all select-all">
                {createdKeySecret}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(createdKeySecret);
                  setCreateKeyModalOpen(false);
                  setCreatedKeySecret(null);
                }}
              >
                Copy & close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-foreground mb-1">Key name</label>
              <input
                type="text"
                required
                placeholder="e.g. GitHub Actions CI Runner"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Associated role</label>
              <select
                value={keyRole}
                onChange={(e) => setKeyRole(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
              >
                <option value="red_team">Red team</option>
                <option value="blue_team">Blue team</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Expiration period</label>
              <select
                value={keyExpiryDays}
                onChange={(e) => setKeyExpiryDays(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="never">Never (Not recommended)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateKeyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Generate token
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

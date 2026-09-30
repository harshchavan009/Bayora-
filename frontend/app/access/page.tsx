"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Shield, KeyRound, Lock, AlertOctagon, CheckCircle2, 
  Plus, Copy, Check, EyeOff, Info, Trash2, Mail, ShieldAlert, 
  X, CheckSquare, Square, ChevronRight, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { HashBlock } from "@/components/ui/HashBlock";
import { fetchCapabilities, generateCapabilityToken } from "@/lib/api";
import { apiGetMembers, apiInviteMember } from "@/lib/auth";

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
  joined_at: string;
  status: "active" | "invited";
}

interface ApiKeyItem {
  id: string;
  name: string;
  maskedKey: string;
  role: string;
  tenant: string;
  createdAt: string;
  lastUsed: string;
}

export default function AccessControlPage() {
  const [activeTab, setActiveTab] = useState<string>("members");
  const [members, setMembers] = useState<Member[]>([
    { id: "usr-1", email: "owner@bayora.io", name: "Sarah Lin (Owner)", role: "owner", joined_at: "2026-09-01", status: "active" },
    { id: "usr-2", email: "admin@bayora.io", name: "David Chen (Admin)", role: "admin", joined_at: "2026-09-05", status: "active" },
    { id: "usr-3", email: "red@bayora.io", name: "Alex Mercer (Red Team Lead)", role: "red", joined_at: "2026-09-10", status: "active" },
    { id: "usr-4", email: "blue@bayora.io", name: "Elena Rostova (Blue Team Lead)", role: "blue", joined_at: "2026-09-12", status: "active" },
    { id: "usr-5", email: "auditor@bayora.io", name: "Marcus Brody (Auditor)", role: "auditor", joined_at: "2026-09-15", status: "active" },
    { id: "usr-6", email: "viewer@bayora.io", name: "Jordan Bell (Viewer)", role: "viewer", joined_at: "2026-09-20", status: "active" },
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: "key-1", name: "CI/CD GitHub Actions Runner", maskedKey: "byr_live_••••••••9a2f", role: "red", tenant: "red", createdAt: "2026-09-25", lastUsed: "14 mins ago" },
    { id: "key-2", name: "Blue Defense Evaluation Hook", maskedKey: "byr_live_••••••••81bc", role: "blue", tenant: "blue", createdAt: "2026-09-27", lastUsed: "2 hours ago" },
    { id: "key-3", name: "Compliance Ledger Verifier Agent", maskedKey: "byr_live_••••••••c4e7", role: "auditor", tenant: "system", createdAt: "2026-09-28", lastUsed: "Yesterday" },
  ]);

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyRole, setKeyRole] = useState("red");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const [denials, setDenials] = useState([
    { id: "den-1", actor: "blue_team_svc", action: "payload:read", target: "run-active-002", reason: "Payload sealed until conclusion", time: "18m ago" },
    { id: "den-2", actor: "red_lead_usr", action: "defense:read_weights", target: "classifier_v2", reason: "Defense model opacity invariant", time: "1h ago" },
    { id: "den-3", actor: "guest_probe", action: "network:direct_connect", target: "bayora-model-net", reason: "Direct route dropped by bridge firewall", time: "3h ago" },
  ]);

  const tabs = [
    { id: "members", label: "Members & Teams" },
    { id: "roles", label: "Roles & Permissions Matrix" },
    { id: "policies", label: "ABAC Security Invariants" },
    { id: "keys", label: "API Keys & Service Tokens" },
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
    const secret = `byr_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: keyName,
      maskedKey: `${secret.slice(0, 9)}••••••••${secret.slice(-4)}`,
      role: keyRole,
      tenant: keyRole === "blue" ? "blue" : keyRole === "red" ? "red" : "system",
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: "Just created",
    };
    setApiKeys((prev) => [newKey, ...prev]);
    setGeneratedKey(secret);
  };

  const permissionsMatrix = [
    { permission: "Launch Adversarial Evaluations", roles: { owner: true, admin: true, red: true, blue: false, auditor: false, viewer: false } },
    { permission: "Unseal Red Team Payloads", roles: { owner: true, admin: true, red: true, blue: false, auditor: true, viewer: false } },
    { permission: "Configure Blue Countermeasures", roles: { owner: true, admin: true, red: false, blue: true, auditor: false, viewer: false } },
    { permission: "Verify Cryptographic Ledger", roles: { owner: true, admin: true, red: true, blue: true, auditor: true, viewer: true } },
    { permission: "Export Findings & Evidence Bundles", roles: { owner: true, admin: true, red: true, blue: true, auditor: true, viewer: false } },
    { permission: "Manage Team Members & API Keys", roles: { owner: true, admin: true, red: false, blue: false, auditor: false, viewer: false } },
    { permission: "View As Role Preview (Simulation)", roles: { owner: true, admin: true, red: false, blue: false, auditor: false, viewer: false } },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Governance</span>
            <span className="text-border">/</span>
            <span className="text-xs text-foreground font-medium">Access & Team</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Access Control & RBAC
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage workspace members, role permissions, attribute-based policy rules, and API keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "members" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setInviteModalOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite teammate
            </Button>
          )}

          {activeTab === "keys" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setGeneratedKey(null);
                setCreateKeyModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create API key
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Members */}
      {activeTab === "members" && (
        <div className="rounded-lg border border-border bg-surface-1 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                <tr>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Joined</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-2/60 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground">
                      {m.name}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-muted">
                      {m.email}
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          m.role === "owner"
                            ? "accent"
                            : m.role === "admin"
                            ? "info"
                            : m.role === "red"
                            ? "danger"
                            : m.role === "blue"
                            ? "info"
                            : m.role === "auditor"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {m.role.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant={m.status === "active" ? "success" : "neutral"}>
                        {m.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 text-muted text-[11px]">
                      {m.joined_at}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {m.role !== "owner" && (
                        <button
                          onClick={() => setMembers((prev) => prev.filter((x) => x.id !== m.id))}
                          className="p-1 rounded text-muted hover:text-danger hover:bg-surface-2 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Roles Matrix */}
      {activeTab === "roles" && (
        <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Role-Based Access Control (RBAC) Permissions Grid
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Exact permissions enforced across the API gateway and frontend views.
              </p>
            </div>
            <Badge variant="neutral">6 Default Roles</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-surface-2 text-foreground font-medium border-b border-border">
                <tr>
                  <th className="py-2.5 px-3 text-left">Action / Capability</th>
                  <th className="py-2.5 px-2">Owner</th>
                  <th className="py-2.5 px-2">Admin</th>
                  <th className="py-2.5 px-2">Red Team</th>
                  <th className="py-2.5 px-2">Blue Team</th>
                  <th className="py-2.5 px-2">Auditor</th>
                  <th className="py-2.5 px-2">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissionsMatrix.map((p, idx) => (
                  <tr key={idx} className="hover:bg-surface-2/40">
                    <td className="py-2.5 px-3 text-left font-medium text-foreground">
                      {p.permission}
                    </td>
                    {(["owner", "admin", "red", "blue", "auditor", "viewer"] as const).map((r) => {
                      const allowed = p.roles[r];
                      return (
                        <td key={r} className="py-2.5 px-2">
                          {allowed ? (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-success/15 text-success">
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-surface-2 text-muted">
                              <X className="h-3 w-3" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Invariant Policies */}
      {activeTab === "policies" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-surface-1 space-y-2">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-accent" />
              Cryptographic Invariants & Non-Repudiation
            </div>
            <p className="text-xs text-muted">
              These policies cannot be disabled or bypassed by any role, including workspace owners.
              They are enforced at the cryptographic hypervisor and networking layers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-surface-1 space-y-2">
              <span className="text-xs font-semibold text-foreground">1. Zero Early Payload Leakage</span>
              <p className="text-xs text-muted">
                Blue team and model guardrails cannot read adversarial payload plaintext while the evaluation is RUNNING.
                Payload commitment hashes are verified upon conclusion.
              </p>
              <Badge variant="success">Hardware & Net Isolated</Badge>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface-1 space-y-2">
              <span className="text-xs font-semibold text-foreground">2. Defense Logic Opacity</span>
              <p className="text-xs text-muted">
                Red team operators cannot inspect active heuristic regex weights or defense filter configurations,
                preventing gradient-free optimization against defenses.
              </p>
              <Badge variant="success">Zero Bleed Enforced</Badge>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface-1 space-y-2">
              <span className="text-xs font-semibold text-foreground">3. Gateway Mediation Mandatory</span>
              <p className="text-xs text-muted">
                Direct container-to-model packets are unconditionally dropped by Docker iptables. All traffic must pass
                through the 200ms timing normalizer gateway.
              </p>
              <Badge variant="info">Iptables Drop Rules</Badge>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface-1 space-y-2">
              <span className="text-xs font-semibold text-foreground">4. Immutable Audit Non-Repudiation</span>
              <p className="text-xs text-muted">
                Audit logs are append-only. Ed25519 digital signatures and SHA-256 Merkle root trees prevent retroactive
                modification or tampering.
              </p>
              <Badge variant="warning">Ed25519 Signed</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: API Keys */}
      {activeTab === "keys" && (
        <div className="rounded-lg border border-border bg-surface-1 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                <tr>
                  <th className="py-2.5 px-3">Key Name</th>
                  <th className="py-2.5 px-3">Secret Key</th>
                  <th className="py-2.5 px-3">Assigned Role</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3">Last Used</th>
                  <th className="py-2.5 px-3 text-right">Revoke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-surface-2/60 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground">
                      {k.name}
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-muted">
                      {k.maskedKey}
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant="neutral">{k.role.toUpperCase()}</Badge>
                    </td>

                    <td className="py-3 px-3 text-muted text-[11px]">
                      {k.createdAt}
                    </td>

                    <td className="py-3 px-3 text-muted text-[11px]">
                      {k.lastUsed}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setApiKeys((prev) => prev.filter((x) => x.id !== k.id))}
                        className="p-1 rounded text-muted hover:text-danger hover:bg-surface-2"
                        title="Revoke key"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Recent Denials */}
      {activeTab === "denials" && (
        <div className="rounded-lg border border-border bg-surface-1 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                <tr>
                  <th className="py-2.5 px-3">Actor / Service</th>
                  <th className="py-2.5 px-3">Action Attempted</th>
                  <th className="py-2.5 px-3">Target Resource</th>
                  <th className="py-2.5 px-3">Denial Reason</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {denials.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-2/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-foreground font-medium">
                      {d.actor}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-danger">
                      {d.action}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-muted">
                      {d.target}
                    </td>
                    <td className="py-3 px-3 text-muted">
                      {d.reason}
                    </td>
                    <td className="py-3 px-3 text-muted text-[11px]">
                      {d.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Teammate to Workspace"
        description="Send an invitation to join Meridian Safety Labs with a designated role."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Designated Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="viewer">Viewer (Read-only access)</option>
              <option value="red">Red Team Lead (Adversarial probes, unseal payloads)</option>
              <option value="blue">Blue Team Lead (Countermeasures, mitigation inspection)</option>
              <option value="auditor">Auditor (Compliance verification, ledger export)</option>
              <option value="admin">Admin (Manage members, models, and policies)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create API Key Modal */}
      <Modal
        open={createKeyModalOpen}
        onClose={() => setCreateKeyModalOpen(false)}
        title={generatedKey ? "API Key Generated" : "Generate New API Key"}
        description={
          generatedKey
            ? "Make sure to copy your API key now. You will not be able to view it again."
            : "Create a scoped capability token for automated CI/CD runners."
        }
        maxWidth="max-w-md"
      >
        {generatedKey ? (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted block">Secret Token:</span>
              <HashBlock hash={generatedKey} />
            </div>
            <div className="p-3 rounded-md bg-warning/10 border border-warning/20 text-warning text-xs">
              This token has been hashed with Argon2id. Once you close this modal, only the masked string will be preserved.
            </div>
            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreateKeyModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Token Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Production Jenkins Adversarial Runner"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Capability Role
              </label>
              <select
                value={keyRole}
                onChange={(e) => setKeyRole(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="red">Red Team (Submit runs & seal payloads)</option>
                <option value="blue">Blue Team (Inspect defense logs)</option>
                <option value="auditor">Auditor (Verify ledger & read-only)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateKeyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Generate Key
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

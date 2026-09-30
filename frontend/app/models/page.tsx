"use client";

import React, { useState } from "react";
import { 
  Plus, RefreshCw, CheckCircle2, AlertTriangle, 
  ExternalLink, Play, Clock, ShieldCheck, Lock, Activity, 
  Copy, Check, Server, Eye, Zap, KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricTile } from "@/components/ui/MetricTile";
import { Modal } from "@/components/ui/Modal";
import { NewEvaluationModal } from "@/components/NewEvaluationModal";
import { UNIFIED_MODEL_ENDPOINTS, UnifiedModelEndpoint } from "@/lib/dataStore";

export default function ModelsPage() {
  const [models, setModels] = useState<UnifiedModelEndpoint[]>(UNIFIED_MODEL_ENDPOINTS);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [rotateKeyModalOpen, setRotateKeyModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<UnifiedModelEndpoint | null>(null);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Connect form state
  const [newName, setNewName] = useState("");
  const [newProvider, setNewProvider] = useState("vLLM / Containerized Bridge");
  const [newMode, setNewMode] = useState<"Isolated sandbox" | "Gateway-mediated" | "External API">("Isolated sandbox");
  const [newUrl, setNewUrl] = useState("");
  const [newApiKey, setNewApiKey] = useState("");

  const handlePing = (id: string) => {
    setPingingId(id);
    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, latencyMs: Math.floor(Math.random() * 20) + 85, status: "online" }
            : m
        )
      );
      setPingingId(null);
    }, 600);
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRotateKey = (model: UnifiedModelEndpoint) => {
    setSelectedModel(model);
    setRotateKeyModalOpen(true);
  };

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newEndpoint: UnifiedModelEndpoint = {
      id: `model-${Date.now()}`,
      name: newName,
      provider: newProvider,
      networkMode: newMode,
      endpointUrl: newUrl || "http://bayora-model-net:8080/v1",
      status: "online",
      latencyMs: 92,
      contextWindow: "32,768 tokens",
      sessionsActive: 0,
      timingNormalization: true,
      canaryInspection: true,
      lastEvaluated: "Just now",
      credentialStatus: "Valid (Vault)",
      sparkline: [95, 92, 90, 94, 91, 92, 92],
    };

    setModels((prev) => [newEndpoint, ...prev]);
    setConnectModalOpen(false);
    setNewName("");
    setNewUrl("");
    setNewApiKey("");
  };

  const networkModeBadge = (mode: UnifiedModelEndpoint["networkMode"]) => {
    switch (mode) {
      case "Isolated sandbox":
        return <Badge variant="success">Isolated sandbox</Badge>;
      case "Gateway-mediated":
        return <Badge variant="info">Gateway-mediated</Badge>;
      case "External API":
        return <Badge variant="warning">External API</Badge>;
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header (No duplicate breadcrumb) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Models
          </h1>
          <p className="text-sm text-muted mt-1">
            Registered LLM targets under test with verified network modes and credential status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => models.forEach((m) => handlePing(m.id))}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Ping all endpoints
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setConnectModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register endpoint
          </Button>
        </div>
      </div>

      {/* 4 Metric Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Registered endpoints"
          value={models.length.toString()}
          delta="4 active targets"
          deltaType="positive"
          trend={[2, 3, 3, 4, 4, 4, models.length]}
        />
        <MetricTile
          label="Isolated sandboxes"
          value={models.filter((m) => m.networkMode === "Isolated sandbox").length.toString()}
          delta="Full network isolation"
          deltaType="positive"
          trend={[1, 1, 2, 2, 2, 2, 2]}
        />
        <MetricTile
          label="Average latency"
          value="141ms"
          delta="Quantized to 200ms buckets"
          deltaType="neutral"
          trend={[155, 150, 148, 145, 142, 140, 141]}
        />
        <MetricTile
          label="Canary active"
          value="100%"
          delta="Zero token exfiltration"
          deltaType="positive"
          trend={[100, 100, 100, 100, 100, 100, 100]}
        />
      </div>

      {/* Clean Full-Width Models Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Target endpoints</h2>
            <p className="text-xs text-muted mt-0.5">
              Network boundaries and credential health for all evaluated models.
            </p>
          </div>
          <span className="text-xs text-muted tabular-nums">
            {models.length} endpoints registered
          </span>
        </div>

        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                <tr>
                  <th className="py-3 px-4">Model endpoint</th>
                  <th className="py-3 px-4">Network mode</th>
                  <th className="py-3 px-4">Latency & Health</th>
                  <th className="py-3 px-4">Credentials</th>
                  <th className="py-3 px-4">Last evaluated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {models.map((m) => {
                  const isPinging = pingingId === m.id;
                  return (
                    <tr key={m.id} className="hover:bg-surface-2/50 transition-colors">
                      {/* Name & URL */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-foreground">{m.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-muted">{m.provider}</span>
                          <span className="text-border-strong">•</span>
                          <button
                            onClick={() => handleCopy(m.id, m.endpointUrl)}
                            className="font-mono text-[11px] text-faint hover:text-accent flex items-center gap-1 transition-colors"
                            title="Copy endpoint URL"
                          >
                            <span>{m.endpointUrl}</span>
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Network Mode */}
                      <td className="py-3.5 px-4">
                        {networkModeBadge(m.networkMode)}
                      </td>

                      {/* Latency & Sparkline */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="space-y-0.5">
                            <span className="font-mono font-medium text-foreground tabular-nums">
                              {m.latencyMs}ms
                            </span>
                            <div className="text-[10px] text-muted">Raw round-trip</div>
                          </div>
                          {/* Mini Sparkline */}
                          <svg width="48" height="18" className="overflow-visible" aria-hidden="true">
                            <polyline
                              fill="none"
                              stroke="#6E7BF2"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points="0,12 8,8 16,14 24,6 32,10 40,8 48,9"
                            />
                          </svg>
                        </div>
                      </td>

                      {/* Credentials */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-muted" />
                          <span className="text-foreground">{m.credentialStatus}</span>
                        </div>
                        <div className="text-[10px] text-muted mt-0.5">Automated rotation</div>
                      </td>

                      {/* Last Evaluated */}
                      <td className="py-3.5 px-4">
                        <span className="text-muted tabular-nums">{m.lastEvaluated}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handlePing(m.id)}
                            disabled={isPinging}
                          >
                            <Zap className={`w-3.5 h-3.5 mr-1 ${isPinging ? "animate-spin text-accent" : ""}`} />
                            Test
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleRotateKey(m)}
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-1" />
                            Rotate key
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Register Endpoint Modal */}
      <Modal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        title="Register Model Target"
        description="Configure an isolated sandbox or gateway-mediated model endpoint for adversarial safety evaluations."
      >
        <form onSubmit={handleAddEndpoint} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-foreground mb-1">
              Target display name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Llama-3.1-8B-Instruct (Sandbox)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              Network isolation mode
            </label>
            <select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
            >
              <option value="Isolated sandbox">Isolated sandbox (Dedicated non-egress subnet)</option>
              <option value="Gateway-mediated">Gateway-mediated (Strict policy proxy)</option>
              <option value="External API">External API (Regulated compliance egress)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              Endpoint URL
            </label>
            <input
              type="url"
              required
              placeholder="http://bayora-model-net:8080/v1"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              API key / Bearer token (Stored in secure vault)
            </label>
            <input
              type="password"
              placeholder="bayora_sk_live_..."
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConnectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rotate Key Modal */}
      <Modal
        isOpen={rotateKeyModalOpen}
        onClose={() => setRotateKeyModalOpen(false)}
        title={`Rotate Credentials: ${selectedModel?.name}`}
        description="Generate or supply a new cryptographic key for this model target. Previous keys are instantly revoked."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded border border-border bg-surface-2 space-y-1">
            <div className="text-muted">Current status:</div>
            <div className="font-medium text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>{selectedModel?.credentialStatus}</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1">
              New secret key or token
            </label>
            <input
              type="password"
              placeholder="Paste new credential or leave empty to auto-generate..."
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRotateKeyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setRotateKeyModalOpen(false);
              }}
            >
              Rotate & re-verify
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Cpu, Plus, RefreshCw, CheckCircle2, AlertTriangle, 
  ExternalLink, Play, Clock, ShieldCheck, Lock, Activity, 
  Copy, Check, Server, Eye, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MetricTile } from "@/components/ui/MetricTile";
import { Modal } from "@/components/ui/Modal";
import { NewEvaluationModal } from "@/components/NewEvaluationModal";

interface ModelEndpoint {
  id: string;
  name: string;
  provider: string;
  endpointUrl: string;
  status: "online" | "standby" | "testing";
  latencyMs: number;
  contextWindow: string;
  sessionsActive: number;
  timingNormalization: boolean;
  canaryInspection: boolean;
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelEndpoint[]>([
    {
      id: "model-llama3-8b",
      name: "Llama-3-8B-Instruct (Sandbox)",
      provider: "vLLM / Containerized Bridge",
      endpointUrl: "http://bayora-model-net:8080/v1",
      status: "online",
      latencyMs: 98,
      contextWindow: "8,192 tokens",
      sessionsActive: 2,
      timingNormalization: true,
      canaryInspection: true,
    },
    {
      id: "model-mistral-7b",
      name: "Mistral-7B-Instruct (Sandbox)",
      provider: "Ollama / Local Inference",
      endpointUrl: "http://bayora-model-net:11434/api/generate",
      status: "online",
      latencyMs: 145,
      contextWindow: "32,768 tokens",
      sessionsActive: 1,
      timingNormalization: true,
      canaryInspection: true,
    },
    {
      id: "model-claude-35-haiku",
      name: "Claude 3.5 Haiku (Proxy)",
      provider: "Anthropic / Regulated Proxy",
      endpointUrl: "https://proxy.bayora.internal/v1/messages",
      status: "standby",
      latencyMs: 182,
      contextWindow: "200,000 tokens",
      sessionsActive: 0,
      timingNormalization: true,
      canaryInspection: true,
    },
    {
      id: "model-mock-sandbox",
      name: "Bayora Mock LLM (Air-Gapped)",
      provider: "Deterministic Fast Engine",
      endpointUrl: "http://127.0.0.1:8000/api/llm/mock",
      status: "online",
      latencyMs: 12,
      contextWindow: "4,096 tokens",
      sessionsActive: 1,
      timingNormalization: true,
      canaryInspection: true,
    },
  ]);

  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Connect form state
  const [newName, setNewName] = useState("");
  const [newProvider, setNewProvider] = useState("vLLM / Local Container");
  const [newUrl, setNewUrl] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [newContext, setNewContext] = useState("8,192 tokens");

  const handlePing = (id: string) => {
    setPingingId(id);
    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, latencyMs: Math.floor(Math.random() * 40) + 85, status: "online" }
            : m
        )
      );
      setPingingId(null);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;

    const newEndpoint: ModelEndpoint = {
      id: `model-${Date.now()}`,
      name: newName,
      provider: newProvider,
      endpointUrl: newUrl,
      status: "online",
      latencyMs: 110,
      contextWindow: newContext,
      sessionsActive: 0,
      timingNormalization: true,
      canaryInspection: true,
    };

    setModels((prev) => [newEndpoint, ...prev]);
    setConnectModalOpen(false);
    setNewName("");
    setNewUrl("");
    setNewApiKey("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Workspace</span>
            <span className="text-border">/</span>
            <span className="text-xs text-foreground font-medium">Model Targets</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Model Targets
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Connected inference endpoints, air-gapped sandboxes, and timing defense configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setConnectModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Connect endpoint
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Connected Endpoints"
          value={models.length.toString()}
          delta="3 sandboxed, 1 proxy"
          deltaType="positive"
        />

        <MetricTile
          label="Active Target Sessions"
          value="4"
          delta="Zero cross-tenant leaks"
          deltaType="positive"
        />

        <MetricTile
          label="Padded Latency Egress"
          value="200ms"
          delta="Fixed bucket quantization"
          deltaType="neutral"
        />

        <MetricTile
          label="Network Sandbox"
          value="100%"
          delta="bayora-model-net isolated"
          deltaType="positive"
        />
      </div>

      {/* Models List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Target Endpoint Inventory</h2>
          <span className="text-xs text-muted">
            All models isolated in network bridge namespaces
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {models.map((m) => {
            const isPinging = pingingId === m.id;
            return (
              <div
                key={m.id}
                className="p-4 rounded-lg border border-border bg-surface-1 hover:border-border-strong transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface-2 border border-border text-foreground">
                      <Cpu className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{m.name}</span>
                        <Badge
                          variant={
                            m.status === "online"
                              ? "success"
                              : m.status === "standby"
                              ? "neutral"
                              : "warning"
                          }
                        >
                          {m.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted mt-0.5 flex items-center gap-2">
                        <span>{m.provider}</span>
                        <span className="text-border">•</span>
                        <span>Context: {m.contextWindow}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePing(m.id)}
                      loading={isPinging}
                      title="Run health check and latency probe"
                    >
                      <Zap className="h-3.5 w-3.5 mr-1" />
                      {m.latencyMs}ms Ping
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setEvalModalOpen(true)}
                    >
                      <Play className="h-3 w-3 mr-1 fill-current" />
                      Evaluate
                    </Button>
                  </div>
                </div>

                {/* Endpoint details & Guarantees */}
                <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted">URL:</span>
                    <span className="font-mono text-[11px] text-foreground truncate max-w-[200px]">
                      {m.endpointUrl}
                    </span>
                    <button
                      onClick={() => handleCopy(m.id, m.endpointUrl)}
                      className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-2"
                      title="Copy endpoint URL"
                    >
                      {copiedId === m.id ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-muted">Timing Guard:</span>
                    <Badge variant="info">200ms Padded</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-muted">Network:</span>
                    <span className="text-success font-medium flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Air-Gapped Docker Bridge
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Endpoint Modal */}
      <Modal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        title="Connect Model Target Endpoint"
        description="Attach an air-gapped vLLM container, Ollama instance, or enterprise model proxy."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleAddEndpoint} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Target Model Name
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Llama-3.1-70B-Instruct"
              className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Inference Provider
            </label>
            <select
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="vLLM / Local Container">vLLM / Local Container</option>
              <option value="Ollama / Local Engine">Ollama / Local Engine</option>
              <option value="Anthropic / Regulated Proxy">Anthropic / Regulated Proxy</option>
              <option value="Azure OpenAI / Private VNet">Azure OpenAI / Private VNet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Base Endpoint URL
            </label>
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="http://bayora-model-net:8080/v1"
              className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              API Secret Key (Stored in Memory Vault)
            </label>
            <input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Context Window
            </label>
            <input
              type="text"
              value={newContext}
              onChange={(e) => setNewContext(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="p-3 rounded-md bg-surface-2 border border-border text-muted space-y-1">
            <span className="font-semibold text-foreground block">Isolation Policy:</span>
            <p>
              Traffic to this model is mediated by the Bayora API gateway. Payloads will be quantized to 200ms fixed
              buckets and checked against canary tokens.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConnectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register Endpoint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Launch Evaluation Modal */}
      <NewEvaluationModal
        open={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}

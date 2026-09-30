"use client";

import React, { useState } from "react";
import { 
  Boxes, CheckCircle2, Plus, ExternalLink, RefreshCw, 
  Send, Trash2, Shield, AlertTriangle, Key, Terminal, Code2, Check, Copy
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface IntegrationItem {
  id: string;
  name: string;
  category: "Alerting" | "Issue Tracking" | "CI/CD" | "Webhooks";
  description: string;
  status: "connected" | "disconnected";
  configSummary?: string;
  iconText: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: "slack",
      name: "Slack",
      category: "Alerting",
      description: "Dispatch critical findings and canary alerts directly to security channels.",
      status: "connected",
      configSummary: "#bayora-safety-alerts",
      iconText: "SL",
    },
    {
      id: "msteams",
      name: "Microsoft Teams",
      category: "Alerting",
      description: "Post automated evaluation conclusions and ledger verification notices into Teams.",
      status: "disconnected",
      iconText: "MS",
    },
    {
      id: "linear",
      name: "Linear",
      category: "Issue Tracking",
      description: "Create Linear engineering tickets automatically from high and critical findings.",
      status: "connected",
      configSummary: "Team: AI Platform Security",
      iconText: "LN",
    },
    {
      id: "jira",
      name: "Jira Cloud",
      category: "Issue Tracking",
      description: "Sync safety violations into Jira backlog with OWASP LLM tags and evidence bundles.",
      status: "disconnected",
      iconText: "JR",
    },
    {
      id: "pagerduty",
      name: "PagerDuty",
      category: "Alerting",
      description: "Trigger urgent on-call incident escalations when token exfiltration occurs.",
      status: "connected",
      configSummary: "Service: Safety Escalation",
      iconText: "PD",
    },
    {
      id: "github_actions",
      name: "GitHub Actions",
      category: "CI/CD",
      description: "Block pull requests and model releases if adversarial evaluations yield critical vulnerabilities.",
      status: "connected",
      configSummary: ".github/workflows/safety-eval.yml",
      iconText: "GH",
    },
  ]);

  const [webhooks, setWebhooks] = useState([
    {
      id: "wh-1",
      name: "Splunk SIEM Webhook",
      url: "https://siem.internal.meridian.ai/v1/events",
      status: "active",
      lastDelivery: "4 mins ago",
      successRate: "100%",
    },
    {
      id: "wh-2",
      name: "Datadog Custom Event Hook",
      url: "https://api.datadoghq.com/api/v1/events/bayora",
      status: "active",
      lastDelivery: "22 mins ago",
      successRate: "99.8%",
    },
  ]);

  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const ciSnippet = `name: AI Model Safety Validation
on: [pull_request]

jobs:
  validate-model:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Bayora Adversarial Evaluation
        env:
          BAYORA_API_KEY: \${{ secrets.BAYORA_API_KEY }}
        run: |
          RUN_ID=$(curl -s -X POST https://api.bayora.io/v1/evaluations \\
            -H "Authorization: Bearer $BAYORA_API_KEY" \\
            -H "Content-Type: application/json" \\
            -d '{"target_model": "Llama-3.1-70B", "name": "PR \${{ github.sha }} Alignment Test"}' | jq -r .run_id)
          
          echo "Waiting for conclusion of $RUN_ID..."
          STATUS=$(curl -s https://api.bayora.io/v1/evaluations/$RUN_ID \\
            -H "Authorization: Bearer $BAYORA_API_KEY" | jq -r .status)
          
          # Fail CI if critical findings detected
          CRITICAL=$(curl -s https://api.bayora.io/v1/evaluations/$RUN_ID/findings \\
            -H "Authorization: Bearer $BAYORA_API_KEY" | jq '[.[] | select(.severity=="critical")] | length')
          
          if [ "$CRITICAL" -gt 0 ]; then
            echo "CI FAILED: $CRITICAL critical safety vulnerabilities found!"
            exit 1
          fi`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(ciSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName || !newWebhookUrl) return;
    setWebhooks((prev) => [
      ...prev,
      {
        id: `wh-${Date.now()}`,
        name: newWebhookName,
        url: newWebhookUrl,
        status: "active",
        lastDelivery: "Never",
        successRate: "100%",
      },
    ]);
    setWebhookModalOpen(false);
    setNewWebhookName("");
    setNewWebhookUrl("");
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Integrations
          </h1>
          <p className="text-sm text-muted mt-1">
            Connect alerting providers, issue trackers, CI/CD safety gates, and signed webhooks.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setWebhookModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add webhook
        </Button>
      </div>

      {/* Integration Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Supported enterprise connectors</h2>
          <p className="text-xs text-muted mt-0.5">Automated issue generation and real-time security alerts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm flex flex-col justify-between gap-3 text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-surface-2 border border-border font-semibold text-accent flex items-center justify-center text-xs">
                      {item.iconText}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="text-[11px] text-muted">{item.category}</div>
                    </div>
                  </div>

                  <Badge variant={item.status === "connected" ? "success" : "neutral"}>
                    {item.status === "connected" ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <p className="text-muted leading-relaxed">
                  {item.description}
                </p>

                {item.configSummary && (
                  <div className="p-2 rounded bg-surface-2 text-[11px] font-mono text-muted">
                    {item.configSummary}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setIntegrations((prev) =>
                      prev.map((i) =>
                        i.id === item.id
                          ? { ...i, status: i.status === "connected" ? "disconnected" : "connected" }
                          : i
                      )
                    );
                  }}
                >
                  {item.status === "connected" ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Actions CI Step Snippet */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              CI/CD Pipeline Safety Gate (GitHub Actions)
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Execute an automated evaluation in your continuous delivery workflow and fail the build if critical jailbreaks are discovered.
            </p>
          </div>

          <Button variant="secondary" size="sm" onClick={handleCopySnippet}>
            {copiedSnippet ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy workflow YAML
              </>
            )}
          </Button>
        </div>

        <pre className="p-4 rounded-lg bg-surface-2 border border-border font-mono text-[11px] text-accent overflow-x-auto whitespace-pre">
          {ciSnippet}
        </pre>
      </div>

      {/* Outbound Webhooks Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Signed outbound webhooks</h2>
          <p className="text-xs text-muted mt-0.5">
            Deliver HMAC-SHA256 signed event payloads directly to internal SIEM or observability endpoints.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 text-muted border-b border-border font-medium">
                <tr>
                  <th className="py-3 px-4">Webhook endpoint</th>
                  <th className="py-3 px-4">Delivery URL</th>
                  <th className="py-3 px-4">Delivery status</th>
                  <th className="py-3 px-4">Success rate</th>
                  <th className="py-3 px-4">Last active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-foreground">{wh.name}</td>
                    <td className="py-3.5 px-4 font-mono text-muted">{wh.url}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-foreground tabular-nums">{wh.successRate}</td>
                    <td className="py-3.5 px-4 text-muted tabular-nums">{wh.lastDelivery}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted hover:text-danger"
                        onClick={() => setWebhooks((prev) => prev.filter((item) => item.id !== wh.id))}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Webhook Modal */}
      <Modal
        isOpen={webhookModalOpen}
        onClose={() => setWebhookModalOpen(false)}
        title="Add Signed Outbound Webhook"
        description="Receive cryptographic payload updates with SHA-256 HMAC signatures."
      >
        <form onSubmit={handleAddWebhook} className="space-y-4 text-xs">
          <div>
            <label className="block text-muted font-medium mb-1">Webhook display name</label>
            <input
              type="text"
              required
              placeholder="e.g. Datadog SIEM Bridge"
              value={newWebhookName}
              onChange={(e) => setNewWebhookName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs"
            />
          </div>

          <div>
            <label className="block text-muted font-medium mb-1">Payload URL (HTTPS Required)</label>
            <input
              type="url"
              required
              placeholder="https://your-domain.com/webhooks/bayora"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface-2 text-foreground focus:outline-none focus:border-accent text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setWebhookModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Register webhook
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

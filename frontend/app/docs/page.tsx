"use client";

import React, { useState } from "react";
import { 
  Code2, Terminal, Copy, Check, ExternalLink, ShieldCheck, 
  Database, Zap, Key, Layers, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";

export default function ApiDocsPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<"curl" | "python" | "typescript">("curl");

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const codeSnippets = {
    createEvaluation: {
      curl: `curl -X POST https://api.bayora.io/v1/evaluations \\
  -H "Authorization: Bearer byr_live_4f89d3a7..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_model": "Llama-3.1-70B-Instruct (Sandbox)",
    "name": "Production Jailbreak Safety Gate",
    "categories": ["Prompt Injection", "System Prompt Leak"]
  }'`,
      python: `from bayora import BayoraClient

client = BayoraClient(api_key="byr_live_4f89d3a7...")

# Launch an adversarial evaluation run
run = client.evaluations.create(
    target_model="Llama-3.1-70B-Instruct (Sandbox)",
    name="Production Jailbreak Safety Gate",
    categories=["Prompt Injection", "System Prompt Leak"]
)

print(f"Evaluation dispatched: {run.id}, Status: {run.status}")`,
      typescript: `import { Bayora } from '@bayora/sdk';

const bayora = new Bayora({ apiKey: process.env.BAYORA_API_KEY });

const run = await bayora.evaluations.create({
  targetModel: 'Llama-3.1-70B-Instruct (Sandbox)',
  name: 'Production Jailbreak Safety Gate',
  categories: ['Prompt Injection', 'System Prompt Leak'],
});

console.log(\`Evaluation dispatched: \${run.id}\`);`,
    },
    verifyLedger: {
      curl: `curl https://api.bayora.io/v1/audit/verify \\
  -H "Authorization: Bearer byr_live_4f89d3a7..."`,
      python: `# Reconstruct and independently verify the SHA-256 Merkle chain
verification = client.audit.verify_chain()
assert verification.is_valid, "Audit chain integrity failed!"
print(f"Merkle root: {verification.merkle_root}")`,
      typescript: `const verification = await bayora.audit.verifyChain();
if (!verification.isValid) {
  throw new Error('Audit chain integrity failed!');
}
console.log(\`Merkle Root: \${verification.merkleRoot}\`);`,
    },
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent">Public API</Badge>
            <span className="text-xs text-muted font-mono">v1.4.0 (OpenAPI 3.1)</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Developer API & SDK Reference
          </h1>
          <p className="text-sm text-muted mt-1">
            Programmatically trigger adversarial evaluations, stream telemetry, and verify cryptographic ledger proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector tabs */}
          <div className="flex items-center rounded-lg bg-surface-2 p-0.5 border border-border text-xs">
            {(["curl", "python", "typescript"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                  activeLang === lang
                    ? "bg-surface-1 text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Authentication</h2>
          <p className="text-xs text-muted mt-0.5">
            All API requests must include your scoped Bearer token in the <code className="font-mono text-accent">Authorization</code> header.
          </p>
        </div>

        <pre className="p-3.5 rounded bg-surface-2 border border-border font-mono text-[11px] text-foreground">
          Authorization: Bearer byr_live_••••••••9a2f
        </pre>
      </div>

      {/* Endpoint 1: Create Evaluation */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-accent/20 text-accent">
              POST
            </span>
            <span className="font-mono text-xs font-semibold text-foreground">
              /v1/evaluations
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyCode(codeSnippets.createEvaluation[activeLang], "eval")}
            className="text-xs"
          >
            {copiedKey === "eval" ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted">
          Initiate an adversarial red-team safety evaluation against a registered model target in an isolated sandbox.
        </p>

        <pre className="p-4 rounded-lg bg-surface-2 border border-border font-mono text-[11px] text-accent overflow-x-auto whitespace-pre">
          {codeSnippets.createEvaluation[activeLang]}
        </pre>

        {/* Response JSON */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold text-foreground block">Response (201 Created)</span>
          <pre className="p-3 rounded bg-surface-2 border border-border font-mono text-[11px] text-muted overflow-x-auto">
{`{
  "run_id": "run-8f2c-104",
  "name": "Production Jailbreak Safety Gate",
  "status": "RUNNING",
  "target_model": "Llama-3.1-70B-Instruct (Sandbox)",
  "commitment_hash": "7a8b9c0d1e2f3a4b5c6d7e8f...",
  "created_at": 1727744000
}`}
          </pre>
        </div>
      </div>

      {/* Endpoint 2: Verify Cryptographic Ledger */}
      <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-success/20 text-success">
              GET
            </span>
            <span className="font-mono text-xs font-semibold text-foreground">
              /v1/audit/verify
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyCode(codeSnippets.verifyLedger[activeLang], "verify")}
            className="text-xs"
          >
            {copiedKey === "verify" ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted">
          Download the latest cryptographic checkpoint and verify Ed25519 signatures and SHA-256 Merkle root integrity.
        </p>

        <pre className="p-4 rounded-lg bg-surface-2 border border-border font-mono text-[11px] text-accent overflow-x-auto whitespace-pre">
          {codeSnippets.verifyLedger[activeLang]}
        </pre>
      </div>
    </div>
  );
}

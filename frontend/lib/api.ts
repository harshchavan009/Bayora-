import { SystemHealth, TestRun, IsolationMatrixData, AuditBlock, AnomalyAlert, VerificationReport, UserRole } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch system health");
  return res.json();
}

export async function fetchRuns(role: UserRole = "admin"): Promise<TestRun[]> {
  const res = await fetch(`${API_BASE}/api/runs?viewer_role=${role}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json();
}

export async function fetchRunDetail(runId: string, role: UserRole = "admin"): Promise<any> {
  const res = await fetch(`${API_BASE}/api/runs/${runId}?viewer_role=${role}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch run detail");
  return res.json();
}

export async function revealRunPayload(runId: string, role: UserRole = "red"): Promise<any> {
  const res = await fetch(`${API_BASE}/api/runs/${runId}/reveal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ viewer_role: role }),
  });
  if (!res.ok) throw new Error("Failed to reveal payload");
  return res.json();
}

export async function verifyRunIndependently(runId: string): Promise<VerificationReport> {
  const res = await fetch(`${API_BASE}/api/runs/${runId}/verify`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to independently verify run");
  return res.json();
}

export async function executeTestRun(payload: {
  name: string;
  target_model?: string;
  adversarial_prompt: string;
  enable_blue_defense?: boolean;
  pad_timing?: boolean;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/api/runs/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit adversarial test run");
  return res.json();
}

export async function fetchIsolationMatrix(): Promise<IsolationMatrixData> {
  const res = await fetch(`${API_BASE}/api/isolation/matrix`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch isolation matrix");
  return res.json();
}

export async function testNetworkRoute(source: string, destination: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/isolation/test-route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, destination }),
  });
  if (!res.ok) throw new Error("Failed to test network route");
  return res.json();
}

export async function fetchAuditChain(): Promise<{
  public_key: string;
  total_blocks: number;
  blocks: AuditBlock[];
  checkpoints: any[];
}> {
  const res = await fetch(`${API_BASE}/api/audit/chain`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch audit chain");
  return res.json();
}

export async function triggerAuditTamper(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/audit/tamper-demo`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger tamper simulation");
  return res.json();
}

export async function simulateAuditTamperSandbox(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/audit/simulation/tamper`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to run sandboxed tamper simulation");
  return res.json();
}

export async function restoreAuditLedger(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/audit/restore`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to restore audit ledger");
  return res.json();
}

export async function generateCapabilityToken(payload: {
  name: string;
  role: string;
  tenant: string;
  scopes: string[];
}): Promise<any> {
  const res = await fetch(`${API_BASE}/api/access/tokens/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to generate token");
  return res.json();
}

export async function fetchCapabilities(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/access/capabilities`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch capabilities");
  return res.json();
}

export async function fetchLLMStatus(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/llm/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch LLM status");
  return res.json();
}

export async function runContaminationTest(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/llm/contamination-test`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to execute contamination test");
  return res.json();
}

export async function fetchAnomalies(): Promise<AnomalyAlert[]> {
  const res = await fetch(`${API_BASE}/api/observability/anomalies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch anomalies");
  return res.json();
}

export async function fetchTelemetry(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/observability/telemetry`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch telemetry");
  return res.json();
}

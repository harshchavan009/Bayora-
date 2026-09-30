export type UserRole = "admin" | "auditor" | "red" | "blue";

export interface PayloadView {
  display_text: string;
  is_redacted: boolean;
  reason: string;
  commitment_hash: string;
}

export interface DefenseView {
  display_text: string;
  is_redacted: boolean;
  reason: string;
}

export interface TestRun {
  run_id: string;
  name: string;
  target_model: string;
  status: "SETUP" | "RUNNING" | "CONCLUDED";
  created_at: number;
  concluded_at?: number;
  commitment_hash: string;
  is_revealed: boolean;
  payload_view: PayloadView;
  defense_view: DefenseView;
  blue_defense_triggered: boolean;
  canary_leaked: boolean;
  padded_time_ms: number;
  merkle_root?: string;
  model_response_text?: string;
}

export interface AuditBlock {
  index: number;
  timestamp: number;
  event_type: string;
  tenant: string;
  payload_hash: string;
  metadata: Record<string, any>;
  prev_hash: string;
  block_hash: string;
  signature: string;
}

export interface MerkleCheckpoint {
  checkpoint_id: string;
  run_id?: string;
  root_hash: string;
  leaf_count: number;
  timestamp: number;
  signature: string;
}

export interface IsolationMatrixData {
  nodes: string[];
  matrix: Record<string, Record<string, { allowed: boolean; self?: boolean; protocol?: string; description?: string }>>;
  rules: Array<{
    source: string;
    destination: string;
    allowed: boolean;
    protocol: string;
    port: number;
    rule_description: string;
  }>;
}

export interface SystemHealth {
  status: string;
  platform: string;
  version: string;
  isolation_score: number;
  ed25519_public_key: string;
  active_runs: number;
  total_runs: number;
  audit_blocks_count: number;
  canary_stats: {
    total_canaries_active: number;
    total_leaks_detected: number;
    recent_alerts: any[];
  };
  kv_cache_stats: {
    active_partitions: number;
    total_flushes_recorded: number;
    clean_isolation_score: number;
  };
  queue_stats: Record<string, {
    available_tokens: number;
    capacity: number;
    refill_rate: number;
    active_in_flight: number;
    max_concurrent: number;
    utilization_pct: number;
  }>;
}

export interface AnomalyAlert {
  alert_id: string;
  timestamp: number;
  rule_name: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  tenant: string;
  description: string;
  metadata: Record<string, any>;
  acknowledged: boolean;
}

export interface VerificationReport {
  run_id: string;
  overall_valid: boolean;
  verified_at: number;
  public_key_b64: string;
  total_blocks_checked: number;
  steps: Array<{
    check_name: string;
    status: "PASSED" | "FAILED" | "SKIPPED";
    details: string;
  }>;
  merkle_root?: string;
  sealed_commitments: Array<{
    commitment_id: string;
    commitment_hash: string;
    status: string;
    revealed_payload?: string;
    revealed_nonce?: string;
    match_verified?: boolean;
    recomputed_hash?: string;
    verified?: boolean;
  }>;
  tamper_alerts: string[];
}

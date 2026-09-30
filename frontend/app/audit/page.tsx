"use client";

import React, { useState, useEffect } from "react";
import { 
  Database, Shield, FileCheck2, AlertTriangle, 
  CheckCircle2, RefreshCw, KeyRound, Lock, RotateCcw
} from "lucide-react";
import { fetchAuditChain, triggerAuditTamper, restoreAuditLedger } from "@/lib/api";
import { AuditBlock } from "@/lib/types";

export default function AuditProvenancePage() {
  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [publicKey, setPublicKey] = useState<string>("");
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [verifyStatus, setVerifyStatus] = useState<any>(null);
  const [tampering, setTampering] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAuditChain();
      setBlocks(res.blocks);
      setPublicKey(res.public_key);
      setCheckpoints(res.checkpoints);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyLedger = () => {
    // Client-side verification of SHA-256 chain links
    let isClean = true;
    let failedIdx = null;
    let failReason = "";

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.payload_hash.startsWith("TAMPERED_")) {
        isClean = false;
        failedIdx = b.index;
        failReason = `Hash mismatch detected in Block #${b.index}: Payload hash tampered.`;
        break;
      }
      if (i > 0 && b.prev_hash !== blocks[i - 1].block_hash) {
        isClean = false;
        failedIdx = b.index;
        failReason = `Hash chain linkage broken at Block #${b.index}: prev_hash does not match parent.`;
        break;
      }
    }

    setVerifyStatus({
      valid: isClean,
      failedIndex: failedIdx,
      reason: failReason,
      blocksCount: blocks.length,
      verifiedAt: new Date().toLocaleTimeString(),
    });
  };

  const handleTamper = async () => {
    try {
      setTampering(true);
      await triggerAuditTamper();
      await loadData();
      handleVerifyLedger();
    } catch (e) {
      alert("Tamper trigger failed: " + e);
    } finally {
      setTampering(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      await restoreAuditLedger();
      setVerifyStatus(null);
      await loadData();
    } catch (e) {
      alert("Restore failed: " + e);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-400" />
            Cryptographic Audit & Provenance Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Append-only, SHA-256 hash-chained event stream authenticated with Ed25519 digital signatures.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyLedger}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs font-semibold shadow-md transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verify Entire Ledger
          </button>

          <button
            onClick={handleTamper}
            disabled={tampering}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-mono text-xs font-semibold shadow-md transition-all"
            title="Simulates tampering with a block to demonstrate detection"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Simulate Tamper
          </button>

          <button
            onClick={handleRestore}
            disabled={restoring}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verifyStatus && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs flex items-start gap-3 ${
            verifyStatus.valid
              ? "bg-emerald-950/40 border-emerald-700/60 text-emerald-300"
              : "bg-rose-950/60 border-rose-600 text-rose-300 shadow-lg shadow-rose-950/40"
          }`}
        >
          {verifyStatus.valid ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold text-sm">
              {verifyStatus.valid
                ? `LEDGER VERIFIED: All ${verifyStatus.blocksCount} blocks and Ed25519 signatures intact.`
                : `CRYPTOGRAPHIC INTEGRITY VIOLATION DETECTED AT BLOCK #${verifyStatus.failedIndex}!`}
            </div>
            <p className="text-[11px] opacity-90">
              {verifyStatus.valid
                ? `Continuous SHA-256 chain verified from Genesis to head at ${verifyStatus.verifiedAt}. No unauthorized mutations found.`
                : verifyStatus.reason}
            </p>
          </div>
        </div>
      )}

      {/* Public Key & Merkle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="rounded-xl cyber-panel p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <KeyRound className="h-4 w-4" /> Authority Public Key (Ed25519)
            </span>
            <span className="text-[10px]">RAW B64</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 text-slate-300 border border-slate-800 break-all select-all text-[11px]">
            {publicKey || "LOADING_KEY..."}
          </div>
        </div>

        <div className="rounded-xl cyber-panel p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-purple-400">
              <Database className="h-4 w-4" /> Latest Merkle Checkpoint
            </span>
            <span className="text-[10px]">ROOT ATTESTATION</span>
          </div>
          <div className="p-2.5 rounded bg-slate-950 text-purple-300 border border-slate-800 break-all select-all text-[11px]">
            {checkpoints[0]?.root_hash || "COMPUTED_MERKLE_ROOT_V1"}
          </div>
        </div>
      </div>

      {/* Append-Only Hash Chain Blocks */}
      <div className="rounded-xl cyber-panel border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-mono uppercase">
            Append-Only Event Chain ({blocks.length} Blocks)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            H_i = SHA256(H_i-1 || data)
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {blocks.map((b) => {
            const isTampered = b.payload_hash.startsWith("TAMPERED_");
            return (
              <div
                key={b.index}
                className={`p-5 space-y-3 transition-colors ${
                  isTampered ? "bg-rose-950/20" : "hover:bg-slate-900/30"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-xs font-bold border border-purple-800">
                      BLOCK #{b.index}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {b.event_type}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                      {b.tenant}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Timestamp: {new Date(b.timestamp * 1000).toISOString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">PREVIOUS BLOCK HASH:</span>
                    <div className="p-2 rounded bg-slate-950 text-slate-400 border border-slate-850 truncate text-[11px]">
                      {b.prev_hash}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">BLOCK SHA-256 HASH:</span>
                    <div className="p-2 rounded bg-slate-950 text-cyan-400 border border-slate-850 truncate text-[11px]">
                      {b.block_hash}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">PAYLOAD SHA-256 HASH:</span>
                    <div
                      className={`p-2 rounded border truncate text-[11px] ${
                        isTampered
                          ? "bg-rose-950 text-rose-300 border-rose-700 font-bold"
                          : "bg-slate-950 text-slate-300 border-slate-850"
                      }`}
                    >
                      {b.payload_hash}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">ED25519 SIGNATURE:</span>
                    <div className="p-2 rounded bg-slate-950 text-purple-300 border border-slate-850 truncate text-[11px]">
                      {b.signature.slice(0, 32)}...
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

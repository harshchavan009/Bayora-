"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Terminal, Database, Shield, Lock, 
  Cpu, Activity, FileText, ArrowRight, X 
} from "lucide-react";

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const items = [
    { label: "Overview Dashboard", category: "Navigation", href: "/dashboard", icon: Activity },
    { label: "Adversarial Evaluations", category: "Evaluations", href: "/evaluations", icon: Terminal },
    { label: "New Evaluation Campaign", category: "Actions", href: "/evaluations", icon: Terminal },
    { label: "Connected Model Targets", category: "Models", href: "/models", icon: Cpu },
    { label: "Security Findings & Vulnerabilities", category: "Findings", href: "/findings", icon: Shield },
    { label: "Network Isolation Heatmap", category: "Security", href: "/isolation", icon: Shield },
    { label: "Cryptographic Audit Ledger", category: "Governance", href: "/audit", icon: Database },
    { label: "Access Control & API Tokens", category: "Governance", href: "/access", icon: Lock },
    { label: "Monitoring & Response Telemetry", category: "Observability", href: "/monitoring", icon: Activity },
    { label: "Threat Model & Calibrated Risks", category: "Security", href: "/threat-model", icon: FileText },
    { label: "Workspace & Team Settings", category: "Settings", href: "/settings", icon: Lock },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-[2px] p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-surface-1 shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search (e.g. evaluations, findings, audit)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] text-muted border border-border font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 divide-y divide-border/40 text-xs">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-surface-2 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 text-muted group-hover:text-foreground" />
                    <span className="text-foreground font-medium">{item.label}</span>
                    <span className="text-[10px] text-muted font-normal px-1.5 py-0.2 rounded bg-surface-2">
                      {item.category}
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-muted">
              No results found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

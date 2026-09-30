"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, Shield, Network, Database, Lock, Cpu, Eye, 
  FileText, Search, Bell, ChevronDown, Check, Menu, X, 
  UserCheck, Layers, Terminal, Sparkles, Building2, HelpCircle
} from "lucide-react";
import { useRole } from "./RoleContext";
import { UserRole } from "@/lib/types";

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    simulated?: boolean;
    badge?: string;
  }[];
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, setRole } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Grouped SaaS navigation
  const navGroups: NavGroup[] = [
    {
      label: "Monitor",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Activity },
        { label: "LLM Threat Surface", href: "/llm-threat", icon: Cpu },
        { label: "Observability & Telemetry", href: "/observability", icon: Eye },
      ],
    },
    {
      label: "Test & Evaluate",
      items: [
        { label: "Adversarial Runs", href: "/dashboard", icon: Terminal },
        { label: "Public Overview", href: "/", icon: Layers },
      ],
    },
    {
      label: "Govern & Verify",
      items: [
        { label: "Isolation Matrix", href: "/isolation", icon: Network },
        { label: "Audit & Provenance", href: "/audit", icon: Database },
        { label: "Access & ABAC", href: "/access", icon: Lock },
        { label: "Threat Model & Risks", href: "/threat-model", icon: UserCheck },
      ],
    },
  ];

  // Derive breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === "/") return ["Bayora", "Overview"];
    if (pathname === "/dashboard") return ["Monitor", "Dashboard"];
    if (pathname === "/isolation") return ["Govern", "Isolation Matrix"];
    if (pathname === "/audit") return ["Govern", "Audit & Provenance"];
    if (pathname === "/access") return ["Govern", "Access Control & ABAC"];
    if (pathname === "/llm-threat") return ["Monitor", "LLM Threat Surface"];
    if (pathname === "/observability") return ["Monitor", "Observability & Telemetry"];
    if (pathname === "/threat-model") return ["Govern", "Threat Model"];
    if (pathname.startsWith("/runs/")) return ["Test", "Adversarial Run", pathname.split("/").pop() || ""];
    return ["Bayora", "Console"];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen flex bg-[#0c1017] text-slate-200 antialiased font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-800/80 bg-[#090d14] select-none">
        {/* Workspace Brand / Selector */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs tracking-tight">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white leading-none">
                Bayora
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                AI Safety Console
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
            v1.0
          </span>
        </div>

        {/* Organization pill */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="truncate font-medium">Acme AI Labs</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
              Prod
            </span>
          </div>
        </div>

        {/* Grouped Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-2 text-[11px] font-medium text-slate-400 tracking-wider">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-slate-800 text-white font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.simulated && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                          Sim
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: System Status */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Isolation Nominal
            </span>
            <Link href="/docs/known_limitations" className="text-slate-400 hover:text-slate-300">
              <HelpCircle className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2.5 px-2 py-1 rounded bg-slate-900/40 text-xs text-slate-300">
            <div className="h-6 w-6 rounded-full bg-cyan-900/60 border border-cyan-700/50 flex items-center justify-center text-[11px] font-bold text-cyan-300">
              H
            </div>
            <div className="flex flex-col truncate">
              <span className="truncate text-[11px] font-medium leading-tight">Harsh Chavan</span>
              <span className="text-[10px] text-slate-400 font-mono truncate">harsh@acme.ai</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800/80 bg-[#090d14]/90 backdrop-blur sticky top-0 z-40 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded text-slate-400 hover:text-white"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb Hierarchy */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-400">/</span>}
                  <span className={i === breadcrumbs.length - 1 ? "text-slate-200 font-medium" : "text-slate-400"}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Header Right: Search + Role Previewer + Controls */}
          <div className="flex items-center gap-3">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-400">Search engagement, payload...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Role Redaction Previewer (Calibrated from demo hack to admin tool) */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-md px-2 py-1 text-xs">
              <span className="text-[11px] text-slate-400 hidden lg:inline font-mono">
                Preview as:
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="bg-transparent text-slate-200 text-xs font-mono outline-none cursor-pointer"
                title="Admin tool to preview role-based redaction policies"
              >
                <option value="admin" className="bg-slate-900 text-slate-200">Admin (Unredacted)</option>
                <option value="auditor" className="bg-slate-900 text-slate-200">Auditor (Verified View)</option>
                <option value="red" className="bg-slate-900 text-slate-200">Red Team (Author View)</option>
                <option value="blue" className="bg-slate-900 text-slate-200">Blue Team (Sealed View)</option>
              </select>
            </div>

            {/* Notification bell */}
            <button
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#090d14] px-4 py-3 space-y-4">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {group.label}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {group.items.map((item, iIdx) => (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 p-2 rounded text-xs ${
                        pathname === item.href ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Page Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Calm Product Footer */}
        <footer className="border-t border-slate-800/60 bg-[#080c14] py-4 px-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-300">Bayora Platform</span>
              <span>•</span>
              <span>Ed25519 Provenance</span>
              <span>•</span>
              <span>Quantum Bucket Padding: 200ms</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <Link href="/threat-model" className="hover:text-slate-300">Threat Model</Link>
              <Link href="/isolation" className="hover:text-slate-300">Isolation Boundaries</Link>
              <span>Server UTC: {new Date().toISOString().slice(0, 19)}Z</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Cmd+K Search Modal Mock */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 px-1">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search engagements, runs, hashes, policies..."
                autoFocus
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
              >
                ESC
              </button>
            </div>
            <div className="space-y-1 text-xs">
              <div className="px-2 py-1 text-[11px] text-slate-400 uppercase font-mono">Quick Navigation</div>
              <Link
                href="/dashboard"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200"
              >
                <span>Dashboard & Live Telemetry</span>
                <span className="text-[10px] font-mono text-slate-400">Monitor</span>
              </Link>
              <Link
                href="/llm-threat"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200"
              >
                <span>LLM Threat Surface & Canaries</span>
                <span className="text-[10px] font-mono text-slate-400">Monitor</span>
              </Link>
              <Link
                href="/audit"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200"
              >
                <span>Cryptographic Audit & Merkle Ledger</span>
                <span className="text-[10px] font-mono text-slate-400">Govern</span>
              </Link>
              <Link
                href="/isolation"
                onClick={() => setSearchOpen(false)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200"
              >
                <span>Network Isolation Matrix</span>
                <span className="text-[10px] font-mono text-slate-400">Govern</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

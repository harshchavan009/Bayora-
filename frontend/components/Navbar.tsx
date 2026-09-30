"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Lock, Eye, Network, Cpu, Activity, FileCheck2, UserCheck } from "lucide-react";
import { useRole } from "./RoleContext";
import { UserRole } from "@/lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const { role, setRole } = useRole();

  const navItems = [
    { label: "Overview", href: "/", icon: Shield },
    { label: "Dashboard", href: "/dashboard", icon: Activity },
    { label: "Isolation Matrix", href: "/isolation", icon: Network },
    { label: "Audit & Provenance", href: "/audit", icon: FileCheck2 },
    { label: "Access & ABAC", href: "/access", icon: Lock },
    { label: "LLM Threat Surface", href: "/llm-threat", icon: Cpu },
    { label: "Observability", href: "/observability", icon: Eye },
    { label: "Threat Model", href: "/threat-model", icon: UserCheck },
  ];

  const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
    admin: { bg: "bg-purple-950/60", text: "text-purple-300", border: "border-purple-600/50" },
    auditor: { bg: "bg-emerald-950/60", text: "text-emerald-300", border: "border-emerald-600/50" },
    red: { bg: "bg-rose-950/60", text: "text-rose-300", border: "border-rose-600/50" },
    blue: { bg: "bg-cyan-950/60", text: "text-cyan-300", border: "border-cyan-600/50" },
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#070b14]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#070b14]">
                <Shield className="h-5 w-5 text-cyan-400 group-hover:scale-105 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                BAYORA
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  v1.0
                </span>
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-mono">
                AI Safety Sandbox
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Role Switcher & System Pulse */}
        <div className="flex items-center gap-4">
          {/* Liveness Pulse */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400">ISOLATION SECURE</span>
          </div>

          {/* Interactive Role Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 hidden md:inline font-mono">ROLE:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={`text-xs font-mono font-medium rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer outline-none ${roleColors[role].bg} ${roleColors[role].text} ${roleColors[role].border}`}
            >
              <option value="admin">Admin (All Access)</option>
              <option value="auditor">Auditor (Cryptographic View)</option>
              <option value="red">Red Team (Adversarial Author)</option>
              <option value="blue">Blue Team (Defense Engineer)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-800 space-x-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-2.5 py-1 text-xs rounded-md ${
                isActive ? "bg-slate-800 text-cyan-400" : "text-slate-400"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Terminal, Cpu, ShieldAlert, Network, 
  Database, Users, Activity, ShieldCheck, Settings, 
  Search, Bell, ChevronDown, Check, Menu, X, 
  ExternalLink, LogOut, Moon, Sun, Plus, Building2
} from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { CommandPalette } from "./ui/CommandPalette";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [utcString, setUtcString] = useState<string>("");

  // Workspaces list
  const workspaces = [
    { id: "ws-meridian", name: "Meridian Safety Labs", env: "Production", active: true },
    { id: "ws-anthos", name: "Anthos Red Team", env: "Staging", active: false },
  ];
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => setUtcString(new Date().toISOString().slice(0, 19) + "Z");
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Navigation structure
  const navSections: NavSection[] = [
    {
      title: "Workspace",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Evaluations", href: "/evaluations", icon: Terminal, badge: "2" },
        { label: "Model Targets", href: "/models", icon: Cpu },
        { label: "Findings", href: "/findings", icon: ShieldAlert, badge: "3" },
      ],
    },
    {
      title: "Security & Isolation",
      items: [
        { label: "Isolation Matrix", href: "/isolation", icon: Network },
        { label: "Audit Log", href: "/audit", icon: Database },
        { label: "Access & Team", href: "/access", icon: Users },
        { label: "Monitoring", href: "/monitoring", icon: Activity },
        { label: "Security Posture", href: "/threat-model", icon: ShieldCheck },
      ],
    },
    {
      title: "Configuration",
      items: [
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  // Derive breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === "/") return ["Marketing", "Home"];
    if (pathname === "/dashboard") return ["Overview"];
    if (pathname === "/evaluations") return ["Evaluations"];
    if (pathname.startsWith("/evaluations/")) return ["Evaluations", pathname.split("/").pop() || "Detail"];
    if (pathname === "/models") return ["Models"];
    if (pathname === "/findings") return ["Findings"];
    if (pathname === "/isolation") return ["Security", "Isolation Matrix"];
    if (pathname === "/audit") return ["Governance", "Audit Log"];
    if (pathname === "/access") return ["Governance", "Access & Team"];
    if (pathname === "/monitoring" || pathname === "/observability") return ["Monitoring"];
    if (pathname === "/threat-model") return ["Security", "Security Posture"];
    if (pathname === "/settings") return ["Settings"];
    if (pathname === "/health") return ["Platform", "Health"];
    return ["Console"];
  };

  const breadcrumbs = getBreadcrumbs();

  // If on public marketing landing page or auth routes, do not wrap in authenticated app shell
  const isPublicRoute = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/forgot-password");

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-canvas text-foreground flex flex-col antialiased">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 h-12 border-b border-border bg-surface-1/90 backdrop-blur-[4px] px-4 flex items-center justify-between">
        {/* Left: Mobile hamburger & breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-2"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-muted">
            <span className="font-medium text-foreground">{currentWorkspace.name}</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="text-faint">/</span>
                <span className={idx === breadcrumbs.length - 1 ? "text-foreground font-medium" : "text-muted"}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, User Menu, Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Cmd+K Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 h-7 px-2.5 rounded bg-surface-2 border border-border text-xs text-muted hover:text-foreground hover:border-border-strong transition-colors"
          >
            <Search className="h-3.5 w-3.5 text-muted" />
            <span>Search or jump to...</span>
            <kbd className="text-[10px] font-mono px-1 rounded bg-surface-1 border border-border text-muted">
              ⌘K
            </kbd>
          </button>

          {/* Notification bell */}
          <button
            className="relative p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded text-xs hover:bg-surface-2 transition-colors"
            >
              <div className="h-6 w-6 rounded-full bg-accent/20 text-accent font-semibold text-[11px] flex items-center justify-center border border-accent/30">
                HC
              </div>
              <ChevronDown className="h-3 w-3 text-muted" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-52 rounded-lg border border-border bg-surface-1 shadow-popover p-1.5 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 border-b border-border mb-1">
                    <div className="font-semibold text-foreground">Harsh Chavan</div>
                    <div className="text-[11px] text-muted">harsh@meridian.ai</div>
                    <div className="mt-1 inline-block px-1.5 py-0.2 rounded bg-surface-2 text-[10px] font-medium text-muted">
                      Organization Owner
                    </div>
                  </div>

                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-surface-2 text-foreground"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted" />
                    <span>Workspace Settings</span>
                  </Link>
                  <Link
                    href="/threat-model"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-surface-2 text-foreground"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-muted" />
                    <span>Security Posture</span>
                  </Link>

                  <div className="border-t border-border mt-1 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-danger-subtle text-danger"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar (240px) */}
        <aside className="hidden lg:flex w-60 border-r border-border bg-surface-1 flex-col justify-between shrink-0">
          <div className="flex flex-col">
            {/* Workspace Selector */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <button
                  onClick={() => setWorkspaceMenuOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-surface-2 border border-transparent hover:border-border text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded bg-accent text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-subtle">
                      B
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {currentWorkspace.name}
                      </div>
                      <div className="text-[10px] text-muted leading-tight">
                        {currentWorkspace.env}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted shrink-0 ml-1" />
                </button>

                {workspaceMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setWorkspaceMenuOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1 rounded-lg border border-border bg-surface-1 shadow-popover p-1 text-xs z-50">
                      <div className="px-2 py-1 text-[10px] font-medium text-muted uppercase">
                        Workspaces
                      </div>
                      {workspaces.map((ws) => (
                        <button
                          key={ws.id}
                          onClick={() => {
                            setCurrentWorkspace(ws);
                            setWorkspaceMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-2 text-left"
                        >
                          <div>
                            <div className="font-medium text-foreground">{ws.name}</div>
                            <div className="text-[10px] text-muted">{ws.env}</div>
                          </div>
                          {ws.id === currentWorkspace.id && (
                            <Check className="h-3.5 w-3.5 text-accent" />
                          )}
                        </button>
                      ))}
                      <div className="border-t border-border mt-1 pt-1">
                        <Link
                          href="/settings"
                          onClick={() => setWorkspaceMenuOpen(false)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2 text-muted hover:text-foreground text-[11px]"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Create Workspace</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="p-3 space-y-5">
              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2 text-[11px] font-medium text-muted">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-accent-subtle text-accent"
                              : "text-muted hover:text-foreground hover:bg-surface-2"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-muted"}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                              isActive ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer: System Status */}
          <div className="p-3 border-t border-border">
            <div className="px-2 py-2 rounded bg-surface-2/60 border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-[11px] font-medium text-foreground">Isolation Healthy</span>
              </div>
              <span className="text-[10px] text-muted font-mono">7/7 checks</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-64 max-w-[80vw] bg-surface-1 border-r border-border h-full flex flex-col justify-between p-4 z-50 animate-in slide-in-from-left duration-150">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-accent text-white flex items-center justify-center font-bold text-xs">
                      B
                    </div>
                    <span className="font-semibold text-xs text-foreground">Bayora</span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 rounded text-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="space-y-4">
                  {navSections.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="px-2 text-[11px] font-medium text-muted">
                        {section.title}
                      </div>
                      <div className="space-y-0.5">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium ${
                                isActive
                                  ? "bg-accent-subtle text-accent"
                                  : "text-muted hover:text-foreground hover:bg-surface-2"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                <span>Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          {/* Calm Enterprise Footer */}
          <footer className="border-t border-border bg-surface-1 py-3 px-6 text-xs text-muted">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Bayora AI Safety Platform</span>
                <span className="text-faint">•</span>
                <span>Ed25519 Provenance</span>
                <span className="text-faint">•</span>
                <span>Timing Normalization Active</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/threat-model" className="hover:text-foreground">Security Posture</Link>
                <Link href="/isolation" className="hover:text-foreground">Isolation Matrix</Link>
                <span suppressHydrationWarning className="font-mono text-faint">
                  Server UTC: {mounted ? (utcString || "2026-09-30T18:38:00Z") : "2026-09-30T18:38:00Z"}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Command Palette */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

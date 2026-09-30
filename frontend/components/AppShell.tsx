"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Terminal, Cpu, ShieldAlert, Network, 
  Database, Users, Activity, ShieldCheck, Settings, 
  Search, Bell, ChevronDown, Check, Menu, X, 
  ExternalLink, LogOut, Moon, Sun, Plus, Building2,
  Plug, BookOpen, HelpCircle, Layers, Sparkles, Command
} from "lucide-react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { CommandPalette } from "./ui/CommandPalette";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { RoleBadge } from "./ui/Badge";
import { useRole } from "./RoleContext";
import { getUnifiedMetrics } from "@/lib/dataStore";
import dynamic from "next/dynamic";

// Dynamic import for WebGL 3D Background with no SSR and no layout shift
const CanvasBackground = dynamic(() => import("./CanvasBackground"), { ssr: false });

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  getBadge?: () => string | number | undefined;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useRole();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Background effects preference: "full" | "reduced" | "off"
  const [bgMode, setBgMode] = useState<"full" | "reduced" | "off">("full");

  // Workspaces list
  const workspaces = [
    { id: "ws-meridian", name: "Meridian Safety Labs", env: "Production", active: true },
    { id: "ws-anthos", name: "Anthos Red Team", env: "Staging", active: false },
  ];
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);

  // Unified metrics for live counts
  const metrics = getUnifiedMetrics();

  useEffect(() => {
    setMounted(true);
    const savedBg = localStorage.getItem("bayora-bg-mode") as "full" | "reduced" | "off" | null;
    if (savedBg) setBgMode(savedBg);

    const hasCookieConsent = localStorage.getItem("bayora-cookie-consent");
    if (!hasCookieConsent) {
      setCookieConsent(false);
    }
  }, []);

  const handleSetBgMode = (mode: "full" | "reduced" | "off") => {
    setBgMode(mode);
    localStorage.setItem("bayora-bg-mode", mode);
  };

  const handleAcceptCookies = (mode: "essential" | "all") => {
    localStorage.setItem("bayora-cookie-consent", mode);
    setCookieConsent(true);
  };

  // Global Cmd+K and ? shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input / textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Navigation structure exactly matching breadcrumb sections
  const navSections: NavSection[] = [
    {
      title: "Workspace",
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Evaluations", href: "/evaluations", icon: Terminal, getBadge: () => (metrics.activeEvaluations > 0 ? metrics.activeEvaluations : undefined) },
        { label: "Model Targets", href: "/models", icon: Cpu },
        { label: "Findings", href: "/findings", icon: ShieldAlert, getBadge: () => (metrics.openFindings > 0 ? metrics.openFindings : undefined) },
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
        { label: "Integrations", href: "/integrations", icon: Plug },
        { label: "API & SDK Docs", href: "/docs", icon: BookOpen },
        { label: "Settings", href: "/settings", icon: Settings },
        { label: "Design System", href: "/design-system", icon: Sparkles },
      ],
    },
  ];

  // Derive breadcrumbs: [Section Title, Page Title]
  const getBreadcrumbs = () => {
    if (pathname === "/") return ["Marketing", "Home"];
    if (pathname === "/dashboard") return ["Workspace", "Overview"];
    if (pathname === "/evaluations") return ["Workspace", "Evaluations"];
    if (pathname.startsWith("/evaluations/")) return ["Workspace", "Evaluations", pathname.split("/").pop() || "Detail"];
    if (pathname === "/models") return ["Workspace", "Model Targets"];
    if (pathname === "/findings") return ["Workspace", "Findings"];
    if (pathname === "/isolation") return ["Security & Isolation", "Isolation Matrix"];
    if (pathname === "/audit") return ["Security & Isolation", "Audit Log"];
    if (pathname === "/access") return ["Security & Isolation", "Access & Team"];
    if (pathname === "/monitoring" || pathname === "/observability") return ["Security & Isolation", "Monitoring"];
    if (pathname === "/threat-model" || pathname === "/llm-threat") return ["Security & Isolation", "Security Posture"];
    if (pathname === "/integrations") return ["Configuration", "Integrations"];
    if (pathname === "/docs") return ["Configuration", "API & SDK Docs"];
    if (pathname === "/settings") return ["Configuration", "Settings"];
    if (pathname === "/design-system") return ["Configuration", "Design System"];
    if (pathname === "/status" || pathname === "/health") return ["Platform", "Status"];
    if (pathname === "/trust") return ["Security", "Trust Center"];
    return ["Workspace", "Overview"];
  };

  const breadcrumbs = getBreadcrumbs();

  // Public marketing & auth layouts do not use the authenticated shell
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname === "/status" ||
    pathname === "/trust" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/dpa";

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Determine if current page is data-heavy to automatically dim background
  const isDataHeavy =
    pathname === "/audit" ||
    pathname === "/findings" ||
    pathname === "/evaluations" ||
    pathname === "/isolation";

  return (
    <div className="relative min-h-screen bg-canvas text-foreground flex flex-col antialiased selection:bg-accent/20 selection:text-accent">
      {/* Premium 3D WebGL Background Layer */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 ${
          isDataHeavy ? "opacity-35" : "opacity-100"
        }`}
      >
        <CanvasBackground mode={bgMode} />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-12 border-b border-border bg-surface-1/90 backdrop-blur-md px-6 flex items-center justify-between">
        {/* Left: Mobile menu toggle & Breadcrumbs (Single source of truth) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Breadcrumbs (One only; page header does NOT duplicate) */}
          <nav className="flex items-center gap-1.5 text-xs text-muted">
            <span className="font-medium text-foreground">{currentWorkspace.name}</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="text-border">/</span>
                <span className={idx === breadcrumbs.length - 1 ? "text-foreground font-medium" : "text-muted"}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Search, Notifications, Background Toggle, Theme, User Avatar */}
        <div className="flex items-center gap-2">
          {/* Cmd+K Quick Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 h-7 px-2.5 rounded-md bg-surface-2 border border-border text-xs text-muted hover:text-foreground hover:border-border-strong transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-muted" />
            <span>Search or jump to...</span>
            <kbd className="text-[10px] font-mono px-1 rounded bg-surface-1 border border-border text-muted">
              ⌘K
            </kbd>
          </button>

          {/* Keyboard shortcuts helper (?) */}
          <button
            onClick={() => setShortcutsOpen(true)}
            className="hidden sm:flex p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notifications Center Toggle */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {metrics.activeAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-warning ring-2 ring-surface-1" />
              )}
            </button>

            {/* Notifications Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-surface-1/95 backdrop-blur-md p-3 shadow-lg z-50 text-xs space-y-2.5 animate-in fade-in-50 duration-100">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-foreground">Notifications</span>
                  <span className="text-[10px] text-muted tabular-nums">{metrics.activeAlerts} active</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-surface-2 border border-border space-y-0.5">
                    <div className="font-medium text-foreground flex items-center justify-between">
                      <span>Response Timing Jitter</span>
                      <span className="text-[10px] text-warning font-mono">ALT-042</span>
                    </div>
                    <p className="text-[11px] text-muted">
                      Timing padding bucket experienced 4.2ms variance on legacy proxy.
                    </p>
                  </div>
                  <div className="p-2 rounded bg-surface-2 border border-border space-y-0.5">
                    <div className="font-medium text-foreground flex items-center justify-between">
                      <span>Probe Burst Quota</span>
                      <span className="text-[10px] text-info font-mono">ALT-041</span>
                    </div>
                    <p className="text-[11px] text-muted">
                      Adversarial probe rate exceeded threshold; request queue throttled.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border text-center">
                  <Link
                    href="/monitoring"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[11px] text-accent hover:underline font-medium"
                  >
                    View all alerts in Monitoring →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu with Background Effects Setting */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-md hover:bg-surface-2 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 text-accent font-semibold text-[11px] flex items-center justify-center">
                AT
              </div>
              <ChevronDown className="w-3 h-3 text-muted" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface-1/95 backdrop-blur-md p-2 shadow-lg z-50 text-xs space-y-2 animate-in fade-in-50 duration-100">
                <div className="px-2 py-1.5 border-b border-border">
                  <div className="font-medium text-foreground">Dr. Aris Thorne</div>
                  <div className="text-[11px] text-muted font-mono truncate">aris.thorne@meridian.ai</div>
                </div>

                {/* 3D Background Effect Toggle */}
                <div className="px-2 py-1 space-y-1">
                  <div className="text-[11px] font-medium text-muted flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span>Background Effects:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded bg-surface-2 border border-border text-[10px]">
                    {(["full", "reduced", "off"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => handleSetBgMode(m)}
                        className={`py-0.5 rounded capitalize font-medium transition-colors ${
                          bgMode === m ? "bg-surface-1 text-foreground shadow-sm" : "text-muted hover:text-foreground"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-1">
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-2 py-1.5 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                  >
                    Workspace Settings
                  </Link>
                  <Link
                    href="/status"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-2 py-1.5 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                  >
                    System Status
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-2 py-1.5 rounded text-danger hover:bg-danger/10 transition-colors"
                  >
                    Sign Out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Role Preview Mode Banner (When active) */}
      {role !== "admin" && (
        <div className="w-full bg-accent/15 border-b border-accent/30 px-6 py-2 text-xs flex items-center justify-between text-foreground z-30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent">Preview mode:</span>
            <span>
              Viewing console with <strong className="capitalize">{role.replace(/_/g, " ")}</strong> permissions. Sensitive actions and unsealed payloads are restricted.
            </span>
          </div>

          <button
            onClick={() => setRole("admin")}
            className="text-accent underline font-semibold hover:text-accent-hover text-xs"
          >
            Exit preview
          </button>
        </div>
      )}

      {/* Body Shell */}
      <div className="relative z-10 flex-1 flex">
        {/* Desktop Sidebar (240px) */}
        <aside className="hidden lg:flex w-60 border-r border-border bg-surface-1/90 backdrop-blur-md flex-col justify-between shrink-0">
          <div>
            {/* Workspace Selector */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <button
                  onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-surface-2 border border-transparent hover:border-border transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-accent text-white font-bold text-xs flex items-center justify-center shrink-0">
                      B
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {currentWorkspace.name}
                      </div>
                      <div className="text-[10px] text-muted font-mono">{currentWorkspace.env}</div>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />
                </button>

                {workspaceMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-border bg-surface-1 p-1 shadow-lg z-30 text-xs">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setCurrentWorkspace(ws);
                          setWorkspaceMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-2 text-left"
                      >
                        <span className="truncate">{ws.name}</span>
                        {ws.id === currentWorkspace.id && (
                          <Check className="w-3.5 h-3.5 text-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Groups */}
            <nav className="p-3 space-y-4">
              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2 text-[11px] font-medium text-muted">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      // Strict matching to prevent duplicate highlights
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                      const badgeValue = item.getBadge?.();

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-accent/10 text-accent font-semibold"
                              : "text-muted hover:text-foreground hover:bg-surface-2"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-muted"}`} />
                            <span>{item.label}</span>
                          </div>
                          {badgeValue !== undefined && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums bg-surface-2 text-muted">
                              {badgeValue}
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

          {/* Sidebar Footer: Real-time Isolation Health */}
          <div className="p-3 border-t border-border">
            <Link
              href="/isolation"
              className="block p-2 rounded-md bg-surface-2/60 hover:bg-surface-2 border border-border transition-colors text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-[11px] font-medium text-foreground">Isolation Posture</span>
                </div>
                <span className="text-[10px] font-mono text-muted tabular-nums">
                  {metrics.passedChecks}/{metrics.totalChecks} checks
                </span>
              </div>
              <p className="text-[10px] text-muted truncate">
                1 check needs attention (Jitter)
              </p>
            </Link>
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
                    <div className="w-6 h-6 rounded bg-accent text-white flex items-center justify-center font-bold text-xs">
                      B
                    </div>
                    <span className="font-semibold text-xs text-foreground">Bayora</span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 rounded text-muted hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
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
                          const isActive =
                            pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium ${
                                isActive
                                  ? "bg-accent/10 text-accent font-semibold"
                                  : "text-muted hover:text-foreground hover:bg-surface-2"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className="w-4 h-4" />
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

        {/* Fluid Left-Aligned Content Area (Max 1440px, 32px gutters, no dead center gap) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 px-8 py-6 max-w-[1440px] w-full min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Keyboard Shortcuts Overlay (?) */}
      <Modal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title="Keyboard Shortcuts"
        description="Navigate and trigger high-frequency safety actions anywhere in the console."
      >
        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <span className="font-semibold text-foreground block">Global navigation</span>
            <div className="grid grid-cols-2 gap-2 text-muted">
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span>Command palette</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-1 font-mono text-[10px] text-foreground border border-border">⌘K</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span>Keyboard shortcuts</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-1 font-mono text-[10px] text-foreground border border-border">?</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span>Close modal / drawer</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-1 font-mono text-[10px] text-foreground border border-border">Esc</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-surface-2 border border-border">
                <span>Toggle sidebar</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-1 font-mono text-[10px] text-foreground border border-border">⌘B</kbd>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setShortcutsOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <div className="fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border border-border bg-surface-1/95 backdrop-blur-md shadow-xl z-50 text-xs space-y-3">
          <div className="space-y-1">
            <span className="font-semibold text-foreground block">Privacy & Security Preferences</span>
            <p className="text-muted leading-relaxed">
              Bayora uses essential cryptographic cookies and local storage tokens to preserve session security. No cross-site ad tracking is employed.
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleAcceptCookies("essential")}
            >
              Essential only
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="text-xs h-7"
              onClick={() => handleAcceptCookies("all")}
            >
              Accept all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

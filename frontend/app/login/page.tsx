"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiLogin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: "Owner", email: "owner@bayora.io", pass: "BayoraOwner2026!" },
    { role: "Admin", email: "admin@bayora.io", pass: "BayoraAdmin2026!" },
    { role: "Red Team", email: "red@bayora.io", pass: "BayoraRed2026!" },
    { role: "Blue Team", email: "blue@bayora.io", pass: "BayoraBlue2026!" },
    { role: "Auditor", email: "auditor@bayora.io", pass: "BayoraAuditor2026!" },
    { role: "Viewer", email: "viewer@bayora.io", pass: "BayoraViewer2026!" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiLogin(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-accent text-white flex items-center justify-center font-bold text-sm shadow-subtle">
            B
          </div>
          <span className="font-semibold text-base tracking-tight text-foreground">Bayora</span>
        </Link>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Sign in to your workspace
        </h2>
        <p className="text-xs text-muted">
          Enterprise AI safety validation control plane
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-lg border border-border bg-surface-1 p-6 sm:p-8 shadow-modal space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-danger-subtle border border-danger/20 text-danger text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-foreground mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-8 px-3 rounded border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-foreground">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-8 px-3 rounded border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2 h-8"
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick-fill Demo Switcher */}
          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted block">
              1-Click Demo Account Login
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => selectDemoAccount(acc)}
                  className="px-2 py-1.5 rounded border border-border bg-surface-2 hover:bg-surface-3 text-muted hover:text-foreground text-left transition-colors truncate"
                  title={`${acc.email} (${acc.pass})`}
                >
                  <span className="font-medium text-foreground block truncate">{acc.role}</span>
                  <span className="text-[10px] text-muted truncate block">{acc.email.split("@")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enterprise SSO */}
          <div className="pt-2 border-t border-border space-y-2 text-center">
            <span className="text-[10px] text-muted uppercase tracking-wider">
              Or continue with Single Sign-On (SSO)
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail("owner@bayora.io");
                  setPassword("BayoraOwner2026!");
                }}
                className="h-7 rounded border border-border bg-surface-2 hover:bg-surface-3 text-muted hover:text-foreground text-[11px] font-medium"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@bayora.io");
                  setPassword("BayoraAdmin2026!");
                }}
                className="h-7 rounded border border-border bg-surface-2 hover:bg-surface-3 text-muted hover:text-foreground text-[11px] font-medium"
              >
                Okta
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("auditor@bayora.io");
                  setPassword("BayoraAuditor2026!");
                }}
                className="h-7 rounded border border-border bg-surface-2 hover:bg-surface-3 text-muted hover:text-foreground text-[11px] font-medium"
              >
                Microsoft
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Don't have a workspace?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Create an organization
          </Link>
        </p>
      </div>
    </div>
  );
}

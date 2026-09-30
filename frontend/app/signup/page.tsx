"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiSignup } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiSignup(name, email, password, workspaceName || `${name}'s Lab`);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create organization.");
    } finally {
      setLoading(false);
    }
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
          Create your safety evaluation organization
        </h2>
        <p className="text-xs text-muted">
          Multi-tenant workspaces with cryptographic isolation and audit provenance
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

          <form onSubmit={handleSignup} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-foreground mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-8 px-3 rounded border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="jane@organization.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-8 px-3 rounded border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Organization / Lab Name</label>
              <input
                type="text"
                required
                placeholder="Meridian AI Safety Group"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full h-8 px-3 rounded border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-8 px-3 rounded border border-border bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-accent text-xs"
              />
            </div>

            <div className="text-[11px] text-muted space-y-1 pt-1">
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-3 w-3" />
                <span>Includes 14-day dedicated evaluation sandbox</span>
              </div>
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-3 w-3" />
                <span>Argon2id password hashing + httpOnly cookies</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2 h-8"
            >
              Create Organization & Continue
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

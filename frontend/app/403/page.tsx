"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-canvas text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="h-12 w-12 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto text-warning">
          <Lock className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <span className="font-mono text-xs text-warning">403 — ACCESS DENIED BY POLICY</span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Permission Required
          </h1>
          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
            Your current assigned role does not possess the attribute-based capability token required to inspect this resource.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-surface-2 border border-border text-xs text-muted text-left space-y-1">
          <span className="font-semibold text-foreground block">How to obtain access:</span>
          <p>
            Contact your workspace Administrator (<code className="font-mono text-foreground">admin@bayora.io</code>) to adjust your RBAC scope or request temporary elevated permissions.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Return to Dashboard
            </Button>
          </Link>
          <Link href="/access">
            <Button variant="secondary" size="sm">
              Review Permissions Grid
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

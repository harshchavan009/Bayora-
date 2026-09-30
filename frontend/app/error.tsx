"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="h-12 w-12 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto text-danger">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <span className="font-mono text-xs text-danger">500 — SYSTEM RUNTIME FAULT</span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Something unexpected occurred
          </h1>
          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
            The application encountered an uncaught runtime fault. Diagnostic error telemetry has been recorded to the audit log.
          </p>
        </div>

        {error.digest && (
          <div className="p-2.5 rounded bg-surface-2 border border-border font-mono text-[11px] text-muted truncate">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="primary" size="sm" onClick={() => reset()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Try again
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.location.href = "/dashboard"}>
            <Home className="h-3.5 w-3.5 mr-1.5" />
            Reload Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

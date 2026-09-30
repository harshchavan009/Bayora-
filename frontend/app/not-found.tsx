"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas text-foreground flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="h-12 w-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center mx-auto text-accent">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <span className="font-mono text-xs text-accent">404 — PAGE NOT FOUND</span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            This endpoint does not exist
          </h1>
          <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
            The requested resource could not be located in this workspace. It may have been moved, archived, or deleted.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              <Home className="h-4 w-4 mr-1.5" />
              Return to Overview
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" size="sm">
              Marketing Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

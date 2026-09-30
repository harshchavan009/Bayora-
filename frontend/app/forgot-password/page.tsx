"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          Reset your password
        </h2>
        <p className="text-xs text-muted">
          Enter your work email address to receive password reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-lg border border-border bg-surface-1 p-6 sm:p-8 shadow-modal space-y-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

              <Button type="submit" variant="primary" size="md" className="w-full h-8">
                Send Reset Instructions
              </Button>
            </form>
          ) : (
            <div className="space-y-3 text-center py-3">
              <div className="h-10 w-10 rounded-full bg-success-subtle text-success mx-auto flex items-center justify-center border border-success/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Instructions sent</h3>
              <p className="text-xs text-muted leading-relaxed">
                If an account exists for <span className="font-medium text-foreground">{email}</span>, you will receive an email with reset instructions shortly.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-border text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
              <ArrowLeft className="h-3 w-3" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

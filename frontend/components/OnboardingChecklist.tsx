"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, X, Users, Cpu, Play } from "lucide-react";
import { Button } from "./ui/Button";

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const steps = [
    {
      id: "step-ws",
      title: "Workspace Created",
      description: "Organization & dedicated sandbox subnets configured.",
      completed: true,
      action: null,
    },
    {
      id: "step-team",
      title: "Invite Teammates",
      description: "Assign Red Team operator and Blue Defense engineer roles.",
      completed: true,
      action: { label: "Manage Team", href: "/access" },
    },
    {
      id: "step-target",
      title: "Connect Model Endpoint",
      description: "Register your Ollama, vLLM, or OpenAI-compatible model target.",
      completed: false,
      action: { label: "Add Endpoint", href: "/models" },
    },
    {
      id: "step-run",
      title: "Run Baseline Safety Evaluation",
      description: "Execute a guided adversarial validation with sealed payloads.",
      completed: false,
      action: { label: "Launch Run", href: "/evaluations" },
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Workspace Onboarding Checklist
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Complete these 4 steps to certify your AI safety validation baseline.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted hover:text-foreground text-xs"
          title="Dismiss checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {steps.map((st, idx) => (
          <div
            key={st.id}
            className={`p-3.5 rounded-md border flex flex-col justify-between space-y-2 ${
              st.completed
                ? "bg-surface-2/40 border-border"
                : "bg-surface-2 border-border-strong"
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {st.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted shrink-0" />
                )}
                <span className={`font-semibold ${st.completed ? "text-foreground line-through text-muted" : "text-foreground"}`}>
                  {st.title}
                </span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed pl-6">
                {st.description}
              </p>
            </div>

            {st.action && !st.completed && (
              <div className="pl-6 pt-1">
                <Link href={st.action.href}>
                  <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1">
                    <span>{st.action.label}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

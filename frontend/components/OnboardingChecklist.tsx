"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, ChevronDown, ChevronUp, X, Sparkles } from "lucide-react";

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  const steps = [
    {
      id: "step-ws",
      title: "Workspace created",
      description: "Organization & dedicated sandbox subnets configured",
      completed: true,
      action: null,
    },
    {
      id: "step-team",
      title: "Invite teammates",
      description: "Assign Red team operator and Blue team defense roles",
      completed: true,
      action: { label: "Manage team", href: "/access" },
    },
    {
      id: "step-target",
      title: "Connect model endpoint",
      description: "Register your sandbox or gateway-mediated model target",
      completed: false,
      action: { label: "Add endpoint", href: "/models" },
    },
    {
      id: "step-run",
      title: "Run baseline safety evaluation",
      description: "Execute a guided adversarial validation with sealed payloads",
      completed: false,
      action: { label: "Launch evaluation", href: "/evaluations" },
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-3 transition-all duration-200">
      {/* Slim Header / Progress Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-accent/10 text-accent shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-xs font-medium text-foreground">
              Getting started
            </span>
            <span className="text-xs text-muted tabular-nums">
              • {completedCount} of {steps.length} completed ({progressPercent}%)
            </span>
          </div>

          {/* Slim progress bar */}
          <div className="hidden sm:block flex-1 max-w-xs h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground px-2 py-1 rounded transition-colors"
          >
            <span>{expanded ? "Hide steps" : "View steps"}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted hover:text-foreground p-1 rounded transition-colors"
            title="Dismiss checklist"
            aria-label="Dismiss checklist"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Steps Content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {steps.map((st) => (
            <div
              key={st.id}
              className={`p-2.5 rounded-md border flex flex-col justify-between gap-1.5 text-xs ${
                st.completed
                  ? "bg-surface-2/40 border-border"
                  : "bg-surface-2 border-border-strong"
              }`}
            >
              <div className="flex items-start gap-2">
                {st.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                )}
                <div>
                  <div
                    className={`font-medium ${
                      st.completed
                        ? "line-through text-muted"
                        : "text-foreground"
                    }`}
                  >
                    {st.title}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {st.description}
                  </div>
                </div>
              </div>

              {st.action && !st.completed && (
                <div className="pl-6 pt-1">
                  <Link
                    href={st.action.href}
                    className="inline-flex items-center gap-1 text-[11px] text-accent hover:text-accent-hover font-medium"
                  >
                    <span>{st.action.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

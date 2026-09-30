"use client";

import React from "react";

export interface MetricTileProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  subtext?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function MetricTile({
  label,
  value,
  delta,
  deltaType = "neutral",
  subtext,
  icon,
  badge,
}: MetricTileProps) {
  const deltaColor = {
    positive: "text-success",
    negative: "text-danger",
    neutral: "text-muted",
  }[deltaType];

  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-medium">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">
          {value}
        </span>
        {badge}
      </div>

      {(delta || subtext) && (
        <div className="flex items-center gap-1.5 text-[11px] text-muted pt-0.5">
          {delta && <span className={`font-medium ${deltaColor}`}>{delta}</span>}
          {delta && subtext && <span>•</span>}
          {subtext && <span className="text-faint">{subtext}</span>}
        </div>
      )}
    </div>
  );
}

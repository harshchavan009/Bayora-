"use client";

import React from "react";

export interface MetricTileProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral" | "warning";
  subtext?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: number[];
}

export function MetricTile({
  label,
  value,
  delta,
  deltaType = "neutral",
  subtext,
  icon,
  badge,
  trend,
}: MetricTileProps) {
  const deltaColor = {
    positive: "text-success",
    negative: "text-danger",
    warning: "text-warning",
    neutral: "text-muted",
  }[deltaType];

  // Render SVG sparkline if trend provided
  let sparklinePath = "";
  if (trend && trend.length > 1) {
    const min = Math.min(...trend);
    const max = Math.max(...trend);
    const range = max - min || 1;
    const width = 64;
    const height = 24;
    const points = trend.map((v, i) => {
      const x = (i / (trend.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    sparklinePath = points.join(" ");
  }

  const strokeColor =
    deltaType === "positive"
      ? "#3FB68B"
      : deltaType === "negative"
      ? "#E5534B"
      : deltaType === "warning"
      ? "#E2A336"
      : "#6E7BF2";

  return (
    <div className="rounded-lg border border-border bg-surface-1/90 backdrop-blur-sm p-4 space-y-2 hover:border-border-strong transition-colors">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-medium text-muted">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">
            {value}
          </div>
          {(delta || subtext) && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              {delta && <span className={`font-medium ${deltaColor}`}>{delta}</span>}
              {delta && subtext && <span className="text-border-strong">•</span>}
              {subtext && <span className="text-faint">{subtext}</span>}
            </div>
          )}
        </div>

        {trend && sparklinePath ? (
          <div className="shrink-0 mb-1" aria-hidden="true">
            <svg width="64" height="24" className="overflow-visible">
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePath}
              />
            </svg>
          </div>
        ) : (
          badge && <div className="shrink-0">{badge}</div>
        )}
      </div>
    </div>
  );
}

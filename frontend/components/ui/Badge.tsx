"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "red" | "blue" | "simulated" | "neutral" | "accent";
  dot?: boolean;
}

export function Badge({
  className = "",
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-surface-2 text-muted border-border",
    neutral: "bg-surface-2 text-muted border-border",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
    red: "bg-team-red/10 text-team-red border-team-red/20",
    blue: "bg-team-blue/10 text-team-blue border-team-blue/20",
    simulated: "bg-surface-2 text-muted border-dashed border-border-strong",
  };

  const dotColors: Record<string, string> = {
    default: "bg-muted",
    neutral: "bg-muted",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    red: "bg-team-red",
    blue: "bg-team-blue",
    simulated: "bg-faint",
  };

  const style = variantStyles[variant] || variantStyles.default;
  const dotColor = dotColors[variant] || dotColors.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${style} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
}

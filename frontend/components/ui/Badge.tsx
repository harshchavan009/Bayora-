"use client";

import React from "react";

export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({
  className = "",
  variant = "neutral",
  dot = true,
  children,
  ...props
}: BadgeProps) {
  // Soft filled tint + 1px subtle border, no heavy outlines
  const variantStyles: Record<BadgeVariant, string> = {
    neutral: "bg-surface-2 text-muted border-border",
    accent: "bg-accent/10 text-accent border-accent/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
  };

  const dotColors: Record<BadgeVariant, string> = {
    neutral: "bg-muted",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  };

  const style = variantStyles[variant] || variantStyles.neutral;
  const dotColor = dotColors[variant] || dotColors.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${style} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span className="capitalize">{children}</span>
    </span>
  );
}

// Role chip specification:
// "Role chips must NOT use danger/success colours. Use neutral chips with a tiny coloured dot (Red team = rose dot, Blue team = blue dot)."
export interface RoleBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  role: "owner" | "admin" | "red" | "blue" | "auditor" | "viewer" | string;
}

export function RoleBadge({ role, className = "", ...props }: RoleBadgeProps) {
  const roleConfig: Record<string, { label: string; dotClass: string }> = {
    owner: { label: "Owner", dotClass: "bg-accent" },
    admin: { label: "Admin", dotClass: "bg-accent" },
    red: { label: "Red Team", dotClass: "bg-[#D9667A]" }, // Muted rose
    blue: { label: "Blue Team", dotClass: "bg-[#5B8DEF]" }, // Muted blue
    auditor: { label: "Auditor", dotClass: "bg-warning" },
    viewer: { label: "Viewer", dotClass: "bg-muted" },
  };

  const config = roleConfig[role.toLowerCase()] || { label: role, dotClass: "bg-muted" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-surface-2 text-foreground border-border ${className}`}
      {...props}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}

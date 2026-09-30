"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "secondary", size = "md", loading, icon, children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-7 px-2.5 text-[11px] gap-1.5",
      md: "h-8 px-3 text-xs gap-1.5",
      lg: "h-9 px-4 text-sm gap-2",
    }[size];

    const variantClasses = {
      primary: "bg-accent text-white hover:bg-accent-hover font-medium shadow-subtle border border-accent/20",
      secondary: "bg-surface-2 hover:bg-surface-3 text-foreground font-medium border border-border",
      outline: "bg-transparent hover:bg-surface-2 text-foreground font-medium border border-border",
      ghost: "bg-transparent hover:bg-surface-2 text-muted hover:text-foreground font-medium",
      destructive: "bg-danger text-white hover:bg-danger/90 font-medium shadow-subtle border border-danger/20",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:pointer-events-none select-none ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  width = "md",
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-[2px]">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${widthClass} border-l border-border bg-surface-1 shadow-modal flex flex-col animate-in slide-in-from-right duration-150`}
        >
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {description && <p className="text-xs text-muted">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

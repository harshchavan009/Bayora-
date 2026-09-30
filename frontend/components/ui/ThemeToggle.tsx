"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { actualTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
      className={`p-1.5 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors ${className}`}
      title={`Switch to ${actualTheme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle color theme"
    >
      {actualTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

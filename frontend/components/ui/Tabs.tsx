"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div className={`flex items-center gap-1 border-b border-border text-xs ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative py-2.5 px-3 font-medium transition-colors ${
              isActive
                ? "text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted"
                }`}>
                  {tab.badge}
                </span>
              )}
            </div>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t" />
            )}
          </button>
        );
      })}
    </div>
  );
}

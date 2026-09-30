"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export interface HashBlockProps {
  value: string;
  truncate?: boolean;
  truncateLength?: number;
  className?: string;
  label?: string;
}

export function HashBlock({
  value,
  truncate = false,
  truncateLength = 16,
  className = "",
  label,
}: HashBlockProps) {
  const [copied, setCopied] = useState(false);

  const displayValue = truncate && value.length > truncateLength * 2
    ? `${value.slice(0, truncateLength)}...${value.slice(-truncateLength)}`
    : value;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${className}`}>
      {label && <span className="text-faint">{label}:</span>}
      <code className="px-1.5 py-0.5 rounded bg-surface-2 text-foreground/90 border border-border select-all">
        {displayValue}
      </code>
      <button
        onClick={handleCopy}
        className="p-1 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyLink}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5",
        "text-xs font-medium text-muted-foreground transition-all",
        "hover:bg-accent hover:text-foreground"
      )}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

"use client";

import { cn } from "@/lib/utils";

export type ServiceStatus = "operational" | "degraded" | "partial" | "major" | "maintenance";

interface StatusIndicatorProps {
  status: ServiceStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const statusConfig = {
  operational: {
    label: "Operational",
    dotClass: "bg-status-operational",
    textClass: "text-status-operational",
  },
  degraded: {
    label: "Degraded",
    dotClass: "bg-status-degraded",
    textClass: "text-status-degraded",
  },
  partial: {
    label: "Partial Outage",
    dotClass: "bg-status-partial",
    textClass: "text-status-partial",
  },
  major: {
    label: "Major Outage",
    dotClass: "bg-status-major",
    textClass: "text-status-major",
  },
  maintenance: {
    label: "Maintenance",
    dotClass: "bg-status-maintenance",
    textClass: "text-status-maintenance",
  },
};

export function StatusIndicator({ status, showLabel = true, size = "md" }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className={cn("font-medium", config.textClass, size === "sm" ? "text-xs" : "text-sm")}>
          {config.label}
        </span>
      )}
      <span
        className={cn(
          "rounded-full status-pulse",
          config.dotClass,
          size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
        )}
      />
    </div>
  );
}

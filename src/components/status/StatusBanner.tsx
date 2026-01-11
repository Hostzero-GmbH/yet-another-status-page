"use client";

import { CheckCircle2, AlertTriangle, AlertCircle, XCircle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export type OverallStatus = "operational" | "degraded" | "partial" | "major" | "maintenance";

interface StatusBannerProps {
  status: OverallStatus;
}

const statusConfig = {
  operational: {
    icon: CheckCircle2,
    text: "All systems are operational",
    className: "bg-status-banner-operational",
  },
  degraded: {
    icon: AlertTriangle,
    text: "Some systems are experiencing degraded performance",
    className: "bg-status-banner-degraded",
  },
  partial: {
    icon: AlertCircle,
    text: "Some systems are experiencing partial outages",
    className: "bg-status-banner-partial",
  },
  major: {
    icon: XCircle,
    text: "Major system outage in progress",
    className: "bg-status-banner-major",
  },
  maintenance: {
    icon: Wrench,
    text: "Scheduled maintenance in progress",
    className: "bg-status-banner-maintenance",
  },
};

export function StatusBanner({ status }: StatusBannerProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg px-6 py-4 text-white transition-all duration-300",
        config.className
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="text-base font-medium">{config.text}</span>
      </div>
    </div>
  );
}

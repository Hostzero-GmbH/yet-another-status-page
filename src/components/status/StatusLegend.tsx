"use client";

import { CheckCircle2, AlertTriangle, AlertCircle, XCircle, Wrench } from "lucide-react";

const legendItems = [
  { icon: CheckCircle2, label: "Operational", colorClass: "text-status-operational" },
  { icon: AlertTriangle, label: "Degraded Performance", colorClass: "text-status-degraded" },
  { icon: AlertCircle, label: "Partial Outage", colorClass: "text-status-partial" },
  { icon: XCircle, label: "Major Outage", colorClass: "text-status-major" },
  { icon: Wrench, label: "Maintenance", colorClass: "text-status-maintenance" },
];

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      {legendItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-1.5">
            <Icon className={`h-4 w-4 ${item.colorClass}`} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

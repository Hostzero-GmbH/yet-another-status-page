"use client";

import Link from "next/link";
import { Wrench, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/RichText";

export interface MaintenanceItem {
  id: string;
  shortId: string;
  title: string;
  description: unknown; // Lexical richText object
  scheduledAt: string;
  duration: string;
  affectedServices: string[];
  status: "upcoming" | "in_progress" | "completed";
}

interface MaintenanceCardProps {
  maintenance: MaintenanceItem;
}

export function MaintenanceCard({ maintenance }: MaintenanceCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-status-maintenance/10">
            <Wrench className="h-4 w-4 text-status-maintenance" />
          </div>
          <div className="flex flex-col gap-2">
            {maintenance.shortId ? (
              <Link
                href={`/m/${maintenance.shortId}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {maintenance.title}
              </Link>
            ) : (
              <h4 className="font-semibold text-foreground">{maintenance.title}</h4>
            )}
            <div className="text-sm text-muted-foreground">
              <RichText content={maintenance.description} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {maintenance.scheduledAt}
              </span>
              {maintenance.duration && <span>Duration: {maintenance.duration}</span>}
            </div>
            {maintenance.affectedServices.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {maintenance.affectedServices.map((service) => (
                  <span
                    key={service}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {service}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <span
          className={cn(
            "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium",
            maintenance.status === "upcoming" && "bg-status-maintenance/10 text-status-maintenance",
            maintenance.status === "in_progress" && "bg-status-degraded/10 text-status-degraded",
            maintenance.status === "completed" && "bg-status-operational/10 text-status-operational"
          )}
        >
          {maintenance.status === "upcoming" && "Upcoming"}
          {maintenance.status === "in_progress" && "In Progress"}
          {maintenance.status === "completed" && "Completed"}
        </span>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { incidentStatusConfig, type IncidentUpdateStatus } from "@/lib/status-config";
import type { ServiceStatus } from "./StatusIndicator";

export interface IncidentUpdate {
  id: string;
  status: IncidentUpdateStatus;
  message: string;
  timestamp: string;
}

export interface Incident {
  id: string;
  shortId?: string;
  title: string;
  status: ServiceStatus;
  updates: IncidentUpdate[];
}

export interface DayIncidents {
  date: string;
  incidents: Incident[];
}

export interface DayIncidentsWithSlug extends DayIncidents {
  dateSlug: string;
}

interface IncidentTimelineProps {
  days: DayIncidents[];
}

interface IncidentTimelineWithLinksProps {
  days: DayIncidentsWithSlug[];
}

export function IncidentTimeline({ days }: IncidentTimelineProps) {
  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div key={day.date} className="animate-fade-in">
          <h3 className="mb-3 text-lg font-semibold text-foreground">{day.date}</h3>
          {day.incidents.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/30 px-5 py-4">
              <p className="text-sm text-muted-foreground">No incidents reported.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {day.incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function IncidentTimelineWithLinks({ days }: IncidentTimelineWithLinksProps) {
  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div key={day.date} className="animate-fade-in">
          <h3 className="mb-3 text-lg font-semibold text-foreground">
            {day.date}
          </h3>
          {day.incidents.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/30 px-5 py-4">
              <p className="text-sm text-muted-foreground">No incidents reported.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {day.incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} linkToDetail />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function IncidentCard({ incident, linkToDetail = false }: { incident: Incident; linkToDetail?: boolean }) {
  // Check the last update (most recent) for resolved status
  const latestUpdate = incident.updates[incident.updates.length - 1];
  const isResolved = latestUpdate?.status === "resolved";

  const titleElement = linkToDetail && incident.shortId ? (
    <Link 
      href={`/i/${incident.shortId}`}
      className="font-semibold text-foreground hover:text-primary transition-colors"
    >
      {incident.title}
    </Link>
  ) : (
    <h4 className="font-semibold text-foreground">{incident.title}</h4>
  );

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        {titleElement}
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            isResolved
              ? "bg-status-operational/10 text-status-operational"
              : "bg-status-degraded/10 text-status-degraded"
          )}
        >
          {isResolved ? "Resolved" : "Ongoing"}
        </span>
      </div>
      <div className="p-5">
        <div className="relative space-y-4">
          {incident.updates.map((update, index) => {
            const config = incidentStatusConfig[update.status];
            const Icon = config.icon;
            const isLast = index === incident.updates.length - 1;

            return (
              <div key={update.id} className="relative flex gap-4">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-[11px] top-7 h-[calc(100%+8px)] w-0.5 bg-border" />
                )}
                {/* Status icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                    config.bgColor
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className={cn("text-sm font-semibold capitalize", config.color)}>
                      {update.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{update.timestamp}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{update.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

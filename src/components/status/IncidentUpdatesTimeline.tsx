import { cn } from "@/lib/utils";
import { incidentStatusConfig, type IncidentUpdateStatus } from "@/lib/status-config";

interface IncidentUpdate {
  id: string;
  status: IncidentUpdateStatus;
  message: string;
  timestamp: string;
  date: string;
}

interface IncidentUpdatesTimelineProps {
  updates: IncidentUpdate[];
}

export function IncidentUpdatesTimeline({ updates }: IncidentUpdatesTimelineProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="relative space-y-6">
        {updates.map((update, index) => {
          const config = incidentStatusConfig[update.status];
          const Icon = config.icon;
          const isLast = index === updates.length - 1;

          return (
            <div key={update.id} className="relative flex gap-4">
              {!isLast && (
                <div className="absolute left-[11px] top-7 h-[calc(100%+16px)] w-0.5 bg-border" />
              )}
              <div
                className={cn(
                  "relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
                  config.bgColor
                )}
              >
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className={cn("text-sm font-semibold", config.color)}>
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {update.date} at {update.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{update.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

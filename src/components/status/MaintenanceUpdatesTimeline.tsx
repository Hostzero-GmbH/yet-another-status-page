import { cn } from "@/lib/utils";
import { maintenanceStatusConfig, type MaintenanceUpdateStatus } from "@/lib/status-config";

interface MaintenanceUpdate {
  id: string;
  status: MaintenanceUpdateStatus;
  message: string;
  dateTime: string;
}

interface MaintenanceUpdatesTimelineProps {
  updates: MaintenanceUpdate[];
}

export function MaintenanceUpdatesTimeline({ updates }: MaintenanceUpdatesTimelineProps) {
  if (updates.length === 0) return null;

  return (
    <section className="animate-fade-in">
      <h2 className="mb-6 text-xl font-bold text-foreground">Updates</h2>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="relative space-y-6">
          {updates.map((update, index) => {
            const config = maintenanceStatusConfig[update.status] || maintenanceStatusConfig.upcoming;
            const UpdateIcon = config.icon;
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
                  <UpdateIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className={cn("text-sm font-semibold", config.color)}>
                      {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{update.dateTime}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{update.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

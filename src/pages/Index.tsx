import { useState } from "react";
import { StatusBanner } from "@/components/status/StatusBanner";
import { ServiceGroup, type Service } from "@/components/status/ServiceGroup";
import { MaintenanceCard, type MaintenanceItem } from "@/components/status/MaintenanceCard";
import { IncidentTimeline, type DayIncidents } from "@/components/status/IncidentTimeline";
import { StatusLegend } from "@/components/status/StatusLegend";
import { ThemeToggle } from "@/components/status/ThemeToggle";
import { SubscribeDialog, SubscribeButton } from "@/components/status/SubscribeDialog";
import { useTheme } from "next-themes";
import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";

// Sample data
const serviceGroups: { name: string; services: Service[] }[] = [
  {
    name: "Core Infrastructure",
    services: [
      { name: "API Gateway", status: "operational" },
      { name: "Database Cluster", status: "operational" },
      { name: "CDN", status: "operational" },
      { name: "Load Balancers", status: "operational" },
    ],
  },
  {
    name: "Web Applications",
    services: [
      { name: "Main Website", status: "operational" },
      { name: "Dashboard", status: "operational" },
      { name: "Admin Portal", status: "operational" },
    ],
  },
  {
    name: "Services",
    services: [
      { name: "Authentication", status: "operational" },
      { name: "Email Service", status: "operational" },
      { name: "Payment Processing", status: "operational" },
      { name: "File Storage", status: "operational" },
    ],
  },
];

const scheduledMaintenance: MaintenanceItem[] = [
  {
    id: "maint-1",
    title: "Database Migration",
    description:
      "We will be performing a scheduled database migration to improve performance. You may experience brief interruptions during this time.",
    scheduledAt: "Jan 10, 2026 at 2:00 AM UTC",
    duration: "~2 hours",
    affectedServices: ["Database Cluster", "API Gateway"],
    status: "upcoming",
  },
];

const pastIncidents: DayIncidents[] = [
  {
    date: "January 6, 2026",
    incidents: [],
  },
  {
    date: "January 5, 2026",
    incidents: [
      {
        id: "inc-1",
        title: "API Gateway Latency Issues",
        status: "operational",
        updates: [
          {
            id: "upd-1",
            status: "resolved",
            message:
              "The issue has been resolved. All API endpoints are now responding normally. We have implemented additional monitoring to prevent future occurrences.",
            timestamp: "4:45 PM UTC",
          },
          {
            id: "upd-2",
            status: "monitoring",
            message:
              "We have deployed a fix and are monitoring the situation closely. Response times are improving.",
            timestamp: "4:15 PM UTC",
          },
          {
            id: "upd-3",
            status: "identified",
            message:
              "We have identified the root cause as a memory leak in one of our edge servers. A fix is being deployed.",
            timestamp: "3:30 PM UTC",
          },
          {
            id: "upd-4",
            status: "investigating",
            message:
              "We are investigating reports of increased latency on API requests. Some users may experience slower response times.",
            timestamp: "3:00 PM UTC",
          },
        ],
      },
    ],
  },
  {
    date: "January 4, 2026",
    incidents: [],
  },
  {
    date: "January 3, 2026",
    incidents: [
      {
        id: "inc-2",
        title: "Email Service Degradation",
        status: "operational",
        updates: [
          {
            id: "upd-5",
            status: "resolved",
            message:
              "Email delivery is back to normal. All queued emails have been sent. We apologize for any inconvenience.",
            timestamp: "11:30 AM UTC",
          },
          {
            id: "upd-6",
            status: "identified",
            message:
              "The issue was caused by a third-party provider outage. We are working with them to restore service.",
            timestamp: "10:00 AM UTC",
          },
          {
            id: "upd-7",
            status: "investigating",
            message:
              "We are aware of delays in email delivery and are investigating the issue.",
            timestamp: "9:15 AM UTC",
          },
        ],
      },
    ],
  },
  {
    date: "January 2, 2026",
    incidents: [],
  },
];

function getOverallStatus() {
  const allServices = serviceGroups.flatMap((g) => g.services);
  const statuses = allServices.map((s) => s.status);

  if (statuses.some((s) => s === "major")) return "major";
  if (statuses.some((s) => s === "partial")) return "partial";
  if (statuses.some((s) => s === "degraded")) return "degraded";
  if (statuses.some((s) => s === "maintenance")) return "maintenance";
  return "operational";
}

export default function Index() {
  const overallStatus = getOverallStatus();
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Subscribe Dialog */}
      <SubscribeDialog isOpen={isSubscribeOpen} onClose={() => setIsSubscribeOpen(false)} />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src={resolvedTheme === "dark" ? logoDark : logoLight}
              alt="Hostzero"
              className="h-10 transition-opacity duration-300"
            />
            <div className="h-6 w-px bg-border" />
            <p className="text-sm font-medium text-muted-foreground">System Status</p>
          </div>
          <div className="flex items-center gap-3">
            <SubscribeButton onClick={() => setIsSubscribeOpen(true)} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Status Banner */}
        <section className="mb-8 animate-fade-in">
          <StatusBanner status={overallStatus} />
        </section>

        {/* Service Groups */}
        <section className="mb-10 space-y-4">
          {serviceGroups.map((group, index) => (
            <div
              key={group.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ServiceGroup name={group.name} services={group.services} />
            </div>
          ))}
        </section>

        {/* Status Legend */}
        <section className="mb-10">
          <StatusLegend />
        </section>

        {/* Scheduled Maintenance */}
        {scheduledMaintenance.length > 0 && (
          <section className="mb-10 animate-fade-in">
            <h2 className="mb-4 text-xl font-bold text-foreground">Scheduled Maintenance</h2>
            <div className="space-y-4">
              {scheduledMaintenance.map((maintenance) => (
                <MaintenanceCard key={maintenance.id} maintenance={maintenance} />
              ))}
            </div>
          </section>
        )}

        {/* Past Incidents */}
        <section className="animate-fade-in">
          <h2 className="mb-6 text-xl font-bold text-foreground">Past Incidents</h2>
          <IncidentTimeline days={pastIncidents} />
          <div className="mt-6 text-center">
            <a
              href="/history"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              ← View incident history
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">
            © 2026 Hostzero. All systems monitored 24/7.
          </p>
        </div>
      </footer>
    </div>
  );
}

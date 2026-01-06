import { useState } from "react";
import { Link } from "react-router-dom";
import { IncidentTimeline, type DayIncidents } from "@/components/status/IncidentTimeline";
import { ThemeToggle } from "@/components/status/ThemeToggle";
import { useTheme } from "next-themes";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";

// Extended historical data
const allIncidents: DayIncidents[] = [
  { date: "January 6, 2026", incidents: [] },
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
            message: "The issue has been resolved. All API endpoints are now responding normally.",
            timestamp: "4:45 PM UTC",
          },
          {
            id: "upd-2",
            status: "monitoring",
            message: "We have deployed a fix and are monitoring the situation closely.",
            timestamp: "4:15 PM UTC",
          },
          {
            id: "upd-3",
            status: "identified",
            message: "We have identified the root cause as a memory leak in one of our edge servers.",
            timestamp: "3:30 PM UTC",
          },
          {
            id: "upd-4",
            status: "investigating",
            message: "We are investigating reports of increased latency on API requests.",
            timestamp: "3:00 PM UTC",
          },
        ],
      },
    ],
  },
  { date: "January 4, 2026", incidents: [] },
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
            message: "Email delivery is back to normal. All queued emails have been sent.",
            timestamp: "11:30 AM UTC",
          },
          {
            id: "upd-6",
            status: "identified",
            message: "The issue was caused by a third-party provider outage.",
            timestamp: "10:00 AM UTC",
          },
          {
            id: "upd-7",
            status: "investigating",
            message: "We are aware of delays in email delivery and are investigating.",
            timestamp: "9:15 AM UTC",
          },
        ],
      },
    ],
  },
  { date: "January 2, 2026", incidents: [] },
  { date: "January 1, 2026", incidents: [] },
  {
    date: "December 31, 2025",
    incidents: [
      {
        id: "inc-3",
        title: "Dashboard Unavailable",
        status: "operational",
        updates: [
          {
            id: "upd-8",
            status: "resolved",
            message: "Dashboard is fully operational again.",
            timestamp: "2:00 PM UTC",
          },
          {
            id: "upd-9",
            status: "investigating",
            message: "Dashboard is experiencing connectivity issues.",
            timestamp: "1:15 PM UTC",
          },
        ],
      },
    ],
  },
  { date: "December 30, 2025", incidents: [] },
  { date: "December 29, 2025", incidents: [] },
  {
    date: "December 28, 2025",
    incidents: [
      {
        id: "inc-4",
        title: "Payment Processing Delays",
        status: "operational",
        updates: [
          {
            id: "upd-10",
            status: "resolved",
            message: "Payment processing has returned to normal speeds.",
            timestamp: "6:30 PM UTC",
          },
          {
            id: "upd-11",
            status: "monitoring",
            message: "We are monitoring the payment gateway closely.",
            timestamp: "5:00 PM UTC",
          },
          {
            id: "upd-12",
            status: "investigating",
            message: "Users are reporting delayed payment confirmations.",
            timestamp: "4:00 PM UTC",
          },
        ],
      },
    ],
  },
  { date: "December 27, 2025", incidents: [] },
  { date: "December 26, 2025", incidents: [] },
  { date: "December 25, 2025", incidents: [] },
  {
    date: "December 24, 2025",
    incidents: [
      {
        id: "inc-5",
        title: "CDN Performance Degradation",
        status: "operational",
        updates: [
          {
            id: "upd-13",
            status: "resolved",
            message: "CDN performance has been restored.",
            timestamp: "10:00 AM UTC",
          },
          {
            id: "upd-14",
            status: "investigating",
            message: "We are investigating slow asset loading times.",
            timestamp: "8:30 AM UTC",
          },
        ],
      },
    ],
  },
  { date: "December 23, 2025", incidents: [] },
  { date: "December 22, 2025", incidents: [] },
  { date: "December 21, 2025", incidents: [] },
  { date: "December 20, 2025", incidents: [] },
];

const ITEMS_PER_PAGE = 7;

export default function History() {
  const { resolvedTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(allIncidents.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentIncidents = allIncidents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  // Get date range for current page
  const firstDate = currentIncidents[0]?.date || "";
  const lastDate = currentIncidents[currentIncidents.length - 1]?.date || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img
                src={resolvedTheme === "dark" ? logoDark : logoLight}
                alt="Hostzero"
                className="h-10"
              />
            </Link>
            <div className="h-6 w-px bg-border" />
            <p className="text-sm font-medium text-muted-foreground">Incident History</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to current status
          </Link>
        </div>

        {/* Title and Date Range */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">Incident History</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{lastDate} – {firstDate}</span>
          </div>
        </div>

        {/* Timeline */}
        <section className="mb-8 animate-fade-in">
          <IncidentTimeline days={currentIncidents} />
        </section>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Older
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentPage === 0}
            className="flex items-center gap-2"
          >
            Newer
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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

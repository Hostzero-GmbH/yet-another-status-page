import { CheckCircle2, AlertTriangle, Search, AlertCircle, Wrench, Clock } from "lucide-react"

/**
 * Shared status configuration for incident and maintenance updates
 * Used across timeline components for consistent styling
 */

export const incidentStatusConfig = {
  investigating: {
    icon: Search,
    color: "text-status-major",
    bgColor: "bg-status-major",
    label: "Investigating",
  },
  identified: {
    icon: AlertTriangle,
    color: "text-status-degraded",
    bgColor: "bg-status-degraded",
    label: "Identified",
  },
  monitoring: {
    icon: AlertCircle,
    color: "text-status-maintenance",
    bgColor: "bg-status-maintenance",
    label: "Monitoring",
  },
  resolved: {
    icon: CheckCircle2,
    color: "text-status-operational",
    bgColor: "bg-status-operational",
    label: "Resolved",
  },
} as const

export type IncidentUpdateStatus = keyof typeof incidentStatusConfig

export const maintenanceStatusConfig = {
  upcoming: {
    icon: Clock,
    color: "text-status-maintenance",
    bgColor: "bg-status-maintenance",
    label: "Scheduled",
  },
  in_progress: {
    icon: Wrench,
    color: "text-status-degraded",
    bgColor: "bg-status-maintenance",
    label: "In Progress",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-status-operational",
    bgColor: "bg-status-operational",
    label: "Completed",
  },
  cancelled: {
    icon: AlertTriangle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Cancelled",
  },
} as const

export type MaintenanceUpdateStatus = keyof typeof maintenanceStatusConfig

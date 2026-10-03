import type { Field } from "payload";
import { localizedDateAdmin } from "@/lib/localizedDateAdmin";
import { incidentStatusOptions } from "@/collections/Incidents";

/**
 * Shared field definitions for incidents.
 *
 * These are referenced by both the `Incidents` collection and the
 * `IncidentTemplates` collection so that a template always mirrors the
 * fields of a real incident.
 */
export const incidentFields: Field[] = [
  {
    name: "title",
    type: "text",
    required: true,
    label: "Incident Title",
    admin: {
      description: 'A brief description of the incident (e.g., "API Gateway Latency Issues")',
    },
  },
  {
    name: "affectedServices",
    type: "relationship",
    relationTo: "services",
    hasMany: true,
    label: "Affected Services",
    admin: {
      description: "Services affected by this incident",
    },
  },
];

/**
 * Updates timeline field. Required with at least one row on real incidents,
 * optional on templates so a template can pre-fill updates.
 */
export function updatesField(options?: { required?: boolean }): Field {
  return {
    name: "updates",
    type: "array",
    required: options?.required ?? false,
    minRows: options?.required ? 1 : undefined,
    label: "Updates",
    admin: {
      description: options?.required
        ? "Timeline of updates for this incident. At least one update is required."
        : "Optional timeline of updates to pre-fill",
    },
    fields: [
      {
        name: "status",
        type: "select",
        required: true,
        options: [...incidentStatusOptions],
        admin: {
          description: "Status at the time of this update",
        },
      },
      {
        name: "message",
        type: "textarea",
        required: true,
        admin: {
          description: "Update message",
        },
      },
      {
        name: "createdAt",
        type: "date",
        required: true,
        defaultValue: () => new Date().toISOString(),
        admin: localizedDateAdmin({
          description: "When this update was posted",
        }),
      },
    ],
  };
}
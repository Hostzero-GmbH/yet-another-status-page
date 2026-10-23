import type { Field } from "payload";
import { localizedDateAdmin } from "@/lib/localizedDateAdmin";
import { maintenanceStatusOptions } from "@/collections/Maintenances";

/**
 * Shared field definitions for maintenances.
 *
 * These are referenced by both the `Maintenances` collection and the
 * `MaintenanceTemplates` collection so that a template always mirrors the
 * fields of a real maintenance.
 */
export const maintenanceFields: Field[] = [
  {
    name: "title",
    type: "text",
    required: true,
    label: "Maintenance Title",
    admin: {
      description: 'A brief description of the maintenance (e.g., "Database Migration")',
    },
  },
  {
    name: "description",
    type: "richText",
    label: "Description",
    admin: {
      description: "Detailed description of the maintenance work",
    },
  },
  {
    name: "affectedServices",
    type: "relationship",
    relationTo: "services",
    hasMany: true,
    label: "Affected Services",
    admin: {
      description: "Services that will be affected by this maintenance",
    },
  },
  {
    name: "duration",
    type: "text",
    label: "Duration",
    admin: {
      description: 'Human-readable duration (e.g., "~2 hours")',
    },
  },
  {
    type: "row",
    fields: [
      {
        name: "autoStartOnSchedule",
        type: "checkbox",
        defaultValue: true,
        label: "Auto-start on schedule",
        admin: {
          description: 'Automatically set to "In Progress" when start time is reached',
          width: "50%",
        },
      },
      {
        name: "autoCompleteOnSchedule",
        type: "checkbox",
        defaultValue: true,
        label: "Auto-complete on schedule",
        admin: {
          description: 'Automatically set to "Completed" when end time is reached',
          width: "50%",
        },
      },
    ],
  },
];

/**
 * Status field. Read-only on real maintenances (derived from updates/schedule),
 * editable on templates so a template can set an initial status.
 */
export function statusField(options?: { readOnly?: boolean }): Field {
  return {
    name: "status",
    type: "select",
    required: true,
    defaultValue: "upcoming",
    options: [...maintenanceStatusOptions],
    index: true,
    label: "Status",
    admin: {
      description: options?.readOnly
        ? "Derived from the latest entry in Updates, or auto-transitioned by schedule. Post an update to change status."
        : "Initial status applied to the maintenance",
      readOnly: options?.readOnly ?? false,
    },
  };
}

/**
 * Updates timeline field, shared between maintenances and templates.
 */
export function updatesField(): Field {
  return {
    name: "updates",
    type: "array",
    label: "Updates",
    admin: {
      description: "Optional timeline of updates for this maintenance",
    },
    fields: [
      {
        name: "status",
        type: "select",
        required: true,
        options: [...maintenanceStatusOptions],
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

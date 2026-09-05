import type { TemplateCollectionConfig, TemplateType } from "./types";

/**
 * Maps each templatable entity type to its template collection and the field
 * paths that should be copied onto a new document.
 *
 * This is the single source of truth used by the admin "Apply template"
 * component to know which collection to read from and which fields to fill.
 */
export const templateMap: Record<TemplateType, TemplateCollectionConfig> = {
  incident: {
    templateCollection: "incident-templates",
    fieldPaths: ["title", "affectedServices", "updates"],
  },
  maintenance: {
    templateCollection: "maintenance-templates",
    fieldPaths: [
      "title",
      "description",
      "affectedServices",
      "duration",
      "autoStartOnSchedule",
      "autoCompleteOnSchedule",
      "status",
    ],
  },
};

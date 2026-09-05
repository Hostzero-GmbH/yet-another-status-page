import type { Field } from "payload";

/**
 * A templatable entity type. Each value maps to a real collection
 * (incidents / maintenances) and its corresponding template collection.
 */
export type TemplateType = "incident" | "maintenance";

/**
 * Describes how a template collection relates to its target collection:
 * which template collection to read from, and which field paths hold the
 * values that should be copied onto a new document.
 */
export interface TemplateCollectionConfig {
  /** Slug of the collection that stores the templates. */
  templateCollection: string;
  /** Field paths (top-level) that should be copied from a template. */
  fieldPaths: string[];
}

/**
 * Options for building a template collection.
 */
export interface CreateTemplateCollectionOptions {
  slug: string;
  label: string;
  singularLabel: string;
  /** Extra fields beyond the shared ones (e.g. `name`). */
  fields: Field[];
  group?: string;
}

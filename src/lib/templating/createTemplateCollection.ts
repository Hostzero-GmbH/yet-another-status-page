import type { CollectionConfig } from "payload";
import { authenticatedOrTestWrite } from "@/lib/access";
import type { CreateTemplateCollectionOptions } from "./types";

/**
 * Builds a template collection. Template collections are admin-only stores of
 * reusable field values; they are not part of the public API surface, so all
 * operations require an authenticated user (or test mode).
 */
export function createTemplateCollection(
  options: CreateTemplateCollectionOptions,
): CollectionConfig {
  const { slug, label, singularLabel, fields, group } = options;

  return {
    slug,
    admin: {
      useAsTitle: "name",
      defaultColumns: ["name", "updatedAt"],
      group,
    },
    access: {
      read: authenticatedOrTestWrite,
      create: authenticatedOrTestWrite,
      update: authenticatedOrTestWrite,
      delete: authenticatedOrTestWrite,
    },
    labels: {
      plural: label,
      singular: singularLabel,
    },
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        label: "Template Name",
        admin: {
          description: "A short name to identify this template",
        },
      },
      ...fields,
    ],
  };
}

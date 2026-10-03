import { createTemplateCollection } from "@/lib/templating/createTemplateCollection";
import { maintenanceFields, statusField } from "@/fields/maintenanceFields";

export const MaintenanceTemplates = createTemplateCollection({
  slug: "maintenance-templates",
  label: "Maintenance Templates",
  singularLabel: "Maintenance Template",
  group: "Templates",
  fields: [...maintenanceFields, statusField()],
});

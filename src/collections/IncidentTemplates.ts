import { createTemplateCollection } from "@/lib/templating/createTemplateCollection";
import { incidentFields, updatesField } from "@/fields/incidentFields";

export const IncidentTemplates = createTemplateCollection({
  slug: "incident-templates",
  label: "Incident Templates",
  singularLabel: "Incident Template",
  group: "Templates",
  fields: [...incidentFields, updatesField()],
});
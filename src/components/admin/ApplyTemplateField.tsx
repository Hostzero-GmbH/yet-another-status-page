"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useAllFormFields,
  useDocumentInfo,
  useField,
  useForm,
  SelectInput,
  FieldLabel,
  Button,
  FieldDescription,
} from "@payloadcms/ui";
import { templateMap } from "@/lib/templating/templateMap";
import type { TemplateType } from "@/lib/templating/types";

type ApplyTemplateFieldProps = {
  path: string;
  field: {
    admin?: {
      components?: {
        Field?: string;
      };
    };
  };
};

/**
 * Admin field rendered at the top of the Incident / Maintenance create forms.
 * Lets the user pick a saved template and fill the form fields with its values.
 */
export const ApplyTemplateField: React.FC<ApplyTemplateFieldProps> = () => {
  const { setModified } = useForm();
  const { collectionSlug } = useDocumentInfo();
  const [, dispatchFields] = useAllFormFields();

  // The template type is derived from the collection slug. The component is
  // only mounted on incident/maintenance create forms.
  const templateType: TemplateType | null =
    collectionSlug === "incidents"
      ? "incident"
      : collectionSlug === "maintenances"
        ? "maintenance"
        : null;

  const titleField = useField({ path: "title" });
  const affectedServicesField = useField({ path: "affectedServices" });
  const durationField = useField({ path: "duration" });
  const autoStartField = useField({ path: "autoStartOnSchedule" });
  const autoCompleteField = useField({ path: "autoCompleteOnSchedule" });
  const statusField = useField({ path: "status" });

  const setters: Record<string, (value: unknown) => void> = {
    title: titleField.setValue,
    affectedServices: affectedServicesField.setValue,
    duration: durationField.setValue,
    autoStartOnSchedule: autoStartField.setValue,
    autoCompleteOnSchedule: autoCompleteField.setValue,
    status: statusField.setValue,
  };

  // Fields whose UI does not re-sync from a plain setValue (richText, arrays).
  // These must be dispatched with an initialValue so the underlying
  // editor/component re-mounts with the new value.
  const needsInitialValue = new Set(["description", "updates"]);

  const [templates, setTemplates] = useState<Array<{ id: number | string; name: string }>>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = templateType ? templateMap[templateType] : null;

  // Load the templates for the current collection.
  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/${config.templateCollection}?limit=100&depth=0`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        setTemplates(data?.docs || []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load templates");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [config]);

  const selectedTemplate = useMemo(
    () => templates.find((t) => String(t.id) === selected),
    [templates, selected],
  );

  const apply = () => {
    if (!selectedTemplate || !config) return;

    for (const fieldPath of config.fieldPaths) {
      const value = (selectedTemplate as Record<string, unknown>)[fieldPath];

      if (needsInitialValue.has(fieldPath)) {
        dispatchFields({
          type: "UPDATE",
          path: fieldPath,
          value,
          initialValue: value,
        });
      } else {
        setters[fieldPath]?.(value);
      }
    }

    setModified(true);
  };

  return (
    <div className="field-type">
      <FieldLabel label="Template" htmlFor="template" />
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <SelectInput
          path="template"
          name="template"
          style={{ width: "100%" }}
          options={templates.map((t) => ({
            label: t.name,
            value: String(t.id),
          }))}
          value={selected || undefined}
          onChange={(option) => {
            if (option && !Array.isArray(option)) {
              setSelected(String(option.value));
            } else {
              setSelected("");
            }
          }}
          placeholder={
            loading
              ? "Loading templates…"
              : templates.length === 0
                ? "No templates available"
                : "Select a template…"
          }
        />
        <Button
          buttonStyle="subtle"
          className="btn--no-margin"
          size="large"
          onClick={apply}
          disabled={!selectedTemplate}
        >
          Apply
        </Button>
      </div>

      <FieldDescription path='template' description={'Applying a template will replace your existing data.'} />

      {error && <div className="template-sidebar-error">{error}</div>}
    </div>
  );
};

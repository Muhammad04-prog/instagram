"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useAddLocation, useUpdateLocation } from "@/hooks/useLocation";
import { locationSchema, type LocationFormValues } from "@/lib/validators/location.schema";
import type { LocationDto } from "@/types/api.types";

/**
 * Add / edit a location. Editing calls `update-LocationDto` — BACKEND_BUGS #19
 * (a mapper error on this endpoint) is fixed now, the update call works.
 */
export function LocationForm({
  editing,
  onDone,
}: {
  editing?: LocationDto | null;
  onDone?: () => void;
}) {
  const t = useTranslations("locations");
  const tv = useTranslations("validation");
  const add = useAddLocation();
  const update = useUpdateLocation();

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema(tv)),
    values: {
      city: editing?.city ?? "",
      state: editing?.state ?? "",
      zipCode: editing?.zipCode ?? "",
      country: editing?.country ?? "",
    },
  });

  const pending = add.isPending || update.isPending;

  const onSubmit = form.handleSubmit((values) => {
    if (editing) {
      update.mutate({ id: editing.id, dto: values }, { onSuccess: () => onDone?.() });
      return;
    }
    add.mutate(values, {
      onSuccess: () => {
        form.reset({ city: "", state: "", zipCode: "", country: "" });
        onDone?.();
      },
    });
  });

  const fields = ["city", "state", "zipCode", "country"] as const;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field} className="space-y-1">
          <label htmlFor={field} className="text-ig-text block text-sm font-semibold">
            {t(field)}
          </label>
          <Input id={field} {...form.register(field)} aria-label={t(field)} />
          {form.formState.errors[field] ? (
            <p className="text-ig-danger text-xs">{form.formState.errors[field]?.message}</p>
          ) : null}
        </div>
      ))}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-ig-primary rounded-lg px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {editing ? t("save") : t("add")}
        </button>
        {editing ? (
          <button
            type="button"
            onClick={onDone}
            className="bg-ig-button-secondary text-ig-text rounded-lg px-4 py-1.5 text-sm font-semibold"
          >
            {t("cancel")}
          </button>
        ) : null}
      </div>
    </form>
  );
}

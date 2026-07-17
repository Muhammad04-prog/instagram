"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocationForm } from "@/components/settings/LocationForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useDeleteLocation, useLocations } from "@/hooks/useLocation";
import type { LocationDto } from "@/types/api.types";

/**
 * Full CRUD for locations. It lives in Settings and not in `post/create`: the
 * API has no post↔location link (`add-post` has no location field, and
 * `update-user-profile` does not accept `locationId`), so "Add place" on the
 * create screen would be a button that saves nothing.
 */
export function LocationManager() {
  const t = useTranslations("locations");
  const [editing, setEditing] = useState<LocationDto | null>(null);
  const [toDelete, setToDelete] = useState<LocationDto | null>(null);

  const { data, isPending, isError, refetch } = useLocations();
  const remove = useDeleteLocation();

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-ig-text text-base font-semibold">{editing ? t("edit") : t("add")}</h2>
        <LocationForm editing={editing} onDone={() => setEditing(null)} />
      </section>

      <section className="space-y-2">
        <h2 className="text-ig-text text-base font-semibold">{t("saved")}</h2>

        {isPending ? (
          <Loader className="py-10" />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : !data || data.length === 0 ? (
          <p className="text-ig-text-secondary py-10 text-center text-sm">{t("empty")}</p>
        ) : (
          <ul className="divide-ig-separator divide-y">
            {data.map((location) => (
              <li key={location.id} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <span className="text-ig-text block truncate text-sm font-semibold">
                    {[location.city, location.state].filter(Boolean).join(", ") || "—"}
                  </span>
                  <span className="text-ig-text-secondary block truncate text-xs">
                    {[location.country, location.zipCode].filter(Boolean).join(" · ")}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => setEditing(location)}
                  aria-label={t("edit")}
                  className="text-ig-text-secondary hover:text-ig-text p-1"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(location)}
                  aria-label={t("delete")}
                  className="text-ig-danger p-1"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t("delete")}
        description={t("deleteConfirm")}
        confirmLabel={t("delete")}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
      />
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ADJUSTMENT_KEYS,
  NEUTRAL_ADJUSTMENTS,
  ORIGINAL_FILTER,
  PHOTO_FILTERS,
  previewCss,
  type Adjustments,
} from "@/lib/filters";
import { cn } from "@/lib/utils";

/**
 * Step 3 of creating a post — img31 ("Фильтры") and img32 ("Настройки").
 *
 * Two tabs, exactly as the screenshots show: a 3-column grid of filter
 * thumbnails with the selected one outlined and labelled blue, and five sliders.
 *
 * The two halves are stored differently, and that is deliberate:
 * - a **filter** has an API field, so it travels by name and is applied on
 *   display — it stays editable forever;
 * - the **sliders** have no field anywhere in the API, so they are baked into
 *   the pixels on upload. Faking a field the backend does not have would mean
 *   silently losing them.
 */
export function EditMediaStep({
  preview,
  filterId,
  adjustments,
  onFilterChange,
  onAdjustmentsChange,
}: {
  /** Object URL of the current slide. */
  preview: string;
  filterId: string;
  adjustments: Adjustments;
  onFilterChange: (id: string) => void;
  onAdjustmentsChange: (adjustments: Adjustments) => void;
}) {
  const t = useTranslations("post");
  const [tab, setTab] = useState("filters");

  return (
    <div className="flex flex-col md:flex-row">
      <div className="flex items-center justify-center bg-black md:w-[60%]">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview, never optimised */}
        <img
          src={preview}
          alt=""
          style={{ filter: previewCss(filterId, adjustments) || undefined }}
          className="max-h-[460px] w-full object-contain"
        />
      </div>

      <div className="flex-1">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="border-ig-separator w-full justify-around rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="filters" className="flex-1 rounded-none py-3 text-sm">
              {t("filtersTab")}
            </TabsTrigger>
            <TabsTrigger value="adjust" className="flex-1 rounded-none py-3 text-sm">
              {t("adjustTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="max-h-[400px] overflow-y-auto p-4">
            <ul className="grid grid-cols-3 gap-3">
              {PHOTO_FILTERS.map((filter) => {
                const active = filter.id === filterId;
                return (
                  <li key={filter.id}>
                    <button
                      type="button"
                      onClick={() => onFilterChange(filter.id)}
                      aria-pressed={active}
                      className="w-full"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview */}
                      <img
                        src={preview}
                        alt=""
                        style={{ filter: filter.css || undefined }}
                        className={cn(
                          "aspect-square w-full rounded object-cover",
                          active && "ring-ig-primary ring-2",
                        )}
                      />
                      <span
                        className={cn(
                          "mt-1 block truncate text-center text-xs",
                          active ? "text-ig-primary font-semibold" : "text-ig-text-secondary",
                        )}
                      >
                        {filter.id === ORIGINAL_FILTER ? t("originalFilter") : filter.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </TabsContent>

          <TabsContent value="adjust" className="max-h-[400px] space-y-5 overflow-y-auto p-4">
            {ADJUSTMENT_KEYS.map((key) => (
              <label key={key} className="block">
                <span className="text-ig-text flex justify-between text-sm">
                  {t(`adjust_${key}`)}
                  <span className="text-ig-text-secondary tabular-nums">{adjustments[key]}</span>
                </span>
                <input
                  type="range"
                  // Vignette only darkens; the rest go both ways from neutral.
                  min={key === "vignette" ? 0 : -100}
                  max={100}
                  value={adjustments[key]}
                  onChange={(event) =>
                    onAdjustmentsChange({ ...adjustments, [key]: Number(event.target.value) })
                  }
                  className="accent-ig-primary mt-2 w-full"
                />
              </label>
            ))}

            <button
              type="button"
              onClick={() => onAdjustmentsChange(NEUTRAL_ADJUSTMENTS)}
              className="text-ig-primary text-sm font-semibold"
            >
              {t("resetAdjustments")}
            </button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

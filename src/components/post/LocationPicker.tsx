"use client";

import { MapPin, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useLocations } from "@/hooks/useLocation";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { LocationDto } from "@/types/api.types";

/**
 * "Add location" — img33, which Phase 10 could not build.
 *
 * Softclub's `add-post` had no location field at all, so the button would have
 * saved nothing and we left it out rather than fake it. `POST /posts` takes
 * `locationId` now, and `/locations?q=` searches the list.
 */
export function LocationPicker({
  value,
  onChange,
}: {
  value: LocationDto | null;
  onChange: (location: LocationDto | null) => void;
}) {
  const t = useTranslations("post");
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim(), SEARCH_DEBOUNCE_MS);
  const { data } = useLocations(debounced);

  const results = debounced ? (data ?? []) : [];

  if (value) {
    return (
      <div className="border-ig-separator flex items-center gap-2 border-t py-3">
        <MapPin className="text-ig-text size-4 shrink-0" />
        <span className="text-ig-text flex-1 truncate text-sm">{describe(value)}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={t("removeLocation")}
          className="text-ig-text-secondary hover:text-ig-text"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="border-ig-separator relative border-t py-3">
      <div className="flex items-center gap-2">
        <MapPin className="text-ig-text-secondary size-4 shrink-0" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t("addLocation")}
          aria-label={t("addLocation")}
          className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {results.length > 0 ? (
        <ul className="bg-ig-elevated border-ig-separator absolute right-0 left-0 z-10 mt-2 max-h-56 overflow-y-auto rounded-lg border shadow-lg">
          {results.map((location) => (
            <li key={location.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(location);
                  setTerm("");
                }}
                className="hover:bg-ig-bg-secondary text-ig-text block w-full px-3 py-2 text-left text-sm"
              >
                {describe(location)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** "Dushanbe, Tajikistan" — state/zip are optional on the DTO. */
function describe(location: LocationDto): string {
  return [location.city, location.state, location.country].filter(Boolean).join(", ");
}

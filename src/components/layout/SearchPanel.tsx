"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SearchResults } from "@/components/search/SearchResults";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/useDebounce";
import { useAddSearchHistory } from "@/hooks/useUserSearch";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";

/**
 * Slide-out panel anchored to the collapsed sidebar. No screenshot exists for it
 * (INDEX.md §4), so the layout follows IG's live search panel.
 */
export function SearchPanel() {
  const t = useTranslations("search");
  const { panel, closePanel } = useUiStore();
  const open = panel === "search";

  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim());
  const addText = useAddSearchHistory();

  // Clear the query when the panel closes — adjusting state during render is the
  // recommended alternative to a reset effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setTerm("");
  }

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        "border-ig-border bg-ig-bg left-sidebar-collapsed fixed inset-y-0 z-30 hidden w-[397px] flex-col rounded-r-2xl border-r transition-transform duration-200 md:flex",
        open ? "translate-x-0" : "pointer-events-none -translate-x-full",
      )}
    >
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-ig-text mb-8 text-2xl font-semibold">{t("title")}</h2>
        <form
          className="relative"
          onSubmit={(event) => {
            event.preventDefault();
            const text = term.trim();
            if (text) addText.mutate(text);
          }}
        >
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
          />
          {term ? (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label={t("clear")}
              className="text-ig-text-secondary absolute inset-y-0 right-3 flex items-center"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </form>
      </div>

      <Separator className="bg-ig-separator" />

      <div className="flex-1 overflow-y-auto">
        <SearchResults
          term={term}
          debouncedTerm={debounced}
          onPickTerm={setTerm}
          onNavigate={closePanel}
        />
      </div>
    </aside>
  );
}

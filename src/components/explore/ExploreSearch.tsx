"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { SearchResults } from "@/components/search/SearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { useAddSearchHistory } from "@/hooks/useUserSearch";

/**
 * The centred search field at the top of /explore (img23): pill input, magnifier
 * on the left. Focusing it drops the same panel body used by the sidebar search.
 */
export function ExploreSearch() {
  const t = useTranslations("search");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(term.trim());
  const addText = useAddSearchHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative mx-auto mb-6 w-full max-w-[630px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const text = term.trim();
          if (text) addText.mutate(text);
        }}
      >
        <Search className="text-ig-text-secondary pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg pr-10 pl-10 text-sm outline-none"
        />
        {term ? (
          <button
            type="button"
            onClick={() => setTerm("")}
            aria-label={t("clear")}
            className="text-ig-text-secondary absolute top-1/2 right-3 -translate-y-1/2"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </form>

      {open ? (
        <div className="bg-ig-elevated border-ig-border absolute inset-x-0 top-12 z-20 max-h-[420px] overflow-y-auto rounded-lg border shadow-lg">
          <SearchResults
            term={term}
            debouncedTerm={debounced}
            onPickTerm={setTerm}
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

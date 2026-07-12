"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { useUsers } from "@/hooks/useUserSearch";
import { Link } from "@/i18n/navigation";
import { ROUTES, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";

/**
 * Slide-out panel anchored to the collapsed sidebar (no screenshot exists for
 * it — INDEX.md §4 — so the layout follows IG's live search panel).
 * Search history endpoints are wired in Phase 8.
 */
export function SearchPanel() {
  const t = useTranslations("search");
  const { panel, closePanel } = useUiStore();
  const open = panel === "search";

  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [term]);

  const { data: users, isFetching } = useUsers(
    { userName: debounced, pageNumber: 1, pageSize: 15 },
    debounced.length > 0,
  );

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
        <h2 className="text-ig-text mb-8 text-2xl font-semibold">{t("placeholder")}</h2>
        <div className="relative">
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("placeholder")}
            className="bg-ig-elevated text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
          />
          {term ? (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label={t("clearAll")}
              className="text-ig-text-secondary absolute inset-y-0 right-3 flex items-center"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <Separator className="bg-ig-separator" />

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {debounced.length === 0 ? (
          <p className="text-ig-text-secondary px-4 py-3 text-sm font-semibold">{t("recent")}</p>
        ) : isFetching ? (
          <Loader />
        ) : users && users.length > 0 ? (
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  href={ROUTES.profile(user.id)}
                  onClick={closePanel}
                  className="hover:bg-ig-elevated flex items-center gap-3 rounded-lg px-4 py-2"
                >
                  <UserAvatar src={user.avatar} size={44} />
                  <span className="min-w-0">
                    <span className="text-ig-text block truncate text-sm font-semibold">
                      {user.userName}
                    </span>
                    <span className="text-ig-text-secondary block truncate text-sm">
                      {user.fullName}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ig-text-secondary px-4 py-6 text-center text-sm">{t("noResults")}</p>
        )}
      </div>
    </aside>
  );
}

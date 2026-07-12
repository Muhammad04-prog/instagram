"use client";

import { useTranslations } from "next-intl";
import { HeartIcon } from "@/components/icons";
import { EmptyState } from "@/components/shared/EmptyState";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";

/**
 * Slide-out notifications panel (docs/screenshots/img26–img28).
 *
 * The backend exposes no notifications endpoint (all 57 in Swagger accounted
 * for), so the list has no data source and the panel shows its empty state.
 */
export function NotificationsPanel() {
  const t = useTranslations("notifications");
  const panel = useUiStore((s) => s.panel);
  const open = panel === "notifications";

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        "border-ig-border bg-ig-bg left-sidebar-collapsed fixed inset-y-0 z-30 hidden w-[397px] flex-col rounded-r-2xl border-r transition-transform duration-200 md:flex",
        open ? "translate-x-0" : "pointer-events-none -translate-x-full",
      )}
    >
      <h2 className="text-ig-text px-6 pt-6 pb-6 text-2xl font-semibold">{t("title")}</h2>
      <Separator className="bg-ig-separator" />

      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={<HeartIcon className="text-ig-text size-10" />}
          title={t("empty")}
          description={t("emptyDescription")}
        />
      </div>
    </aside>
  );
}

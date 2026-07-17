"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { GridIcon } from "@/components/icons";
import { PostGridSkeleton } from "@/components/profile/PostGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { useLocation } from "@/hooks/useLocation";

/**
 * One place.
 *
 * ⚠️ Deliberately has **no post grid**: there is no "posts by location"
 * endpoint. A post carries its `location`, but nothing lets us ask the reverse,
 * and `/search?q=` only answers locations, not their posts. So the page shows
 * the place honestly and says the feed is missing rather than faking a grid.
 * Asked for in `docs/BACKEND_REQUEST.md`.
 */
export function LocationScreen({ locationId }: { locationId: number }) {
  const t = useTranslations("explore");
  const { data, isPending, isError, refetch } = useLocation(locationId);

  if (isPending) return <PostGridSkeleton />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="mx-auto max-w-[975px] px-4 py-6">
      <header className="mb-8 flex items-center gap-6">
        <span className="bg-ig-button-secondary flex size-[100px] shrink-0 items-center justify-center rounded-full">
          <MapPin className="text-ig-text size-10" />
        </span>
        <div className="min-w-0">
          <h1 className="text-ig-text text-xl font-semibold">{data.city}</h1>
          <p className="text-ig-text-secondary text-sm">
            {[data.state, data.country].filter(Boolean).join(", ")}
          </p>
        </div>
      </header>

      <EmptyState
        icon={<GridIcon className="size-8" />}
        title={t("locationNoFeed")}
        description={t("locationNoFeedDescription")}
      />
    </div>
  );
}

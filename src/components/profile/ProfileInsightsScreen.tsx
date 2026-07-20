"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useMyInsights } from "@/hooks/useProfile";
import { cn, formatCount } from "@/lib/utils";

const PERIODS = ["7d", "30d", "90d"] as const;
type Period = (typeof PERIODS)[number];

/** Account analytics — `GET /profile/me/insights?period=`, mine only. */
export function ProfileInsightsScreen() {
  const t = useTranslations("profile");
  const [period, setPeriod] = useState<Period>("7d");
  const { data, isPending, isError, refetch } = useMyInsights(period);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPeriod(value)}
            aria-pressed={period === value}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold",
              period === value ? "bg-ig-text text-ig-bg" : "bg-ig-button-secondary text-ig-text",
            )}
          >
            {t(`insightsPeriod${value}`)}
          </button>
        ))}
      </div>

      {isPending ? (
        <Loader className="py-10" />
      ) : isError || !data ? (
        <ErrorState onRetry={() => void refetch()} className="py-10" />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Stat label={t("insightsFollowersGained")} value={formatCount(data.followersGained)} />
          <Stat label={t("insightsProfileViews")} value={formatCount(data.profileViews)} />
          <Stat label={t("insightsPostsPublished")} value={formatCount(data.postsPublished)} />
          <Stat label={t("insightsAccountsReached")} value={formatCount(data.accountsReached)} />
          <Stat label={t("insightsAccountsEngaged")} value={formatCount(data.accountsEngaged)} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-ig-border rounded-2xl border p-4">
      <p className="text-ig-text text-2xl font-semibold">{value}</p>
      <p className="text-ig-text-secondary text-sm">{label}</p>
    </div>
  );
}

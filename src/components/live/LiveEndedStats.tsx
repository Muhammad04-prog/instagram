"use client";

import { useTranslations } from "next-intl";
import { Loader } from "@/components/shared/Loader";
import { useLiveStats } from "@/hooks/useLive";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

/** The card the host lands on after ending — what the broadcast actually did. */
export function LiveEndedStats({ liveId }: { liveId: string }) {
  const t = useTranslations("live");
  const router = useRouter();
  const { data, isPending } = useLiveStats(liveId);

  if (isPending) return <Loader className="py-10" />;
  if (!data) return null;

  const rows = [
    { label: t("statPeak"), value: String(data.peakViewers) },
    { label: t("statTotal"), value: String(data.totalViewers) },
    { label: t("statLikes"), value: String(data.likesCount) },
    { label: t("statComments"), value: String(data.commentsCount) },
    { label: t("statReactions"), value: String(data.reactionsCount) },
    { label: t("statDuration"), value: formatDuration(data.durationSec) },
  ];

  return (
    <div className="mx-auto w-full max-w-[400px] space-y-6 p-6 text-center">
      <h2 className="text-lg font-bold text-white">{t("endedTitle")}</h2>

      <dl className="divide-y divide-white/10 text-left">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3">
            <dt className="text-sm text-white/70">{row.label}</dt>
            <dd className="text-sm font-semibold text-white">{row.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={() => router.push(ROUTES.home)}
        className="bg-ig-primary hover:bg-ig-primary-hover w-full rounded-lg py-2.5 text-sm font-semibold text-white"
      >
        {t("done")}
      </button>
    </div>
  );
}

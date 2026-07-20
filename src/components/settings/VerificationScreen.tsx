"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { useVerificationAction, useVerificationStatus } from "@/hooks/useVerification";

/**
 * Meta Verified.
 *
 * A 7-day trial (once per account) or a $1000/mo subscription. The payment is a
 * **mock** on the backend — nothing is really charged — and the screen says so
 * rather than staging a checkout that would imply otherwise.
 *
 * Cancelling keeps the tick until the paid period ends, so `status: CANCELED`
 * and `isVerified: true` coexist on purpose; the copy explains that window
 * instead of showing two facts that look like a bug.
 */
export function VerificationScreen() {
  const t = useTranslations("verification");
  const format = useFormatter();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmSubscribe, setConfirmSubscribe] = useState(false);

  const { data, isPending, isError, refetch } = useVerificationStatus();
  const act = useVerificationAction();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  const { status, isVerified, trialUsed, daysLeft } = data;
  const canTrial = !trialUsed && !isVerified;
  const active = status === "TRIAL" || status === "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="border-ig-border rounded-2xl border p-6 text-center">
        <VerifiedBadge className="mx-auto size-12" />
        <h2 className="text-ig-text mt-4 text-lg font-bold">{t("title")}</h2>
        <p className="text-ig-text-secondary mt-1 text-sm">{t("subtitle")}</p>

        <p className="text-ig-text mt-4 text-sm font-semibold">
          {isVerified ? t(`status_${status ?? "ACTIVE"}`) : t("statusNone")}
        </p>

        {/* Only meaningful while something is running out. */}
        {typeof daysLeft === "number" && active ? (
          <p className="text-ig-text-secondary text-sm">{t("daysLeft", { count: daysLeft })}</p>
        ) : null}

        {status === "CANCELED" && isVerified && data.currentPeriodEnd ? (
          <p className="text-ig-text-secondary mt-2 text-sm">
            {t("canceledUntil", {
              date: format.dateTime(new Date(data.currentPeriodEnd), { dateStyle: "long" }),
            })}
          </p>
        ) : null}
      </div>

      <ul className="space-y-3">
        {["badge", "support", "protection"].map((benefit) => (
          <li key={benefit} className="flex items-start gap-3">
            <VerifiedBadge className="mt-0.5 size-4 shrink-0" />
            <span className="text-ig-text-secondary text-sm">{t(`benefit_${benefit}`)}</span>
          </li>
        ))}
      </ul>

      <p className="text-ig-text-secondary text-xs">{t("mockNotice")}</p>

      <div className="space-y-2">
        {canTrial ? (
          <button
            type="button"
            onClick={() =>
              act.mutate("trial", { onSuccess: () => toast.success(t("trialStarted")) })
            }
            disabled={act.isPending}
            className="bg-ig-primary hover:bg-ig-primary-hover w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t("startTrial")}
          </button>
        ) : null}

        {status !== "ACTIVE" ? (
          <button
            type="button"
            onClick={() => setConfirmSubscribe(true)}
            disabled={act.isPending}
            className={
              canTrial
                ? "bg-ig-button-secondary text-ig-text hover:bg-ig-button-secondary-hover w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
                : "bg-ig-primary hover:bg-ig-primary-hover w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            }
          >
            {t("subscribe")}
          </button>
        ) : null}

        {active ? (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            disabled={act.isPending}
            className="text-ig-danger w-full py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {t("cancel")}
          </button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t("cancel")}
        // The tick does not vanish on cancel — say so, or this reads as instant loss.
        description={t("cancelConfirm")}
        confirmLabel={t("cancel")}
        onConfirm={() => act.mutate("cancel", { onSuccess: () => toast.success(t("canceled")) })}
      />

      <ConfirmDialog
        open={confirmSubscribe}
        onOpenChange={setConfirmSubscribe}
        title={t("subscribe")}
        description={t("subscribeConfirm")}
        confirmLabel={t("subscribe")}
        destructive={false}
        onConfirm={() =>
          act.mutate("subscribe", { onSuccess: () => toast.success(t("subscribed")) })
        }
      />
    </div>
  );
}

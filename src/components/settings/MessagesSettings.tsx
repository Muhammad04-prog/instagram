"use client";

import { useTranslations } from "next-intl";
import { SettingsRadioGroup } from "@/components/settings/SettingsRadioGroup";
import {
  SettingsRow,
  SettingsRowGroup,
  SettingsUnavailableNotice,
} from "@/components/settings/SettingsRow";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import type { SettingsDto } from "@/types/api.types";

/**
 * Settings → Messages and story replies. `whoCanMessage` wires "Message
 * settings" up for real; "Story replies" and "Active now" have no matching
 * field on `SettingsDto`, so those two rows stay exactly as inert as before.
 */
export function MessagesSettings() {
  const t = useTranslations("settings");
  const { data: settings, isPending, isError, refetch } = useSettings();
  const update = useUpdateSettings();

  if (isPending) return <Loader className="py-10" />;
  if (isError || !settings) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <div className="max-w-[640px] space-y-8">
      <h2 className="text-ig-text text-lg font-bold">{t("messagesSettings")}</h2>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("howPeopleContact")}</h3>
        <p className="text-ig-text-secondary text-sm">{t("messageWhoCan")}</p>
        <SettingsRadioGroup
          name="message-policy"
          value={settings.whoCanMessage}
          disabled={update.isPending}
          onChange={(value) =>
            update.mutate({ whoCanMessage: value as SettingsDto["whoCanMessage"] })
          }
          options={[
            { value: "EVERYONE", label: t("messageAny") },
            { value: "FOLLOWING", label: t("messageFollowing") },
            { value: "NOBODY", label: t("messageNone") },
          ]}
        />
        <SettingsRowGroup className="pt-2">
          <SettingsRow title={t("storyRepliesRow")} />
        </SettingsRowGroup>
      </section>

      <section className="space-y-3">
        <h3 className="text-ig-text text-base font-semibold">{t("whoSeesOnline")}</h3>
        <SettingsUnavailableNotice>{t("acComingSoon")}</SettingsUnavailableNotice>
        <SettingsRowGroup>
          <SettingsRow title={t("onlineStatusRow")} />
        </SettingsRowGroup>
      </section>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { LiveCoverPicker } from "@/components/live/LiveCoverPicker";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useStartLive } from "@/hooks/useLive";
import { useMyProfile } from "@/hooks/useProfile";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { UploadedMediaDto } from "@/types/api.types";

/**
 * The pre-flight screen: name the broadcast, then open the room.
 *
 * IG shows a camera preview here. We do not, because the picture never reaches
 * the room anyway (see `LiveStage`) and a preview would promise a stream that
 * the next screen cannot deliver.
 */
export function GoLiveScreen() {
  const t = useTranslations("live");
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const start = useStartLive();
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState<UploadedMediaDto | null>(null);

  return (
    <div className="mx-auto w-full max-w-[400px] space-y-6 py-10 text-center">
      <UserAvatar src={profile?.avatarUrl} size={88} className="mx-auto" />
      <div>
        <h2 className="text-ig-text text-lg font-bold">{t("goLiveTitle")}</h2>
        <p className="text-ig-text-secondary mt-1 text-sm">
          {t("goLiveSubtitle", { userName: user?.userName ?? "" })}
        </p>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={t("titlePlaceholder")}
        aria-label={t("titlePlaceholder")}
        maxLength={80}
        className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-11 w-full rounded-lg px-4 text-sm outline-none"
      />

      <LiveCoverPicker cover={cover} onChange={setCover} />

      <p className="text-ig-text-secondary text-xs">{t("goLiveNotice")}</p>

      <button
        type="button"
        onClick={() =>
          start.mutate(
            // Both fields are optional — send neither rather than "".
            {
              ...(title.trim() ? { title: title.trim() } : {}),
              ...(cover ? { coverUrl: cover.url } : {}),
            },
            { onSuccess: ({ live }) => router.replace(ROUTES.live(live.id)) },
          )
        }
        disabled={start.isPending}
        className="bg-ig-primary hover:bg-ig-primary-hover w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {start.isPending ? t("starting") : t("goLive")}
      </button>
    </div>
  );
}

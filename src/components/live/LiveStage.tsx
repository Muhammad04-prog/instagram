"use client";

import { VideoOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { getImageUrl } from "@/lib/utils";
import type { LiveDto } from "@/types/api.types";

/**
 * Where the picture goes.
 *
 * There is no picture. Video for this API is carried by LiveKit, and the token
 * we are handed points at `ws://localhost:7880` — the *viewer's own machine* —
 * so nothing can be played from here, with or without the LiveKit SDK. Rather
 * than dress a dead room up with a fake stream, the stage says plainly that
 * video is not connected and gets on with the parts that do work.
 *
 * When the backend supplies a real `wsUrl`, only this component changes: the
 * whole screen around it already runs on the REST state.
 */
export function LiveStage({
  live,
  tokenReady,
  isHost,
}: {
  live: LiveDto;
  tokenReady: boolean;
  isHost: boolean;
}) {
  const t = useTranslations("live");
  const cover = getImageUrl(live.coverUrl);

  // The host turning the camera off is a normal, expected state with its own
  // look — the cover or their avatar — and it must not read like a failure.
  const cameraOff = !live.isCameraOn;

  return (
    <div className="bg-ig-elevated relative flex flex-1 items-center justify-center overflow-hidden">
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover opacity-40 blur-sm"
        />
      ) : null}

      <div className="relative z-10 flex flex-col items-center gap-3 px-8 text-center">
        {cameraOff ? (
          <>
            <UserAvatar src={live.host.avatarUrl} size={88} />
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <VideoOff className="size-4" />
              {/* The host is being told about their own camera — naming them in
                  the third person reads as someone else's stream. */}
              {isHost ? t("cameraOffMine") : t("cameraOffBy", { userName: live.host.userName })}
            </p>
            <p className="text-xs text-white/70">{t("cameraOffAudioNote")}</p>
          </>
        ) : (
          <>
            <UserAvatar src={live.host.avatarUrl} size={88} />
            <p className="text-sm font-semibold text-white">
              {tokenReady ? t("videoUnavailable") : t("connecting")}
            </p>
            {tokenReady ? (
              <p className="text-xs text-white/70">{t("videoUnavailableWhy")}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

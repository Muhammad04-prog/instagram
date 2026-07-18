"use client";

import type { LocalTrack, RemoteTrack } from "livekit-client";
import { VideoOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { LiveKitVideo } from "@/components/live/LiveKitVideo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { getImageUrl } from "@/lib/utils";
import type { LiveDto } from "@/types/api.types";

/**
 * Where the picture goes.
 *
 * Video is carried by LiveKit, not by this API's own endpoints — `videoTrack`
 * is whatever `useLiveKitRoom` has resolved (the host's own camera when
 * publishing, or the host's remote camera for a viewer). Until the room
 * connects and a track exists, the stage falls back to the host's avatar
 * instead of a blank rectangle.
 */
export function LiveStage({
  live,
  tokenReady,
  isHost,
  videoTrack,
  connecting,
}: {
  live: LiveDto;
  tokenReady: boolean;
  isHost: boolean;
  videoTrack: LocalTrack | RemoteTrack | null;
  connecting: boolean;
}) {
  const t = useTranslations("live");
  const cover = getImageUrl(live.coverUrl);

  // The host turning the camera off is a normal, expected state with its own
  // look — the cover or their avatar — and it must not read like a failure.
  const cameraOff = !live.isCameraOn;

  if (videoTrack && !cameraOff) {
    return (
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
        {/* The host must never hear themself — remote viewers do. */}
        <LiveKitVideo track={videoTrack} muted={isHost} />
      </div>
    );
  }

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
            <p className="text-sm font-semibold text-white">{t("connecting")}</p>
            {tokenReady && !connecting ? (
              <p className="text-xs text-white/70">{t("videoUnavailableWhy")}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

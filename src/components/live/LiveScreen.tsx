"use client";

import { Mic, MicOff, Users, Video, VideoOff, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LiveCommentBar } from "@/components/live/LiveCommentBar";
import { LiveEndedStats } from "@/components/live/LiveEndedStats";
import { type FloatingHeart, LiveHearts } from "@/components/live/LiveHearts";
import { LiveStage } from "@/components/live/LiveStage";
import { LiveViewersSheet } from "@/components/live/LiveViewersSheet";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { useAuth } from "@/hooks/useAuth";
import {
  useEndLive,
  useJoinLive,
  useLeaveLive,
  useLikeLive,
  useLive,
  useLiveComment,
  useLiveReaction,
  useRequestJoinLive,
  useSetLiveAudio,
  useSetLiveCamera,
} from "@/hooks/useLive";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { LiveCommentDto } from "@/types/api.types";

/**
 * One broadcast, for both sides of it.
 *
 * Host and viewer share a screen because they share almost everything — the
 * same header, the same comments, the same hearts. Only the controls differ, so
 * splitting them into two screens would have duplicated the hard parts twice.
 *
 * The video itself is not here; see `LiveStage`.
 */
export function LiveScreen({ liveId }: { liveId: string }) {
  const t = useTranslations("live");
  const router = useRouter();
  const { user } = useAuth();

  const { data: live, isPending, isError, refetch } = useLive(liveId);
  const join = useJoinLive(liveId);
  const leave = useLeaveLive(liveId);
  const end = useEndLive(liveId);
  const like = useLikeLive(liveId);
  const reaction = useLiveReaction(liveId);
  const comment = useLiveComment(liveId);
  const requestJoin = useRequestJoinLive(liveId);
  const setCamera = useSetLiveCamera(liveId);
  const setAudio = useSetLiveAudio(liveId);

  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [mine, setMine] = useState<LiveCommentDto[]>([]);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  // Nothing tells us the host's answer — there is no request-status endpoint and
  // no socket — so the button can only report that the ask went out.
  const [requested, setRequested] = useState(false);
  const heartId = useRef(0);

  const isHost = Boolean(user && live && live.host.id === user.id);
  const ended = live?.status === "ENDED";

  // A viewer must be registered in the room to count, and must be dropped when
  // they walk away — including on a hard close, hence pagehide as well.
  //
  // Every dep here is a primitive on purpose. Depending on `live` itself put
  // this in an infinite loop: join writes the fresh broadcast into the cache,
  // that hands back a new object, the effect re-ran, left, and joined again.
  const joinMutate = join.mutate;
  const leaveMutate = leave.mutate;
  const hostId = live?.host.id;
  const myId = user?.id;
  useEffect(() => {
    if (!hostId || !myId || hostId === myId || ended) return;
    joinMutate();
    const bye = () => leaveMutate();
    window.addEventListener("pagehide", bye);
    return () => {
      window.removeEventListener("pagehide", bye);
      bye();
    };
  }, [hostId, myId, ended, liveId, joinMutate, leaveMutate]);

  const float = (emoji: string) => {
    const id = heartId.current++;
    setHearts((old) => [...old, { id, emoji, offset: Math.random() * 24 - 12 }]);
    window.setTimeout(() => setHearts((old) => old.filter((h) => h.id !== id)), 2500);
  };

  if (isPending) return <Loader className="py-20" />;
  if (isError || !live) return <ErrorState onRetry={() => void refetch()} className="py-20" />;

  if (ended) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-black">
        {isHost ? (
          <LiveEndedStats liveId={liveId} />
        ) : (
          <div className="space-y-4 text-center">
            <EmptyState title={t("hasEnded", { userName: live.host.userName })} />
            <button
              type="button"
              onClick={() => router.push(ROUTES.home)}
              className="text-ig-primary text-sm font-semibold"
            >
              {t("backHome")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <header className="flex items-center gap-3 p-3">
        <Link href={ROUTES.profile(live.host.id)} className="flex min-w-0 items-center gap-2">
          <UserAvatar src={live.host.avatarUrl} size={32} />
          <span className="min-w-0">
            <span className="flex items-center gap-1 text-sm font-semibold text-white">
              <span className="truncate">{live.host.userName}</span>
              {live.host.isVerified ? <VerifiedBadge /> : null}
            </span>
            {live.title ? (
              <span className="block truncate text-xs text-white/70">{live.title}</span>
            ) : null}
          </span>
        </Link>

        <span className="rounded-md bg-[color:var(--ig-danger)] px-1.5 py-0.5 text-[11px] font-bold text-white">
          {t("badge")}
        </span>

        <button
          type="button"
          onClick={() => setViewersOpen(true)}
          className="ml-auto flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-xs font-semibold text-white"
        >
          <Users className="size-3.5" />
          {live.viewersCount}
        </button>

        <button
          type="button"
          onClick={() => (isHost ? setConfirmEnd(true) : router.back())}
          aria-label={isHost ? t("end") : t("close")}
          className="text-white"
        >
          <X className="size-6" />
        </button>
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <LiveStage live={live} tokenReady={isHost || join.isSuccess} isHost={isHost} />
        <LiveHearts hearts={hearts} />
      </div>

      <div className="bg-gradient-to-t from-black to-transparent">
        {/* The one thing a viewer cannot see is everyone else's chat. Say it
            once, quietly, instead of showing an empty room as if it were real. */}
        <p className="px-3 pt-2 text-[11px] text-white/50">{t("commentsLocalOnly")}</p>

        <LiveCommentBar
          comments={mine}
          sending={comment.isPending}
          onSend={(text) =>
            comment.mutate(text, { onSuccess: (created) => setMine((old) => [...old, created]) })
          }
          onLike={() => {
            float("❤️");
            like.mutate();
          }}
          onReaction={(emoji) => {
            float(emoji);
            reaction.mutate(emoji);
          }}
        />

        <div className="flex items-center justify-center gap-3 pb-4">
          {isHost ? (
            <>
              <ControlButton
                on={live.isCameraOn}
                onClick={() => setCamera.mutate({ on: !live.isCameraOn })}
                labelOn={t("cameraOff")}
                labelOff={t("cameraOn")}
                IconOn={Video}
                IconOff={VideoOff}
              />
              <ControlButton
                on={live.isAudioOn}
                onClick={() => setAudio.mutate(!live.isAudioOn)}
                labelOn={t("audioOff")}
                labelOff={t("audioOn")}
                IconOn={Mic}
                IconOff={MicOff}
              />
            </>
          ) : (
            <button
              type="button"
              onClick={() => requestJoin.mutate(undefined, { onSuccess: () => setRequested(true) })}
              disabled={requestJoin.isPending || requested}
              className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {requested ? t("requestSent") : t("requestJoin")}
            </button>
          )}
        </div>
      </div>

      <LiveViewersSheet
        liveId={liveId}
        open={viewersOpen}
        onOpenChange={setViewersOpen}
        isHost={isHost}
      />

      <ConfirmDialog
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        title={t("endConfirmTitle")}
        description={t("endConfirmDescription")}
        confirmLabel={t("end")}
        onConfirm={() => end.mutate()}
      />
    </div>
  );
}

function ControlButton({
  on,
  onClick,
  labelOn,
  labelOff,
  IconOn,
  IconOff,
}: {
  on: boolean;
  onClick: () => void;
  labelOn: string;
  labelOff: string;
  IconOn: typeof Video;
  IconOff: typeof VideoOff;
}) {
  const Icon = on ? IconOn : IconOff;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={on ? labelOn : labelOff}
      aria-pressed={!on}
      className={
        on
          ? "flex size-11 items-center justify-center rounded-full bg-white/15 text-white"
          : "flex size-11 items-center justify-center rounded-full bg-white text-black"
      }
    >
      <Icon className="size-5" />
    </button>
  );
}

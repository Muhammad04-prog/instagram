"use client";

import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useLiveByUser } from "@/hooks/useLive";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * The profile avatar, which becomes a way in when that person is broadcasting.
 *
 * Nothing here is speculative: `/live/user/{id}` answers null when they are not
 * live, so the ring and the LIVE tag only ever appear over a room that exists.
 */
export function ProfileLiveAvatar({
  userId,
  src,
  userName,
}: {
  userId: string;
  src: string | null | undefined;
  userName: string;
}) {
  const t = useTranslations("live");
  const { data: live } = useLiveByUser(userId);

  const avatar = (
    <UserAvatar
      src={src}
      alt={userName}
      size={150}
      priority
      className="size-[77px] md:size-[150px]"
    />
  );

  if (!live || live.status !== "LIVE") return avatar;

  return (
    <Link href={ROUTES.live(live.id)} className="relative inline-flex">
      <span className="story-ring inline-flex rounded-full p-[3px]">
        <span className="bg-ig-bg rounded-full p-[3px]">{avatar}</span>
      </span>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md border-2 border-[color:var(--ig-bg)] bg-[color:var(--ig-danger)] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
        {t("badge")}
      </span>
    </Link>
  );
}

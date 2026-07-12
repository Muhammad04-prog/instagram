"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { CompassIcon, CreateIcon, HomeIcon, ReelsIcon } from "@/components/icons";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useMyProfile } from "@/hooks/useProfile";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Mobile bottom tabs — 48px (ТЗ §5). No screenshot exists for mobile
 * (INDEX.md §2), so this follows Instagram's live mobile web tab bar; Explore
 * lives here because the desktop sidebar has no compass entry.
 */
export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: profile } = useMyProfile();

  return (
    <nav
      aria-label={t("primary")}
      className="border-ig-border bg-ig-bg h-mobilenav fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t md:hidden"
    >
      <Tab href={ROUTES.home} label={t("home")} active={pathname === "/"}>
        {(active) => <HomeIcon filled={active} />}
      </Tab>
      <Tab href={ROUTES.explore} label={t("explore")} active={pathname.startsWith("/explore")}>
        {(active) => <CompassIcon filled={active} />}
      </Tab>
      <Tab href={ROUTES.reels} label={t("reels")} active={pathname.startsWith("/reels")}>
        {(active) => <ReelsIcon filled={active} />}
      </Tab>
      <Tab
        href={ROUTES.createPost}
        label={t("create")}
        active={pathname.startsWith("/post/create")}
      >
        {() => <CreateIcon />}
      </Tab>
      <Tab href={ROUTES.myProfile} label={t("profile")} active={pathname.startsWith("/profile")}>
        {(active) => (
          <UserAvatar
            src={profile?.image}
            size={24}
            className={cn(active && "ring-ig-text ring-2")}
          />
        )}
      </Tab>
    </nav>
  );
}

function Tab({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: (active: boolean) => ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="text-ig-text flex flex-1 items-center justify-center [&_svg]:size-6"
    >
      {children(active)}
    </Link>
  );
}

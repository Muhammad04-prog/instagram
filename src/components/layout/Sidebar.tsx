"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  AppsIcon,
  CreateIcon,
  HeartIcon,
  HomeIcon,
  MessageIcon,
  ReelsIcon,
  SearchIcon,
} from "@/components/icons";
import { InstagramGlyph, InstagramWordmark } from "@/components/icons/InstagramLogo";
import { MoreMenu } from "@/components/layout/MoreMenu";
import { useMyProfile } from "@/hooks/useProfile";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn, getImageUrl } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";

/**
 * Desktop sidebar — 244px expanded, 73px collapsed (docs/screenshots/img10).
 * Icon order and the filled-when-active style come straight from the screenshot;
 * note there is no Explore/compass entry here — IG moved it under Search.
 * Collapses automatically on /chat and /explore, and whenever a panel is open.
 */
export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { panel, togglePanel, closePanel } = useUiStore();
  const { data: profile } = useMyProfile();

  const autoCollapsed = pathname.startsWith("/chat") || pathname.startsWith("/explore");
  const collapsed = autoCollapsed || panel !== null;

  const avatar = getImageUrl(profile?.image);

  return (
    <nav
      className={cn(
        "border-ig-border bg-ig-bg fixed inset-y-0 left-0 z-40 hidden flex-col border-r px-3 py-5 transition-[width] duration-200 md:flex",
        collapsed ? "w-sidebar-collapsed items-center" : "w-sidebar",
      )}
      aria-label={t("primary")}
    >
      <Link
        href={ROUTES.home}
        className={cn("mb-6 flex h-10 items-center", collapsed ? "justify-center" : "px-3")}
        onClick={closePanel}
      >
        {collapsed ? <InstagramGlyph className="text-ig-text size-6" /> : <InstagramWordmark />}
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Item
          href={ROUTES.home}
          label={t("home")}
          collapsed={collapsed}
          active={pathname === "/" && !panel}
          icon={(active) => <HomeIcon filled={active} />}
          onNavigate={closePanel}
        />
        <Item
          href={ROUTES.reels}
          label={t("reels")}
          collapsed={collapsed}
          active={pathname.startsWith("/reels") && !panel}
          icon={(active) => <ReelsIcon filled={active} />}
          onNavigate={closePanel}
        />
        <Item
          href={ROUTES.chat}
          label={t("messages")}
          collapsed={collapsed}
          active={pathname.startsWith("/chat") && !panel}
          icon={(active) => <MessageIcon filled={active} />}
          onNavigate={closePanel}
        />

        <Button
          label={t("search")}
          collapsed={collapsed}
          active={panel === "search"}
          onClick={() => togglePanel("search")}
          icon={<SearchIcon />}
        />
        <Button
          label={t("notifications")}
          collapsed={collapsed}
          active={panel === "notifications"}
          onClick={() => togglePanel("notifications")}
          icon={
            <span className="relative">
              <HeartIcon filled={panel === "notifications"} />
              <span className="bg-ig-badge absolute -top-0.5 -right-0.5 size-2 rounded-full" />
            </span>
          }
        />

        <Item
          href={ROUTES.createPost}
          label={t("create")}
          collapsed={collapsed}
          active={pathname.startsWith("/post/create")}
          icon={() => <CreateIcon />}
          onNavigate={closePanel}
        />

        <Item
          href={ROUTES.myProfile}
          label={t("profile")}
          collapsed={collapsed}
          active={pathname.startsWith("/profile")}
          onNavigate={closePanel}
          icon={(active) =>
            avatar ? (
              <Image
                src={avatar}
                alt=""
                width={24}
                height={24}
                className={cn(
                  "size-6 rounded-full object-cover",
                  active && "ring-ig-text ring-2 ring-offset-1",
                )}
              />
            ) : (
              <span className="bg-ig-elevated size-6 rounded-full" />
            )
          }
        />
      </div>

      <div className="flex flex-col gap-1">
        <MoreMenu collapsed={collapsed} />
        <Button
          label={t("otherProducts")}
          collapsed={collapsed}
          icon={<AppsIcon />}
          onClick={() => undefined}
        />
      </div>
    </nav>
  );
}

const rowStyles =
  "flex w-full items-center gap-4 rounded-lg p-3 transition-colors hover:bg-ig-elevated text-ig-text";

function Item({
  href,
  label,
  icon,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(rowStyles, collapsed && "justify-center")}
    >
      <span className="[&_svg]:size-6 [&_svg]:shrink-0">{icon(active)}</span>
      {!collapsed && (
        <span className={cn("text-base", active ? "font-bold" : "font-normal")}>{label}</span>
      )}
    </Link>
  );
}

function Button({
  label,
  icon,
  active = false,
  collapsed,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        rowStyles,
        collapsed && "justify-center",
        // IG outlines the active panel trigger instead of filling it.
        active && "ring-ig-border ring-1",
      )}
    >
      <span className="[&_svg]:size-6 [&_svg]:shrink-0">{icon}</span>
      {!collapsed && (
        <span className={cn("text-base", active ? "font-bold" : "font-normal")}>{label}</span>
      )}
    </button>
  );
}

"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  AppsIcon,
  CompassIcon,
  CreateIcon,
  HeartIcon,
  HomeIcon,
  MessageIcon,
  ReelsIcon,
  SearchIcon,
} from "@/components/icons";
import { InstagramGlyph, InstagramWordmark } from "@/components/icons/InstagramLogo";
import { MoreMenu } from "@/components/layout/MoreMenu";
import { SidebarLabel } from "@/components/layout/SidebarLabel";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useMyProfile } from "@/hooks/useProfile";
import { useSidebarForcedCollapsed } from "@/hooks/useSidebarState";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui.store";

/**
 * Desktop sidebar — 73px collapsed, 244px expanded.
 *
 * Metrics measured off docs/screenshots/img10 (captured at DPR 1.25): icon 24px,
 * row pitch 56px, logo centre 112px above the first row. With `px-3` on the nav
 * and `p-3` on each row the icon centre lands at 36px — dead centre of the 73px
 * rail — so nothing needs re-centering between the two widths.
 *
 * When collapsed it expands on hover (CSS `group-hover`, 200ms) and floats over
 * the page: the content keeps its 73px gutter, so nothing shifts. Hover is a
 * no-op on mobile because the whole nav is `hidden` below md.
 */
export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { panel, togglePanel, closePanel } = useUiStore();
  const { data: profile } = useMyProfile();

  const forcedCollapsed = useSidebarForcedCollapsed();
  // Only when not forced narrow may the rail stay open at ≥1264px.
  const wide = !forcedCollapsed;

  return (
    <nav
      aria-label={t("primary")}
      className={cn(
        "group border-ig-border bg-ig-bg fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r px-3 pt-8 pb-4 md:flex",
        "w-sidebar-collapsed hover:w-sidebar transition-[width] duration-200 ease-in-out",
        wide && "xl:w-sidebar",
      )}
    >
      <Link
        href={ROUTES.home}
        onClick={closePanel}
        className="mb-[67px] flex h-[42px] shrink-0 items-center px-3"
      >
        <InstagramGlyph
          className={cn("text-ig-text size-6 group-hover:hidden", wide && "xl:hidden")}
        />
        <span className={cn("hidden group-hover:block", wide && "xl:block")}>
          <InstagramWordmark />
        </span>
      </Link>

      {/* gap-2 + 48px rows = the 56px pitch measured in img10 */}
      <div className="flex flex-1 flex-col gap-2">
        <Item
          href={ROUTES.home}
          label={t("home")}
          wide={wide}
          active={pathname === "/" && !panel}
          icon={(active) => <HomeIcon filled={active} />}
          onNavigate={closePanel}
        />
        <PanelButton
          label={t("search")}
          wide={wide}
          active={panel === "search"}
          onClick={() => togglePanel("search")}
          icon={<SearchIcon />}
        />
        <Item
          href={ROUTES.explore}
          label={t("explore")}
          wide={wide}
          active={pathname.startsWith("/explore") && !panel}
          icon={(active) => <CompassIcon filled={active} />}
          onNavigate={closePanel}
        />
        <Item
          href={ROUTES.reels}
          label={t("reels")}
          wide={wide}
          active={pathname.startsWith("/reels") && !panel}
          icon={(active) => <ReelsIcon filled={active} />}
          onNavigate={closePanel}
        />
        <Item
          href={ROUTES.chat}
          label={t("messages")}
          wide={wide}
          active={pathname.startsWith("/chat") && !panel}
          icon={(active) => <MessageIcon filled={active} />}
          onNavigate={closePanel}
        />
        <PanelButton
          label={t("notifications")}
          wide={wide}
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
          wide={wide}
          active={pathname.startsWith("/post/create")}
          icon={() => <CreateIcon />}
          onNavigate={closePanel}
        />
        <Item
          href={ROUTES.myProfile}
          label={t("profile")}
          wide={wide}
          active={pathname.startsWith("/profile")}
          onNavigate={closePanel}
          icon={(active) => (
            <UserAvatar
              src={profile?.image}
              size={24}
              priority
              className={cn(active && "ring-ig-text ring-2 ring-offset-1")}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <MoreMenu wide={wide} />
        <PanelButton
          label={t("otherProducts")}
          wide={wide}
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
  wide,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: (active: boolean) => ReactNode;
  active: boolean;
  wide: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={rowStyles}
    >
      <span className="[&_svg]:size-6 [&_svg]:shrink-0">{icon(active)}</span>
      <SidebarLabel wide={wide} bold={active}>
        {label}
      </SidebarLabel>
    </Link>
  );
}

function PanelButton({
  label,
  icon,
  active = false,
  wide,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active?: boolean;
  wide: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // IG outlines the active panel trigger instead of filling it.
      className={cn(rowStyles, active && "ring-ig-border ring-1")}
    >
      <span className="[&_svg]:size-6 [&_svg]:shrink-0">{icon}</span>
      <SidebarLabel wide={wide} bold={active}>
        {label}
      </SidebarLabel>
    </button>
  );
}

"use client";

import { Activity, Bookmark, ChevronLeft, Moon, Settings, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { MoreIcon } from "@/components/icons";
import { SidebarLabel } from "@/components/layout/SidebarLabel";
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Sidebar "More" menu (docs/screenshots/img46): Settings / Your activity /
 * Saved / Switch appearance / Report a problem — then Switch accounts, Log out.
 * "Switch appearance" opens the theme sub-view in place, as IG does.
 */
export function MoreMenu({ wide }: { wide: boolean }) {
  const t = useTranslations("nav");
  const tSettings = useTranslations("settings");
  const { logout } = useAuth();
  const [showTheme, setShowTheme] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => !open && setShowTheme(false)}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-ig-elevated text-ig-text flex w-full items-center gap-4 rounded-lg p-3 transition-colors"
        >
          <MoreIcon className="text-ig-text size-6 shrink-0" />
          {/* Regular weight — IG only bolds the active entry. */}
          <SidebarLabel wide={wide}>{t("more")}</SidebarLabel>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        sideOffset={12}
        className="bg-ig-elevated w-64 rounded-2xl border-none p-2 shadow-xl"
      >
        {showTheme ? (
          <>
            <button
              type="button"
              onClick={() => setShowTheme(false)}
              className="text-ig-text mb-1 flex w-full items-center gap-3 px-2 py-2 text-base font-bold"
            >
              <ChevronLeft className="size-5" />
              {tSettings("appearance")}
            </button>
            <ThemeSwitcher />
          </>
        ) : (
          <>
            <MenuLink href={ROUTES.settings} icon={<Settings className="size-5" />}>
              {tSettings("title")}
            </MenuLink>
            <MenuLink href={ROUTES.myProfile} icon={<Activity className="size-5" />}>
              {t("yourActivity")}
            </MenuLink>
            <MenuLink href={ROUTES.favorites} icon={<Bookmark className="size-5" />}>
              {t("saved")}
            </MenuLink>

            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setShowTheme(true);
              }}
              className="text-ig-text focus:bg-ig-bg-secondary gap-3 rounded-lg px-2 py-2.5 text-sm"
            >
              <Moon className="size-5" />
              {tSettings("appearance")}
            </DropdownMenuItem>

            <DropdownMenuItem className="text-ig-text focus:bg-ig-bg-secondary gap-3 rounded-lg px-2 py-2.5 text-sm">
              <TriangleAlert className="size-5" />
              {t("reportProblem")}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-ig-separator my-2 h-1.5" />

            <DropdownMenuItem
              onSelect={() => void logout()}
              className="text-ig-text focus:bg-ig-bg-secondary rounded-lg px-2 py-2.5 text-sm"
            >
              {t("logout")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <DropdownMenuItem
      asChild
      className="text-ig-text focus:bg-ig-bg-secondary gap-3 rounded-lg px-2 py-2.5 text-sm"
    >
      <Link href={href}>
        {icon}
        {children}
      </Link>
    </DropdownMenuItem>
  );
}

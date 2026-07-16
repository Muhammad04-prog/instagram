"use client";

import { Activity, Globe, KeyRound, Lock, MapPin, Trash2, UserPen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Left column of Settings (img39): small grey group headings, rows with an icon,
 * the active row filled. Only entries backed by a real endpoint are listed —
 * IG's "Account Centre", "Threads badge" and friends have no API here.
 */
const GROUPS = [
  {
    label: "groupAccount",
    items: [
      { href: ROUTES.editProfile, key: "editProfile", Icon: UserPen },
      { href: ROUTES.changePassword, key: "changePassword", Icon: KeyRound },
      { href: ROUTES.activity, key: "activity", Icon: Activity },
    ],
  },
  {
    label: "groupApp",
    items: [
      { href: ROUTES.settings, key: "appearanceAndLanguage", Icon: Globe },
      { href: ROUTES.locations, key: "locations", Icon: MapPin },
    ],
  },
  {
    label: "groupControl",
    items: [
      { href: ROUTES.privacy, key: "privacy", Icon: Lock },
      { href: ROUTES.deleteAccount, key: "deleteAccount", Icon: Trash2 },
    ],
  },
] as const;

export function SettingsNav() {
  const t = useTranslations("settings");
  const pathname = usePathname();

  return (
    <nav className="w-full shrink-0 md:w-[350px]">
      <h1 className="text-ig-text px-3 pb-6 text-2xl font-bold">{t("title")}</h1>

      {GROUPS.map((group) => (
        <div key={group.label} className="mb-6">
          <p className="text-ig-text-secondary px-3 pb-2 text-xs font-semibold">{t(group.label)}</p>
          <ul className="space-y-1">
            {group.items.map(({ href, key, Icon }) => {
              const active = pathname === href;
              return (
                <li key={key}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-ig-text flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                      active ? "bg-ig-button-secondary font-semibold" : "hover:bg-ig-bg-secondary",
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {t(key)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

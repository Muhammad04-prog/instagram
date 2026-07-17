"use client";

import {
  Accessibility,
  Activity,
  Archive,
  AtSign,
  BadgeCheck,
  Ban,
  Bell,
  Briefcase,
  CircleHelp,
  CircleUserRound,
  Globe,
  Heart,
  History,
  Infinity as InfinityIcon,
  KeyRound,
  Languages,
  Lock,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Palette,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trash2,
  UserMinus,
  UserPen,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { AccountsCenterDialog } from "@/components/settings/AccountsCenterDialog";
import { useAuth } from "@/hooks/useAuth";
import { Link, usePathname } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  key: string;
  Icon: LucideIcon;
}

/**
 * Left column of Settings. Grouping/order follows the real IG desktop
 * settings list img1 onward, not the old ad-hoc groups: "Ваш аккаунт" (Meta
 * account centre), "Как вы используете Instagram", "Кто может видеть ваш
 * контент", "Как с вами могут связаться", "Ограничения", "Что вы видите",
 * "Ваше приложение и медиафайлы", "Инструменты аккаунта" — then our own
 * "Управление аккаунтом" group for the real endpoints IG tucks inside its
 * Accounts Centre (password, activity, Meta Verified, …) that we expose here
 * directly, plus "Помощь".
 *
 * Icon pass (cosmetic-only, not redrawn this round): `lucide-react`'s
 * `UserPen` (real IG uses a plain person outline for Edit profile), `Ban`
 * (IG's blocked icon is a circle-slash, this one reads as a stop sign),
 * `SlidersHorizontal` (hidden words is a speech-bubble-with-slash on IG, not
 * sliders) and `Accessibility` (IG's accessibility glyph is a figure inside a
 * circle, lucide's is a running figure) diverge the most from IG's own set —
 * worth a redraw pass later, not now.
 */
const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "groupMeta",
    items: [{ href: ROUTES.accountsCenter, key: "accountsCenter", Icon: CircleUserRound }],
  },
  {
    label: "groupUsage",
    items: [
      { href: ROUTES.editProfile, key: "editProfile", Icon: UserPen },
      { href: ROUTES.notifications, key: "notifications", Icon: Bell },
    ],
  },
  {
    label: "groupVisibility",
    items: [
      { href: ROUTES.privacy, key: "privacy", Icon: Lock },
      { href: ROUTES.closeFriends, key: "closeFriends", Icon: Star },
      { href: ROUTES.blocked, key: "blocked", Icon: Ban },
      { href: ROUTES.storyVisibility, key: "storyVisibility", Icon: History },
    ],
  },
  {
    label: "groupContact",
    items: [
      { href: ROUTES.messagesSettings, key: "messagesSettings", Icon: MessageCircle },
      { href: ROUTES.tags, key: "tags", Icon: AtSign },
      { href: ROUTES.comments, key: "comments", Icon: MessagesSquare },
      { href: ROUTES.sharing, key: "sharing", Icon: Share2 },
    ],
  },
  {
    label: "groupRestrictions",
    items: [
      { href: ROUTES.restrictedAccounts, key: "restrictedAccounts", Icon: UserX },
      { href: ROUTES.hiddenWords, key: "hiddenWords", Icon: SlidersHorizontal },
    ],
  },
  {
    label: "groupWhatYouSee",
    items: [
      { href: ROUTES.hiddenAccounts, key: "hiddenAccounts", Icon: UserMinus },
      { href: ROUTES.contentPreferences, key: "contentPreferences", Icon: Globe },
      { href: ROUTES.likeShareCounts, key: "likeShareCounts", Icon: Heart },
    ],
  },
  {
    label: "groupApp",
    items: [
      { href: ROUTES.archiving, key: "archiving", Icon: Archive },
      { href: ROUTES.accessibility, key: "accessibility", Icon: Accessibility },
      { href: ROUTES.language, key: "language", Icon: Languages },
      { href: ROUTES.sitePermissions, key: "sitePermissions", Icon: Globe },
    ],
  },
  {
    label: "groupTools",
    items: [
      { href: ROUTES.accountType, key: "accountType", Icon: Briefcase },
      { href: ROUTES.accountStatus, key: "accountStatus", Icon: ShieldCheck },
    ],
  },
  {
    label: "groupControl",
    items: [
      { href: ROUTES.settings, key: "appearanceNav", Icon: Palette },
      { href: ROUTES.changePassword, key: "changePassword", Icon: KeyRound },
      { href: ROUTES.activity, key: "activity", Icon: Activity },
      { href: ROUTES.verified, key: "verified", Icon: BadgeCheck },
      { href: ROUTES.locations, key: "locations", Icon: MapPin },
      { href: ROUTES.deleteAccount, key: "deleteAccount", Icon: Trash2 },
    ],
  },
  {
    label: "groupHelp",
    items: [{ href: ROUTES.help, key: "help", Icon: CircleHelp }],
  },
];

export function SettingsNav() {
  const t = useTranslations("settings");
  const pathname = usePathname();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [accountsCenterOpen, setAccountsCenterOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const filtered = useMemo(() => {
    const groups = isAdmin
      ? [
          ...GROUPS,
          { label: "groupAdmin", items: [{ href: ROUTES.admin, key: "admin", Icon: Shield }] },
        ]
      : GROUPS;

    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => t(item.key).toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  }, [isAdmin, query, t]);

  return (
    <nav className="w-full shrink-0 md:w-[350px]">
      <h1 className="text-ig-text px-3 pb-6 text-2xl font-bold">{t("title")}</h1>

      <div className="relative mb-6 px-1">
        <Search className="text-ig-text-secondary pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="bg-ig-bg-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-xl pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-ig-text-secondary px-3 text-sm">{t("noResults")}</p>
      ) : (
        filtered.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-ig-text-secondary text-xs font-semibold">{t(group.label)}</p>
              {group.label === "groupMeta" ? (
                <span className="text-ig-text-secondary flex items-center gap-1 text-xs font-semibold">
                  <InfinityIcon className="size-3.5" aria-hidden />
                  Meta
                </span>
              ) : null}
            </div>
            <ul className="space-y-1">
              {group.items.map(({ href, key, Icon }) => {
                const active = pathname === href;
                const rowClassName = cn(
                  "text-ig-text flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                  active ? "bg-ig-button-secondary font-semibold" : "hover:bg-ig-bg-secondary",
                );

                // "Центр аккаунтов" opens a full-viewport modal (img), not a page.
                if (key === "accountsCenter") {
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => setAccountsCenterOpen(true)}
                        className={rowClassName}
                      >
                        <Icon className="size-5 shrink-0" />
                        {t(key)}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={key}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={rowClassName}
                    >
                      <Icon className="size-5 shrink-0" />
                      {t(key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}

      <AccountsCenterDialog open={accountsCenterOpen} onOpenChange={setAccountsCenterOpen} />
    </nav>
  );
}

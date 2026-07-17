"use client";

import {
  BadgeCheck,
  ChevronRight,
  CreditCard,
  Infinity as InfinityIcon,
  KeyRound,
  Megaphone,
  RefreshCcw,
  Shield,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useProfile";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Section =
  "profiles" | "password" | "crossApp" | "permissions" | "ads" | "pay" | "subscriptions" | "manage";

/**
 * Settings → "Центр аккаунтов" (∞ Meta). Real IG opens this as a full-viewport
 * modal, not a settings page — reproduced the same way here, triggered from
 * SettingsNav. Only "Профили и личная информация" and "Пароль и безопасность"
 * touch real data (our own profile/auth); the rest of Meta's cross-app
 * surface (Meta Pay, ad preferences, cross-app features, WhatsApp/Threads
 * rows) has nothing behind it on our backend and is decorative, same as the
 * mock $1000/mo Meta Verified payment already established in Phase 20.
 */
export function AccountsCenterDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("settings");
  const [section, setSection] = useState<Section>("profiles");

  const NAV: { key: Section; label: string; Icon: typeof UserRound }[] = [
    { key: "password", label: t("acPasswordSecurity"), Icon: KeyRound },
    { key: "crossApp", label: t("acCrossApp"), Icon: RefreshCcw },
    { key: "permissions", label: t("acInfoPermissions"), Icon: Shield },
    { key: "ads", label: t("acAdPreferences"), Icon: Megaphone },
    { key: "pay", label: t("acMetaPay"), Icon: CreditCard },
    { key: "subscriptions", label: t("acSubscriptions"), Icon: BadgeCheck },
    { key: "manage", label: t("acManageAccounts"), Icon: UserRound },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[85vh] max-h-[900px] w-[95vw] max-w-[1120px] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[1120px]"
      >
        <DialogTitle className="sr-only">{t("accountsCenter")}</DialogTitle>
        <div className="flex min-h-0 flex-1">
          <aside className="border-ig-border w-[300px] shrink-0 overflow-y-auto border-r px-6 py-6">
            <p className="text-ig-text-secondary flex items-center gap-1 text-xs font-semibold">
              <InfinityIcon className="size-3.5" aria-hidden />
              Meta
            </p>
            <h2 className="text-ig-text mt-1 text-xl font-bold">{t("accountsCenter")}</h2>
            <p className="text-ig-text-secondary mt-3 text-xs">{t("acIntro")}</p>

            <nav className="mt-6 space-y-1">
              <SectionButton
                active={section === "profiles"}
                label={t("acProfilesInfo")}
                Icon={UserRound}
                onClick={() => setSection("profiles")}
              />
            </nav>

            <p className="text-ig-text-secondary mt-6 px-3 pb-2 text-xs font-semibold">
              {t("acAccountSettings")}
            </p>
            <nav className="space-y-1">
              {NAV.map(({ key, label, Icon }) => (
                <SectionButton
                  key={key}
                  active={section === key}
                  label={label}
                  Icon={Icon}
                  onClick={() => setSection(key)}
                />
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
            {section === "profiles" ? <ProfilesPane onOpenChange={onOpenChange} /> : null}
            {section === "password" ? <PasswordPane /> : null}
            {section === "crossApp" ? <CrossAppPane /> : null}
            {section === "permissions" ? <PermissionsPane /> : null}
            {section === "ads" ? <StubPane title={t("acAdPreferences")} /> : null}
            {section === "pay" ? <MetaPayPane /> : null}
            {section === "subscriptions" ? <SubscriptionsPane onOpenChange={onOpenChange} /> : null}
            {section === "manage" ? <ManageAccountsPane /> : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionButton({
  active,
  label,
  Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  Icon: typeof UserRound;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm",
        active
          ? "bg-ig-bg-secondary text-ig-text font-semibold"
          : "text-ig-text hover:bg-ig-bg-secondary",
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span className="flex-1">{label}</span>
    </button>
  );
}

function PaneTitle({ children }: { children: string }) {
  return <h3 className="text-ig-text mb-6 text-xl font-bold">{children}</h3>;
}

function Row({
  title,
  subtitle,
  avatarSrc,
  avatarAlt,
  right,
}: {
  title: string;
  subtitle?: string;
  avatarSrc?: string | null;
  avatarAlt?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="border-ig-border flex items-center gap-3 border-b px-4 py-4 last:border-b-0">
      {avatarAlt !== undefined ? (
        <UserAvatar src={avatarSrc ?? null} alt={avatarAlt} size={44} />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-ig-text text-sm font-semibold">{title}</p>
        {subtitle ? <p className="text-ig-text-secondary truncate text-sm">{subtitle}</p> : null}
      </div>
      {right ?? <ChevronRight className="text-ig-text-secondary size-5 shrink-0" />}
    </div>
  );
}

function ProfilesPane({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("settings");
  const { user } = useAuth();
  const { data: profile } = useMyProfile();

  if (!user) return <Loader className="py-10" />;

  return (
    <div className="max-w-[560px]">
      <PaneTitle>{t("acProfilesInfo")}</PaneTitle>

      <h4 className="text-ig-text mb-3 text-base font-semibold">{t("acProfiles")}</h4>
      <div className="border-ig-border mb-3 rounded-2xl border">
        <Row
          title={user.userName}
          subtitle="Instagram"
          avatarSrc={profile?.avatarUrl}
          avatarAlt={user.userName}
        />
        <Row
          title={user.phone ?? t("acNoPhone")}
          subtitle="WhatsApp"
          avatarSrc={profile?.avatarUrl}
          avatarAlt=""
        />
        <Row title={user.userName} subtitle="Threads" avatarSrc={profile?.avatarUrl} avatarAlt="" />
      </div>
      <p className="text-ig-link mb-8 text-sm font-semibold">{t("acAddAccounts")}</p>

      <h4 className="text-ig-text mb-3 text-base font-semibold">{t("acPersonalInfo")}</h4>
      <div className="border-ig-border rounded-2xl border">
        <Row
          title={t("acContactInfo")}
          subtitle={[user.email, user.phone].filter(Boolean).join(", ")}
        />
        <Link href={ROUTES.personalInfo} onClick={() => onOpenChange(false)} className="block">
          <Row
            title={t("acDob")}
            subtitle={user.dob ? new Date(user.dob).toLocaleDateString() : t("acNotSet")}
          />
        </Link>
      </div>
    </div>
  );
}

function PasswordPane() {
  const t = useTranslations("settings");

  return (
    <div className="max-w-[560px]">
      <PaneTitle>{t("acPasswordSecurity")}</PaneTitle>

      <h4 className="text-ig-text mb-1 text-base font-semibold">{t("acLoginRecovery")}</h4>
      <p className="text-ig-text-secondary mb-3 text-sm">{t("acLoginRecoveryHint")}</p>
      <div className="border-ig-border mb-8 space-y-6 rounded-2xl border px-4 py-4">
        <ChangePasswordForm />
        <div className="border-ig-border flex items-center gap-3 border-t pt-4">
          <span className="text-ig-text flex-1 text-sm">{t("acTwoFactor")}</span>
          <ChevronRight className="text-ig-text-secondary size-5 shrink-0" />
        </div>
      </div>

      <h4 className="text-ig-text mb-1 text-base font-semibold">{t("acSecurityCheck")}</h4>
      <p className="text-ig-text-secondary mb-3 text-sm">{t("acSecurityCheckHint")}</p>
      <div className="border-ig-border rounded-2xl border">
        <Row title={t("acActiveSessions")} />
        <Row title={t("acRecentEmails")} />
      </div>
    </div>
  );
}

function CrossAppPane() {
  const t = useTranslations("settings");

  return (
    <div className="max-w-[640px]">
      <PaneTitle>{t("acCrossApp")}</PaneTitle>
      <p className="text-ig-text-secondary mb-8 text-sm">{t("acCrossAppHint")}</p>

      <Group title={t("acContent")}>
        <Row title={t("acMultiPost")} />
        <Row title={t("acDating")} />
        <Row title={t("acMemories")} />
        <Row title={t("acMediaOnDevices")} />
      </Group>
      <Group title={t("acProfileAccess")}>
        <Row title={t("acPhotoSync")} />
        <Row title={t("acShowLinks")} />
      </Group>
      <Group title={t("acFriendsFollowers")}>
        <Row title={t("acSuggestedProfiles")} />
        <Row title={t("acHorizonFollows")} />
      </Group>
    </div>
  );
}

function PermissionsPane() {
  const t = useTranslations("settings");

  return (
    <div className="max-w-[560px]">
      <PaneTitle>{t("acInfoPermissions")}</PaneTitle>
      <div className="bg-ig-bg-secondary mb-6 rounded-2xl px-4 py-4 text-sm">
        <p className="text-ig-text">{t("acExportHint")}</p>
      </div>
      <div className="border-ig-border mb-8 rounded-2xl border">
        <Row title={t("acExportInfo")} />
        <Row title={t("acSearchHistory")} />
      </div>
      <div className="border-ig-border rounded-2xl border">
        <Row title={t("acOtherCompanies")} />
        <Row title={t("acConnectedApps")} />
        <Row title={t("acManageContacts")} />
        <Row title={t("acCookies")} />
      </div>
    </div>
  );
}

function MetaPayPane() {
  const t = useTranslations("settings");
  const filters = [
    t("acAll"),
    t("acTransfer"),
    t("acOrders"),
    t("acDonations"),
    t("acGames"),
    t("acOther"),
  ];

  return (
    <div className="max-w-[640px]">
      <p className="text-ig-text-secondary flex items-center gap-1 text-xs font-semibold">
        <InfinityIcon className="size-3.5" aria-hidden />
        Meta Pay
      </p>
      <div className="border-ig-border mt-4 mb-6 flex gap-6 border-b">
        <span className="text-ig-text border-ig-text border-b-2 pb-3 text-sm font-semibold">
          {t("acTransactions")}
        </span>
        <span className="text-ig-text-secondary pb-3 text-sm">{t("acManage")}</span>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((label, i) => (
          <span
            key={label}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              i === 0 ? "bg-ig-text text-ig-bg-primary" : "border-ig-border text-ig-text border",
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="border-ig-border rounded-2xl border px-4 py-4">
        <Row
          title="demo_user"
          subtitle={t("acMockTransferStatus")}
          right={<span className="text-ig-text text-sm font-semibold">10,00 $</span>}
        />
      </div>
    </div>
  );
}

function SubscriptionsPane({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("settings");

  return (
    <div className="max-w-[560px]">
      <PaneTitle>{t("acSubscriptions")}</PaneTitle>
      <p className="text-ig-text-secondary mb-6 text-sm">{t("acSubscriptionsHint")}</p>
      <Link
        href={ROUTES.verified}
        onClick={() => onOpenChange(false)}
        className="border-ig-border flex items-center gap-3 rounded-2xl border px-4 py-4"
      >
        <BadgeCheck className="text-ig-primary size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-ig-text text-sm font-semibold">Meta Verified</p>
          <p className="text-ig-text-secondary text-sm">{t("acMetaVerifiedHint")}</p>
        </div>
        <ChevronRight className="text-ig-text-secondary size-5 shrink-0" />
      </Link>
    </div>
  );
}

function ManageAccountsPane() {
  const t = useTranslations("settings");
  const { user } = useAuth();
  const { data: profile } = useMyProfile();

  if (!user) return <Loader className="py-10" />;

  const apps = [
    { app: "Instagram", title: user.userName, avatar: profile?.avatarUrl },
    { app: "WhatsApp", title: user.phone ?? t("acNoPhone"), avatar: profile?.avatarUrl },
    { app: "Threads", title: user.userName, avatar: profile?.avatarUrl },
  ];

  return (
    <div className="max-w-[560px]">
      <PaneTitle>{t("acManageAccounts")}</PaneTitle>
      <p className="text-ig-link mb-6 text-sm font-semibold">{t("acAddAccounts")}</p>

      {apps.map(({ app, title, avatar }) => (
        <div key={app} className="border-ig-border mb-4 rounded-2xl border">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-ig-text text-sm font-semibold">{app}</span>
            <span className="bg-ig-button-secondary text-ig-text rounded-lg px-3 py-1.5 text-xs font-semibold">
              {t("acManageButton")}
            </span>
          </div>
          <Row title={title} avatarSrc={avatar} avatarAlt={title} right={<span />} />
        </div>
      ))}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h4 className="text-ig-text mb-3 text-base font-semibold">{title}</h4>
      <div className="border-ig-border rounded-2xl border">{children}</div>
    </div>
  );
}

function StubPane({ title }: { title: string }) {
  const t = useTranslations("settings");
  return (
    <div className="max-w-[560px]">
      <PaneTitle>{title}</PaneTitle>
      <p className="text-ig-text-secondary border-ig-border rounded-2xl border px-4 py-10 text-center text-sm">
        {t("acComingSoon")}
      </p>
    </div>
  );
}

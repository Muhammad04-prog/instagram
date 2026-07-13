"use client";

import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { RemoveProfilesDialog } from "@/components/auth/RemoveProfilesDialog";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { SavedAccount } from "@/store/savedAccounts.store";

/**
 * "Continue as …" (docs/screenshots/img1). Shown when this browser has signed in
 * before. No token is stored, so continuing goes to the password step — the card
 * is a shortcut, not a session.
 */
export function ContinueAsCard({
  account,
  onContinue,
  onUseAnother,
}: {
  account: SavedAccount;
  onContinue: () => void;
  onUseAnother: () => void;
}) {
  const t = useTranslations("auth");
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative w-full max-w-[420px]"
    >
      <button
        type="button"
        onClick={() => setManageOpen(true)}
        aria-label={t("manageProfiles")}
        className="text-ig-text-secondary hover:text-ig-text absolute -top-14 right-0 transition-colors"
      >
        <Settings className="size-6" />
      </button>

      <div className="flex flex-col items-center">
        <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 300 }}>
          <UserAvatar src={account.image} size={160} priority className="ring-1 ring-white/10" />
        </motion.div>

        <p className="text-ig-text mt-6 mb-8 text-2xl font-semibold">{account.userName}</p>
      </div>

      <div className="space-y-3">
        <AuthButton type="button" onClick={onContinue}>
          {t("continue")}
        </AuthButton>

        <button
          type="button"
          onClick={onUseAnother}
          className="bg-auth-input-bg text-ig-text hover:bg-auth-input-bg/70 border-auth-input-border h-12 w-full rounded-full border text-[15px] font-semibold transition-colors"
        >
          {t("useAnotherProfile")}
        </button>
      </div>

      <Link
        href={ROUTES.register}
        className="border-auth-primary text-auth-primary hover:bg-auth-primary/10 mt-8 flex h-12 w-full items-center justify-center rounded-full border text-[15px] font-semibold transition-colors"
      >
        {t("createAccount")}
      </Link>

      <p className="text-ig-text-secondary mt-6 text-center text-sm font-semibold">∞ Meta</p>

      <RemoveProfilesDialog open={manageOpen} onOpenChange={setManageOpen} />
    </motion.div>
  );
}

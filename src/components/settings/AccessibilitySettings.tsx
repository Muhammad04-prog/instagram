"use client";

import { useTranslations } from "next-intl";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { useAccessibilityStore } from "@/store/accessibility.store";

/** Settings → Специальные возможности. The only real toggle here: it actually
 * flips <MotionConfig reducedMotion> in Providers, disabling framer-motion
 * transitions app-wide, not just a cosmetic switch. */
export function AccessibilitySettings() {
  const t = useTranslations("settings");
  const reduceMotion = useAccessibilityStore((s) => s.reduceMotion);
  const setReduceMotion = useAccessibilityStore((s) => s.setReduceMotion);

  return (
    <div className="max-w-[640px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("accessibility")}</h2>

      <SettingsToggleRow
        title={t("reduceMotion")}
        checked={reduceMotion}
        onCheckedChange={setReduceMotion}
      />

      <p className="text-ig-text-secondary text-sm">{t("reduceMotionHint")}</p>
    </div>
  );
}

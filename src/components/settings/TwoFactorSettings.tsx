"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { useDisableTwoFactor, useEnableTwoFactor, useSetupTwoFactor } from "@/hooks/useTwoFactor";
import type { TwoFactorSetupDto } from "@/types/api.types";

type Stage = "off" | "settingUp" | "backupCodes" | "on" | "disabling";

/**
 * Settings → Two-factor authentication — `auth/2fa/*`, new in the 19.07.2026
 * swagger refresh.
 *
 * ⚠️ There is no "is 2FA on?" read endpoint anywhere in the API —
 * `AuthUserDto` carries no such field. So this screen cannot know the real
 * state on load; it always opens assuming "off" and tracks what *this visit*
 * did. A user who already has 2FA on from a previous session would see the
 * "Turn on" flow again rather than "Turn off" — `enable2fa` and `disable2fa`
 * both still work correctly either way, since the backend is the actual
 * source of truth, this screen just can't preview it.
 *
 * No QR-code image is rendered (no such library in the stack) — the
 * `otpauthUri` and the raw setup key are both shown as text instead.
 */
export function TwoFactorSettings() {
  const t = useTranslations("settings");
  const toMessage = useApiError();
  const [stage, setStage] = useState<Stage>("off");
  const [setup, setSetup] = useState<TwoFactorSetupDto | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const setupMutation = useSetupTwoFactor();
  const enableMutation = useEnableTwoFactor();
  const disableMutation = useDisableTwoFactor();

  const startSetup = () => {
    setupMutation.mutate(undefined, {
      onSuccess: (data) => {
        setSetup(data);
        setStage("settingUp");
      },
      onError: (error) => toast.error(toMessage(error)),
    });
  };

  const confirmEnable = () => {
    enableMutation.mutate(
      { code },
      {
        onSuccess: (data) => {
          setBackupCodes(data.backupCodes);
          setStage("backupCodes");
          setCode("");
        },
        onError: (error) => toast.error(toMessage(error)),
      },
    );
  };

  const confirmDisable = () => {
    disableMutation.mutate(
      { code },
      {
        onSuccess: () => {
          toast.success(t("twoFactorDisabled"));
          setStage("off");
          setCode("");
        },
        onError: (error) => toast.error(toMessage(error)),
      },
    );
  };

  return (
    <div className="max-w-[560px] space-y-6">
      <h2 className="text-ig-text text-lg font-bold">{t("twoFactor")}</h2>

      {stage === "off" ? (
        <>
          <p className="text-ig-text-secondary text-sm">{t("twoFactorOffHint")}</p>
          <button
            type="button"
            onClick={startSetup}
            disabled={setupMutation.isPending}
            className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t("twoFactorTurnOn")}
          </button>
        </>
      ) : null}

      {stage === "settingUp" && setup ? (
        <div className="space-y-4">
          <p className="text-ig-text-secondary text-sm">{t("twoFactorScanHint")}</p>
          <div className="bg-ig-button-secondary space-y-2 rounded-lg p-3">
            <p className="text-ig-text-secondary text-xs">{t("twoFactorSetupKey")}</p>
            <p className="text-ig-text font-mono text-sm break-all">{setup.secret}</p>
            <p className="text-ig-text-secondary font-mono text-xs break-all">{setup.otpauthUri}</p>
          </div>

          <p className="text-ig-text-secondary text-sm">{t("twoFactorCodeConfirmHint")}</p>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.trim())}
            aria-label={t("twoFactorCodeConfirmHint")}
            autoFocus
            className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
          />
          <button
            type="button"
            onClick={confirmEnable}
            disabled={!code || enableMutation.isPending}
            className="bg-ig-primary hover:bg-ig-primary-hover rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t("twoFactorEnable")}
          </button>
        </div>
      ) : null}

      {stage === "backupCodes" ? (
        <div className="space-y-4">
          <h3 className="text-ig-text text-base font-semibold">{t("twoFactorBackupTitle")}</h3>
          <p className="text-ig-text-secondary text-sm">{t("twoFactorBackupHint")}</p>
          <ul className="bg-ig-button-secondary grid grid-cols-2 gap-2 rounded-lg p-3">
            {backupCodes.map((backupCode) => (
              <li key={backupCode} className="text-ig-text font-mono text-sm">
                {backupCode}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              toast.success(t("twoFactorEnabled"));
              setStage("on");
            }}
            className="bg-ig-primary hover:bg-ig-primary-hover w-full rounded-lg py-2.5 text-sm font-semibold text-white"
          >
            {t("twoFactorBackupDone")}
          </button>
        </div>
      ) : null}

      {stage === "on" ? (
        <>
          <p className="text-ig-text text-sm font-semibold">{t("twoFactorEnabled")}</p>
          <button
            type="button"
            onClick={() => setStage("disabling")}
            className="text-ig-danger text-sm font-semibold"
          >
            {t("twoFactorTurnOff")}
          </button>
        </>
      ) : null}

      {stage === "disabling" ? (
        <div className="space-y-3">
          <p className="text-ig-text-secondary text-sm">{t("twoFactorDisableHint")}</p>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.trim())}
            placeholder={t("twoFactorCodeConfirmHint")}
            aria-label={t("twoFactorDisableHint")}
            autoFocus
            className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
          />
          <button
            type="button"
            onClick={confirmDisable}
            disabled={!code || disableMutation.isPending}
            className="bg-ig-danger rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t("twoFactorTurnOff")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

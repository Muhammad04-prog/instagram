"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { Disable2faDto, Enable2faDto } from "@/types/api.types";

/**
 * No query here on purpose: the backend exposes no "is 2FA on?" read
 * endpoint (only `AuthUserDto` might one day carry it — it doesn't yet).
 * `TwoFactorSettings` tracks its own on/off state locally across the
 * setup → enable / disable actions within one visit to the screen.
 */
export function useSetupTwoFactor() {
  return useMutation({ mutationFn: () => authService.setup2fa() });
}

export function useEnableTwoFactor() {
  return useMutation({ mutationFn: (dto: Enable2faDto) => authService.enable2fa(dto) });
}

export function useDisableTwoFactor() {
  return useMutation({ mutationFn: (dto: Disable2faDto) => authService.disable2fa(dto) });
}

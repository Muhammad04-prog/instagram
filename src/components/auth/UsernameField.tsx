"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, type Control, type ControllerRenderProps } from "react-hook-form";
import { AuthInput } from "@/components/auth/AuthInput";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { authService } from "@/services/auth.service";
import type { RegisterValues } from "@/lib/validators/auth.schema";

/**
 * Username field with live availability, using `POST /auth/check-username`.
 *
 * Debounced, and only asked once the value passes the local rules — there is no
 * point spending a request on a name Zod already rejects. The check is advisory:
 * it never blocks submit, because the server re-checks on register anyway and a
 * flaky network must not trap someone on this screen.
 */
export function UsernameField({
  control,
  error,
}: {
  control: Control<RegisterValues>;
  error?: string;
}) {
  const t = useTranslations("auth");

  return (
    <Controller
      control={control}
      name="userName"
      render={({ field }) => <UsernameInput field={field} error={error} t={t} />}
    />
  );
}

function UsernameInput({
  field,
  error,
  t,
}: {
  field: ControllerRenderProps<RegisterValues, "userName">;
  error?: string;
  t: (key: string) => string;
}) {
  const debounced = useDebounce(field.value, SEARCH_DEBOUNCE_MS);
  const eligible = debounced.length >= 3 && !error;

  const { data, isFetching } = useQuery({
    queryKey: ["username-available", debounced],
    queryFn: () => authService.checkUsername({ userName: debounced }),
    enabled: eligible,
    // A name freed up mid-signup is vanishingly rare; don't re-ask on refocus.
    staleTime: 60 * 1000,
    retry: false,
  });

  const available = eligible && !isFetching ? data?.available : undefined;

  return (
    <div className="w-full">
      <div className="relative">
        <AuthInput
          {...field}
          filled
          placeholder={t("userName")}
          autoComplete="username"
          error={error}
          className={available === false && !error ? "border-ig-danger" : undefined}
        />

        <span className="pointer-events-none absolute top-4 right-4">
          {eligible && isFetching ? (
            <Loader2 className="text-ig-text-secondary size-5 animate-spin" />
          ) : available === true ? (
            <Check className="text-ig-success size-5" />
          ) : available === false ? (
            <X className="text-ig-danger size-5" />
          ) : null}
        </span>
      </div>

      {!error && available !== undefined ? (
        <p
          className={
            available ? "text-ig-success mt-1.5 px-1 text-xs" : "text-ig-danger mt-1.5 px-1 text-xs"
          }
        >
          {available ? t("usernameFree") : t("usernameTaken")}
        </p>
      ) : null}
    </div>
  );
}

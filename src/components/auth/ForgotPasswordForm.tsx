"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { CodeInput } from "@/components/auth/CodeInput";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { useApiError } from "@/hooks/useApiError";
import { Link } from "@/i18n/navigation";
import { RESEND_CODE_COOLDOWN_S, ROUTES } from "@/lib/constants";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators/auth.schema";
import { authService } from "@/services/auth.service";

/**
 * Password reset, docs/screenshots/img6 ("Поиск аккаунта") extended into the
 * three steps the API actually has:
 *
 *   email → 6-digit code (→ single-use resetToken, 15 min) → new password
 *
 * Softclub could only do this in two steps, and its mailer was broken anyway —
 * a valid address answered with a raw MailKit stack trace (bug #22), so the
 * screen could never be finished. It works here.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  if (resetToken) return <ResetPasswordForm resetToken={resetToken} />;
  if (email)
    return <CodeStep email={email} onVerified={setResetToken} onBack={() => setEmail("")} />;
  return <EmailStep onSent={setEmail} />;
}

/** Step 1 — where do we send the code. */
function EmailStep({ onSent }: { onSent: (email: string) => void }) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const toMessage = useApiError();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema(tv)),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const forgot = useMutation({
    mutationFn: (values: ForgotPasswordValues) =>
      authService.forgotPassword({ email: values.email }),
    onSuccess: (_data, values) => {
      toast.success(t("codeSent"));
      onSent(values.email);
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => forgot.mutate(values))}
      className="w-full max-w-[750px] space-y-6"
    >
      <Link href={ROUTES.login} aria-label={t("login")} className="block">
        <ChevronLeft className="text-ig-text size-6" />
      </Link>

      <header className="space-y-2">
        <h1 className="text-ig-text text-[28px] font-bold">{t("findAccount")}</h1>
        <p className="text-ig-text-secondary text-[15px]">{t("findAccountSubtitle")}</p>
      </header>

      <AuthInput
        {...register("email")}
        type="email"
        placeholder={t("emailPlaceholder")}
        autoComplete="email"
        error={errors.email?.message}
      />

      <AuthButton type="submit" disabled={!isValid} loading={forgot.isPending}>
        {t("continue")}
      </AuthButton>
    </form>
  );
}

/** Step 2 — the emailed code, traded for a reset token. */
function CodeStep({
  email,
  onVerified,
  onBack,
}: {
  email: string;
  onVerified: (resetToken: string) => void;
  onBack: () => void;
}) {
  const t = useTranslations("auth");
  const toMessage = useApiError();
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_CODE_COOLDOWN_S);

  // The backend refuses a second code within a minute (429), so the button says
  // when it will work instead of letting the user earn a rate-limit error.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const verify = useMutation({
    mutationFn: () => authService.verifyCode({ email, code }),
    onSuccess: (data) => onVerified(data.resetToken),
    // A wrong or stale code is the expected failure here — the token it buys
    // only lives 15 minutes.
    onError: (error) => toast.error(toMessage(error, { 400: t("codeInvalid") })),
  });

  const resend = useMutation({
    mutationFn: () => authService.resendCode({ email }),
    onSuccess: () => {
      toast.success(t("codeSent"));
      setCooldown(RESEND_CODE_COOLDOWN_S);
    },
    // The 60s cooldown below normally prevents it, but the server is the
    // authority on the limit (429) — e.g. a code already sent from another tab.
    onError: (error) => toast.error(toMessage(error)),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        verify.mutate();
      }}
      className="w-full max-w-[750px] space-y-6"
    >
      <button type="button" onClick={onBack} aria-label={t("back")} className="block">
        <ChevronLeft className="text-ig-text size-6" />
      </button>

      <header className="space-y-2">
        <h1 className="text-ig-text text-[28px] font-bold">{t("enterCode")}</h1>
        <p className="text-ig-text-secondary text-[15px]">{t("enterCodeSubtitle", { email })}</p>
      </header>

      <CodeInput value={code} onChange={setCode} autoFocus />

      <AuthButton type="submit" disabled={code.length < 6} loading={verify.isPending}>
        {t("continue")}
      </AuthButton>

      <button
        type="button"
        onClick={() => resend.mutate()}
        disabled={cooldown > 0 || resend.isPending}
        className="text-ig-primary block w-full text-center text-sm font-semibold disabled:opacity-50"
      >
        {cooldown > 0 ? t("resendIn", { seconds: cooldown }) : t("resendCode")}
      </button>
    </form>
  );
}

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Reset password" };

/**
 * Kept as a redirect, not a screen.
 *
 * Resetting a password used to arrive here from an emailed link carrying
 * `?token=&email=`. The backend mails a 6-digit **code** now, and the reset
 * token it trades for is single-use and never leaves the browser — so the whole
 * flow lives on /forgot-password. Old links (and muscle memory) land here.
 */
export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  redirect({ href: ROUTES.forgotPassword, locale });
}

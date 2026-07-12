import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Grand_Hotel } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers/Providers";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const grandHotel = Grand_Hotel({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-logo",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    // suppressHydrationWarning: next-themes writes the theme class before hydration.
    <html lang={locale} suppressHydrationWarning className={cn("h-full", grandHotel.variable)}>
      <body className="flex min-h-full flex-col antialiased">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

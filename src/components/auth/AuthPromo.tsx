"use client";

import { useTranslations } from "next-intl";
import { PhoneCollage } from "@/components/auth/PhoneCollage";
import { InstagramGlyph } from "@/components/icons/InstagramGlyph";

/**
 * Left half of the login screen (docs/screenshots/img1 / img7): the app mark, a
 * serif headline and the phone collage.
 */
export function AuthPromo() {
  const t = useTranslations("auth");

  return (
    <section className="bg-auth-promo-bg hidden flex-1 flex-col justify-center px-16 py-12 lg:flex">
      <div className="mx-auto w-full max-w-xl">
        <InstagramGlyph size={84} className="mb-8" />

        <h1 className="text-ig-text font-serif text-[44px] leading-[1.25] font-normal">
          {t.rich("promoHeadline", {
            highlight: (chunks) => (
              <span className="bg-gradient-to-r from-[#fa7e1e] via-[#ed4956] to-[#bc1888] bg-clip-text text-transparent">
                {chunks}
              </span>
            ),
          })}
        </h1>

        <div className="mt-12">
          <PhoneCollage />
        </div>
      </div>
    </section>
  );
}

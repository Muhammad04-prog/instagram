import { useTranslations } from "next-intl";

/**
 * Left half of the login screen (docs/screenshots/img7): gradient IG mark and a
 * serif headline. The phone-collage photo from the screenshot is a Meta asset we
 * do not have, so the panel ships without it.
 */
export function AuthPromo() {
  const t = useTranslations("auth");

  return (
    <section className="bg-auth-promo-bg hidden flex-1 flex-col justify-center px-16 lg:flex">
      <div className="mx-auto max-w-xl">
        <div
          className="mb-8 size-[88px] rounded-[26px] p-[3px]"
          style={{ background: "var(--ig-story-gradient)" }}
          aria-hidden
        >
          <div className="bg-auth-promo-bg flex size-full items-center justify-center rounded-[23px]">
            <span className="font-logo text-3xl text-white">Ig</span>
          </div>
        </div>

        <h1 className="font-serif text-5xl leading-tight text-white">
          {t.rich("promoHeadline", {
            highlight: (chunks) => (
              <span className="bg-gradient-to-r from-[#ed4956] to-[#bc1888] bg-clip-text text-transparent">
                {chunks}
              </span>
            ),
          })}
        </h1>
      </div>
    </section>
  );
}

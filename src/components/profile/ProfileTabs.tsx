"use client";

import { useTranslations } from "next-intl";
import { BookmarkIcon, GridIcon, RepostIcon, TaggedIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export type ProfileTab = "posts" | "saved" | "reels" | "tagged";

/**
 * Icon-only tab bar, in the order and style of docs/screenshots/img35 —
 * grid → saved → reposts → tagged, active one underlined. "Saved" exists on my
 * own profile only.
 */
export function ProfileTabs({
  value,
  onChange,
  showSaved,
}: {
  value: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  showSaved: boolean;
}) {
  const t = useTranslations("profile");

  const tabs: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { id: "posts", label: t("postsTab"), icon: <GridIcon /> },
    ...(showSaved ? [{ id: "saved" as const, label: t("saved"), icon: <BookmarkIcon /> }] : []),
    { id: "reels", label: t("reels"), icon: <RepostIcon /> },
    { id: "tagged", label: t("tagged"), icon: <TaggedIcon /> },
  ];

  return (
    <div role="tablist" className="border-ig-separator flex justify-center border-b">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={tab.label}
            onClick={() => onChange(tab.id)}
            // The active tab is underlined at the same hairline the bar sits on (img35).
            className={cn(
              "-mb-px flex flex-1 items-center justify-center border-b py-4 md:flex-none md:px-12",
              active ? "border-ig-text text-ig-text" : "text-ig-text-secondary border-transparent",
            )}
          >
            {/* img35 shows icons only — the label lives in aria-label. */}
            <span className="[&_svg]:size-6">{tab.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

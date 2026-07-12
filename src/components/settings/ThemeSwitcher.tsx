"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", key: "light", Icon: Sun },
  { value: "dark", key: "dark", Icon: Moon },
  { value: "system", key: "system", Icon: Monitor },
] as const;

/** Reached from the sidebar's "More" menu → "Switch appearance" (img46). */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("settings");

  return (
    <div className="space-y-1">
      {OPTIONS.map(({ value, key, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "hover:bg-ig-elevated flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm",
            theme === value ? "text-ig-text font-semibold" : "text-ig-text",
          )}
        >
          <Icon className="size-5" />
          <span className="flex-1 text-left">{t(key)}</span>
          {theme === value ? <span className="bg-ig-primary size-2 rounded-full" /> : null}
        </button>
      ))}
    </div>
  );
}

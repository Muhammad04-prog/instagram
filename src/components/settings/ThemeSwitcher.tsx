"use client";

import { useSyncExternalStore } from "react";
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

  // `theme` is unknown on the server and on the first client render — reading it
  // during render would make the active-row marker mismatch and fail hydration
  // (React #418). `useSyncExternalStore` returns the server snapshot (`false`)
  // for both the SSR and the first client render, then flips to `true`, which is
  // the supported way to gate client-only state without setState-in-effect.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className="space-y-1">
      {OPTIONS.map(({ value, key, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "hover:bg-ig-elevated flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm",
              active ? "text-ig-text font-semibold" : "text-ig-text",
            )}
          >
            <Icon className="size-5" />
            <span className="flex-1 text-left">{t(key)}</span>
            {active ? <span className="bg-ig-primary size-2 rounded-full" /> : null}
          </button>
        );
      })}
    </div>
  );
}

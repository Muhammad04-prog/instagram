import { cn } from "@/lib/utils";

export interface SettingsRadioOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * A bordered card containing radio rows — "Кто может отмечать вас" (img9),
 * "Разрешить комментарии от" (img10). Local state only, nothing persisted.
 */
export function SettingsRadioGroup({
  options,
  value,
  onChange,
  name,
  disabled,
}: {
  options: SettingsRadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
}) {
  return (
    <div className="border-ig-border divide-ig-border divide-y overflow-hidden rounded-2xl border">
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex items-center gap-4 px-4 py-4",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="text-ig-text block text-sm">{option.label}</span>
              {option.description ? (
                <span className="text-ig-text-secondary mt-1 block text-xs">
                  {option.description}
                </span>
              ) : null}
            </span>
            <input
              type="radio"
              name={name}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "border-ig-text-secondary flex size-[18px] shrink-0 items-center justify-center rounded-full border-2",
                checked && "border-ig-text",
              )}
            >
              {checked ? <span className="bg-ig-text size-2.5 rounded-full" /> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

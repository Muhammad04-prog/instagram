import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Title/description card with a Switch on the right — the shape used
 * throughout Settings (img11/img19/img20/img24/…). Purely local state where
 * there is no backing endpoint: it flips, nothing is persisted or sent.
 */
export function SettingsToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "border-ig-border flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4",
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="text-ig-text block text-sm">{title}</span>
        {description ? (
          <span className="text-ig-text-secondary mt-1 block text-xs">{description}</span>
        ) : null}
      </span>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </label>
  );
}

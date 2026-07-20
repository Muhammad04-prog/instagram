"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUserSearch";
import { cn } from "@/lib/utils";

/** Search + multi-select dialog for `POST /chats/{id}/participants`. */
export function GroupParticipantPicker({
  open,
  onOpenChange,
  exclude,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Already-in-the-group ids, filtered out of the results. */
  exclude: string[];
  onSubmit: (userIds: string[]) => void;
  pending: boolean;
}) {
  const t = useTranslations("chat");
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const debounced = useDebounce(term.trim());

  const { data } = useUsers(debounced, debounced.length > 0);
  const excludeSet = new Set(exclude);
  const results = (data ?? []).filter((user) => !excludeSet.has(user.id));

  const toggle = (userId: string) => {
    setSelected((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setTerm("");
          setSelected([]);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="bg-ig-elevated flex h-[480px] w-[380px] flex-col gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-bold">
            {t("addParticipants")}
          </DialogTitle>
        </div>

        <div className="border-ig-separator border-b px-4 py-2">
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("addParticipantsSearchPlaceholder")}
            aria-label={t("addParticipantsSearchPlaceholder")}
            className="text-ig-text placeholder:text-ig-text-secondary w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul>
            {results.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => toggle(user.id)}
                  className="hover:bg-ig-bg-secondary flex w-full items-center gap-3 px-4 py-2 text-left"
                >
                  <UserAvatar src={user.avatarUrl ?? null} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="text-ig-text block truncate text-sm font-semibold">
                      {user.userName}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      selected.includes(user.id)
                        ? "border-ig-primary bg-ig-primary"
                        : "border-ig-text-secondary",
                    )}
                  >
                    {selected.includes(user.id) ? <Check className="size-3 text-white" /> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={() => onSubmit(selected)}
            disabled={selected.length === 0 || pending}
            className="bg-ig-primary w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {t("addParticipants")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

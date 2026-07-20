"use client";

import { UserPlus2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUserSearch";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import type { UserBriefDto } from "@/types/api.types";

/**
 * "Invite collaborators" — `POST /posts/{id}/collaborators`, new in the
 * 19.07.2026 swagger refresh. Unlike tagging, this has no field on the create
 * call itself: the post is created first, then invited separately once its id
 * exists (see `CreatePost.onShare`). Same picker shape as `TagPeoplePicker`.
 */
export function CollaboratorPicker({
  value,
  onChange,
}: {
  value: UserBriefDto[];
  onChange: (users: UserBriefDto[]) => void;
}) {
  const t = useTranslations("post");
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim(), SEARCH_DEBOUNCE_MS);
  const { data } = useUsers(debounced, debounced.length > 0);

  const chosen = new Set(value.map((user) => user.id));
  const results = (data ?? []).filter((user) => !chosen.has(user.id));

  return (
    <div className="border-ig-separator relative border-t py-3">
      <div className="flex items-center gap-2">
        <UserPlus2 className="text-ig-text-secondary size-4 shrink-0" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t("inviteCollaborators")}
          aria-label={t("inviteCollaborators")}
          className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {value.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {value.map((user) => (
            <li
              key={user.id}
              className="bg-ig-button-secondary text-ig-text flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-xs font-semibold"
            >
              {user.userName}
              <button
                type="button"
                onClick={() => onChange(value.filter((invited) => invited.id !== user.id))}
                aria-label={t("removeTag", { userName: user.userName })}
                className="text-ig-text-secondary hover:text-ig-text"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {results.length > 0 ? (
        <ul className="bg-ig-elevated border-ig-separator absolute right-0 left-0 z-10 mt-2 max-h-56 overflow-y-auto rounded-lg border shadow-lg">
          {results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => {
                  onChange([...value, user]);
                  setTerm("");
                }}
                className="hover:bg-ig-bg-secondary flex w-full items-center gap-2 px-3 py-2 text-left"
              >
                <UserAvatar src={user.avatarUrl ?? null} alt={user.userName} size={28} />
                <span className="text-ig-text truncate text-sm font-semibold">{user.userName}</span>
                <span className="text-ig-text-secondary truncate text-xs">{user.fullName}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

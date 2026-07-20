"use client";

import { Heart, SmilePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { LiveCommentDto } from "@/types/api.types";

const QUICK_REACTIONS = ["❤️", "🔥", "👏", "😂", "😮", "💯"];

/**
 * The comment strip along the bottom.
 *
 * `comments` is everyone's now (`GET /live/{id}/comments`, 19.07.2026) — this
 * used to only ever hold what the current person had sent, since the API
 * could send but not read back the stream.
 */
export function LiveCommentBar({
  comments,
  onSend,
  onLike,
  onReaction,
  sending,
}: {
  comments: LiveCommentDto[];
  onSend: (text: string) => void;
  onLike: () => void;
  onReaction: (emoji: string) => void;
  sending: boolean;
}) {
  const t = useTranslations("live");
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="space-y-3 p-3">
      {comments.length > 0 ? (
        <ul className="max-h-40 scrollbar-none space-y-2 overflow-y-auto">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2">
              <UserAvatar src={comment.user.avatarUrl} size={24} className="shrink-0" />
              <p className="text-sm text-white">
                <span className="font-semibold">{comment.user.userName}</span>{" "}
                <span className="text-white/90">{comment.text}</span>
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {pickerOpen ? (
        <div className="flex gap-2">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReaction(emoji);
                setPickerOpen(false);
              }}
              className="rounded-full bg-white/10 px-2 py-1 text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex-1"
        >
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("commentPlaceholder")}
            aria-label={t("commentPlaceholder")}
            maxLength={200}
            className="h-10 w-full rounded-full border border-white/30 bg-transparent px-4 text-sm text-white placeholder:text-white/60 focus:outline-none"
          />
        </form>

        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          aria-label={t("reactions")}
          aria-expanded={pickerOpen}
          className="text-white"
        >
          <SmilePlus className="size-6" />
        </button>

        {/* Tap as often as you like — every tap is counted and floats. */}
        <button type="button" onClick={onLike} aria-label={t("like")} className="text-white">
          <Heart className="size-6" />
        </button>
      </div>
    </div>
  );
}

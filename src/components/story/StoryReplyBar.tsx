"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { storyService } from "@/services/story.service";

/** IG's quick-reaction row under a story. */
const QUICK_REACTIONS = ["😂", "😮", "😍", "😢", "👏", "🔥", "🎉", "💯"];

/**
 * Reply / react to someone's story — both land in the author's chat, which is
 * exactly what IG does.
 *
 * New in this backend: softclub had neither, so Phase 6's viewer had no footer
 * at all. A reaction is repeatable by design (`POST /stories/{id}/reaction`);
 * a reply is a message (`/reply`).
 *
 * `onInteractionStart` / `onInteractionEnd` pause the slide timer — typing a
 * reply while the story advances underneath you would be unusable.
 */
export function StoryReplyBar({
  storyId,
  authorName,
  onInteractionStart,
  onInteractionEnd,
  trailing,
}: {
  storyId: number;
  authorName: string;
  onInteractionStart: () => void;
  onInteractionEnd: () => void;
  /** Rendered at the end of the input row — the viewer puts its like heart here. */
  trailing?: React.ReactNode;
}) {
  const t = useTranslations("story");
  const toMessage = useApiError();
  const [text, setText] = useState("");
  const [showReactions, setShowReactions] = useState(false);

  const reply = useMutation({
    mutationFn: (value: string) => storyService.reply(storyId, { text: value }),
    onSuccess: () => {
      toast.success(t("replySent", { userName: authorName }));
      setText("");
      onInteractionEnd();
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  const react = useMutation({
    mutationFn: (emoji: string) => storyService.react(storyId, { emoji }),
    onSuccess: () => {
      toast.success(t("reactionSent", { userName: authorName }));
      setShowReactions(false);
      onInteractionEnd();
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  return (
    <div className="absolute right-0 bottom-0 left-0 z-10 p-3">
      {showReactions ? (
        <ul className="mb-2 flex justify-around rounded-full bg-black/60 px-2 py-2 backdrop-blur">
          {QUICK_REACTIONS.map((emoji) => (
            <li key={emoji}>
              <button
                type="button"
                onClick={() => react.mutate(emoji)}
                disabled={react.isPending}
                aria-label={emoji}
                className="text-2xl transition-transform hover:scale-125 disabled:opacity-50"
              >
                {emoji}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const value = text.trim();
          if (value) reply.mutate(value);
        }}
        className="flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          // Any touch of the bar pauses the story, and releasing it resumes.
          onFocus={onInteractionStart}
          onBlur={() => !text && onInteractionEnd()}
          placeholder={t("replyPlaceholder", { userName: authorName })}
          aria-label={t("replyPlaceholder", { userName: authorName })}
          className="flex-1 rounded-full border border-white/60 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/70"
        />

        {text.trim() ? (
          <button
            type="submit"
            disabled={reply.isPending}
            className="text-sm font-semibold text-white disabled:opacity-50"
          >
            {t("send")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              onInteractionStart();
              setShowReactions((value) => !value);
            }}
            aria-label={t("react")}
            aria-expanded={showReactions}
            className="shrink-0 text-xl"
          >
            😍
          </button>
        )}

        {/* The like heart rides in this row, as IG has it. It used to be a
            separate row underneath, which this absolutely-positioned bar then
            floated straight over — the heart landed on top of the input. */}
        {trailing}
      </form>
    </div>
  );
}

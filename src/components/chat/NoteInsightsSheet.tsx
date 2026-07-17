"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateChat } from "@/hooks/useChat";
import { useDeleteNote, useNoteLikes, useNoteReplies } from "@/hooks/useNotes";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import type { NoteDto, UserBriefDto } from "@/types/api.types";
import { flattenPages } from "@/lib/cursor";

/**
 * The compact card real IG shows when you tap your own note bubble: avatar,
 * like count, audience, then "write a new one" or delete. The fuller
 * likes/replies breakdown (NoteInsightsSheet below) is one tap deeper, behind
 * the like-count badge, instead of being the first thing you see.
 */
export function NoteOwnCard({
  note,
  open,
  onOpenChange,
  onWriteNew,
}: {
  note: NoteDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWriteNew: () => void;
}) {
  const t = useTranslations("note");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const remove = useDeleteNote();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[400px] gap-0 rounded-2xl p-6 text-center">
          <DialogTitle className="sr-only">{t("insightsTitle")}</DialogTitle>

          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="relative mx-auto inline-flex"
          >
            <UserAvatar src={note.author.avatarUrl} size={140} />
            {note.likesCount > 0 ? (
              <span className="bg-ig-bg text-ig-text border-ig-border absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-xs font-semibold">
                {note.likesCount > 99 ? "99+" : note.likesCount}
              </span>
            ) : null}
          </button>

          <p className="text-ig-text mt-3 font-semibold">{note.author.userName}</p>
          <p className="text-ig-text-secondary mt-1 text-sm">
            {t("audienceLabel")}:{" "}
            {note.audience === "FOLLOWERS" ? t("audienceFollowers") : t("audienceCloseFriends")}
          </p>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onWriteNew();
            }}
            className="bg-ig-primary mt-6 w-full rounded-lg py-2 text-sm font-semibold text-white"
          >
            {t("writeNewNote")}
          </button>
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(note.id, {
                onSuccess: () => {
                  toast.success(t("noteDeleted"));
                  onOpenChange(false);
                },
              })
            }
            className="text-ig-danger mt-3 text-sm font-semibold disabled:opacity-50"
          >
            {t("deleteNote")}
          </button>
        </DialogContent>
      </Dialog>

      <NoteInsightsSheet noteId={note.id} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  );
}

/**
 * Who reacted to my note — author-only, which is what the endpoints enforce.
 *
 * Replies are messages in a chat, not comments, so a reply here is a pointer:
 * tapping one opens that conversation. Showing the text without a way in would
 * strand it.
 */
export function NoteInsightsSheet({
  noteId,
  open,
  onOpenChange,
}: {
  noteId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("note");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("insightsTitle")}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="likes" className="px-4 pb-4">
          <TabsList
            variant="line"
            className="border-ig-separator mb-2 h-auto w-full justify-start gap-8 rounded-none border-b bg-transparent p-0"
          >
            {(["likes", "replies"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-ig-text-secondary data-active:text-ig-text data-active:border-b-ig-text flex-none rounded-none border-b-2 border-b-transparent py-3 text-sm font-semibold"
              >
                {t(tab)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="likes">
            {/* Both lists only fetch while the sheet is open — a note is tapped
                rarely, and its author is the only one who can read either. */}
            <LikesTab noteId={noteId} enabled={open} />
          </TabsContent>
          <TabsContent value="replies">
            <RepliesTab noteId={noteId} enabled={open} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function LikesTab({ noteId, enabled }: { noteId: number; enabled: boolean }) {
  const t = useTranslations("note");
  const format = useFormatter();
  const { data, isPending, isError, refetch } = useNoteLikes(noteId, enabled);

  const likes = flattenPages(data);

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (likes.length === 0) return <EmptyState title={t("noLikes")} className="py-10" />;

  return (
    <ul className="divide-ig-separator divide-y">
      {likes.map((like) => (
        <li key={like.user.id} className="flex items-center gap-3 py-3">
          <PersonLink user={like.user} />
          <time
            dateTime={like.likedAt}
            suppressHydrationWarning
            className="text-ig-text-secondary shrink-0 text-xs"
          >
            {format.relativeTime(new Date(like.likedAt))}
          </time>
        </li>
      ))}
    </ul>
  );
}

function RepliesTab({ noteId, enabled }: { noteId: number; enabled: boolean }) {
  const t = useTranslations("note");
  const format = useFormatter();
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNoteReplies(noteId, enabled);

  const replies = flattenPages(data);

  if (isPending) return <Loader className="py-10" />;
  if (isError) return <ErrorState onRetry={() => void refetch()} />;
  if (replies.length === 0) return <EmptyState title={t("noReplies")} className="py-10" />;

  return (
    <>
      <ul className="divide-ig-separator divide-y">
        {replies.map((reply) => (
          <li key={reply.id} className="flex items-start gap-3 py-3">
            <UserAvatar src={reply.author.avatarUrl} size={40} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-ig-text text-sm">
                <span className="font-semibold">{reply.author.userName}</span>{" "}
                <span className="text-ig-text-secondary">
                  <time dateTime={reply.createdAt} suppressHydrationWarning className="text-xs">
                    {format.relativeTime(new Date(reply.createdAt))}
                  </time>
                </span>
              </p>
              <p className="text-ig-text text-sm break-words">{reply.text}</p>
              {/* The reply is a message in a chat, but `NoteReplyItemDto` has no
                  chatId — so open the conversation by author instead.
                  `create-chat` is idempotent: it returns the existing one. */}
              <OpenChatLink userId={reply.author.id} />
            </div>
          </li>
        ))}
      </ul>

      {hasNextPage ? (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-ig-primary mt-3 text-sm font-semibold disabled:opacity-50"
        >
          {t("loadMore")}
        </button>
      ) : null}
    </>
  );
}

function OpenChatLink({ userId }: { userId: string }) {
  const t = useTranslations("note");
  const router = useRouter();
  const createChat = useCreateChat();

  return (
    <button
      type="button"
      disabled={createChat.isPending}
      onClick={() =>
        createChat.mutate(
          { receiverUserId: userId },
          { onSuccess: (chat) => router.push(ROUTES.chatById(chat.id)) },
        )
      }
      className="text-ig-primary text-xs font-semibold disabled:opacity-50"
    >
      {t("openChat")}
    </button>
  );
}

function PersonLink({ user }: { user: UserBriefDto }) {
  return (
    <Link href={ROUTES.profile(user.id)} className="flex min-w-0 flex-1 items-center gap-3">
      <UserAvatar src={user.avatarUrl} size={40} />
      <span className="min-w-0">
        <span className="text-ig-text flex items-center gap-1 text-sm font-semibold">
          <span className="truncate">{user.userName}</span>
          {user.isVerified ? <VerifiedBadge /> : null}
        </span>
        <span className="text-ig-text-secondary block truncate text-xs">{user.fullName}</span>
      </span>
    </Link>
  );
}

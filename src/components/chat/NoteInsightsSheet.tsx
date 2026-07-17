"use client";

import { Music } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { HeartIcon } from "@/components/icons";
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

/** Only the first few show inline — the rest are a tap away in the full sheet. */
const INLINE_LIKES = 3;

/**
 * The compact card real IG shows when you tap your own note bubble: avatar,
 * the note itself (and its music, if any), audience, who liked it, then
 * "write a new one" or delete. The fuller likes/replies breakdown
 * (NoteInsightsSheet below) is one tap deeper, behind "view all".
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
  const format = useFormatter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const remove = useDeleteNote();
  const { data: likesData } = useNoteLikes(note.id, open && note.likesCount > 0);
  const likes = flattenPages(likesData).slice(0, INLINE_LIKES);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[400px] gap-0 rounded-2xl p-6 text-center">
          <DialogTitle className="sr-only">{t("insightsTitle")}</DialogTitle>

          <span className="relative mx-auto inline-flex">
            <UserAvatar src={note.author.avatarUrl} size={140} />
            {note.likesCount > 0 ? (
              <span className="bg-ig-bg text-ig-text border-ig-border absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-xs font-semibold">
                {note.likesCount > 99 ? "99+" : note.likesCount}
              </span>
            ) : null}
          </span>

          {note.music ? (
            <p className="text-ig-text-secondary mt-3 flex items-center justify-center gap-1.5 text-sm">
              <Music className="size-3.5 shrink-0" />
              <span className="truncate">
                {note.music.title} · {note.music.artist}
              </span>
            </p>
          ) : null}

          <p className="text-ig-text mt-2 text-lg font-bold break-words">{note.text}</p>

          <p className="text-ig-text-secondary mt-2 text-sm">
            {note.audience === "FOLLOWERS"
              ? t("publishedForFollowers")
              : t("publishedForCloseFriends")}
            {" · "}
            <time dateTime={note.createdAt} suppressHydrationWarning>
              {format.relativeTime(new Date(note.createdAt))}
            </time>
          </p>

          {likes.length > 0 ? (
            <div className="mt-4 space-y-2 text-left">
              {likes.map((like) => (
                <div key={like.user.id} className="flex items-center gap-2">
                  <span className="relative shrink-0">
                    <UserAvatar src={like.user.avatarUrl} size={32} />
                    <span className="bg-ig-danger border-ig-bg absolute -bottom-0.5 -left-0.5 flex size-3.5 items-center justify-center rounded-full border">
                      <HeartIcon filled className="size-2 text-white" />
                    </span>
                  </span>
                  <span className="text-ig-text truncate text-sm">{like.user.userName}</span>
                </div>
              ))}

              {note.likesCount > likes.length ? (
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="text-ig-text-secondary text-sm"
                >
                  {t("viewAllLikes")}
                </button>
              ) : null}
            </div>
          ) : null}

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

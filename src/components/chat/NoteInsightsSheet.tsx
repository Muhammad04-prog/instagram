"use client";

import { Music } from "lucide-react";
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
import { noteTextColor } from "@/lib/note-colors";
import type { NoteDto, UserBriefDto } from "@/types/api.types";
import { flattenPages } from "@/lib/cursor";

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const remove = useDeleteNote();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[340px] gap-0 rounded-3xl border-none bg-[#262626] p-6 text-center text-white">
          <DialogTitle className="sr-only">{t("insightsTitle")}</DialogTitle>

          <div className="mt-8 flex flex-col items-center">
            <span className="relative mb-4">
              <div
                style={{
                  backgroundColor: note.bgColor || "#363636",
                  color: noteTextColor(note.bgColor) || "#fff",
                }}
                className="absolute -top-12 left-1/2 z-10 flex min-h-[48px] max-w-[200px] min-w-[60px] -translate-x-1/2 items-center justify-center rounded-3xl px-4 py-2 text-sm font-semibold shadow-md"
              >
                {note.text ? (
                  <span className="text-center text-base break-words whitespace-pre-wrap">
                    {note.text}
                  </span>
                ) : note.music ? (
                  <div className="flex flex-col items-center justify-center leading-tight">
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Music className="size-3.5 shrink-0" /> {note.music.title}
                    </span>
                    <span className="mt-0.5 text-xs opacity-75">{note.music.artist}</span>
                  </div>
                ) : null}
              </div>
              <span
                style={{ backgroundColor: note.bgColor || "#363636" }}
                className="absolute -top-2 left-1/2 z-10 size-3 -translate-x-[20px] rounded-full shadow-sm"
              />
              <span
                style={{ backgroundColor: note.bgColor || "#363636" }}
                className="absolute -top-5 left-1/2 z-10 size-2 -translate-x-[30px] rounded-full shadow-sm"
              />
              <UserAvatar src={note.author.avatarUrl} size={100} />
            </span>

            <span className="mt-2 text-lg font-semibold">{note.author.userName}</span>

            {note.music && note.text ? (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/70">
                <Music className="size-3.5 shrink-0" />
                <span className="truncate">
                  {note.music.title} · {note.music.artist}
                </span>
              </p>
            ) : null}

            <p className="mt-4 px-2 text-xs leading-snug text-white/50">
              {note.audience === "FOLLOWERS"
                ? t("publishedForFollowers")
                : t("publishedForCloseFriends")}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {/* Who liked / replied — author-only endpoints, one tap deeper. */}
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              {t("viewAllLikes")}
            </button>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onWriteNew();
              }}
              className="w-full rounded-xl bg-[#0095f6] py-3 text-sm font-semibold text-white hover:bg-[#1877f2]"
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
              className="w-full rounded-xl py-3 text-sm font-semibold text-[#ed4956] hover:bg-white/5 disabled:opacity-50"
            >
              {t("deleteNote")}
            </button>
          </div>
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

"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@/lib/axios";
import { CHAT_POLL_MS, MESSAGES_PAGE_SIZE, PAGE_SIZE } from "@/lib/constants";
import { cursorParams, nextCursor, pageItems, type Page } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { chatService, type SendMessageInput } from "@/services/chat.service";
import { useChatStore } from "@/store/chat.store";
import type {
  ChatListItemDto,
  CreateChatDto,
  CreateGroupChatDto,
  MessageDto,
} from "@/types/api.types";

/**
 * The chat list.
 *
 * `ChatListItemDto` carries `lastMessage`, `lastMessageAt`, `unreadCount` and
 * `isOnline` — so a row renders from the list alone. Phase 9 had to fetch every
 * chat's messages just to draw its preview, because softclub's list had none of
 * that (bugs #15–#17).
 */
export function useChats() {
  return useInfiniteQuery({
    queryKey: queryKeys.chats.list(),
    queryFn: ({ pageParam }) => chatService.getChats(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
    refetchInterval: CHAT_POLL_MS,
  });
}

/** The peer, theme, mute state and online status of one chat. */
export function useChat(chatId: number) {
  return useQuery({
    queryKey: queryKeys.chats.detail(chatId),
    queryFn: () => chatService.getChatById(chatId),
    enabled: Number.isFinite(chatId) && chatId > 0,
  });
}

/**
 * Messages of one chat, newest first, cursor-paginated.
 *
 * Still polling: this backend does have a socket, but wiring it is Phase 17.
 */
export function useChatMessages(chatId: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.chats.messages(chatId),
    queryFn: ({ pageParam }) =>
      chatService.getMessages(chatId, cursorParams(pageParam, MESSAGES_PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, MESSAGES_PAGE_SIZE),
    enabled: Number.isFinite(chatId) && chatId > 0,
    refetchInterval: CHAT_POLL_MS,
  });
}

/** Message requests — chats from people you do not follow (img22). */
export function useChatRequests() {
  return useInfiniteQuery({
    queryKey: queryKeys.chats.requests(),
    queryFn: ({ pageParam }) => chatService.getRequests(cursorParams(pageParam, PAGE_SIZE)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => nextCursor(lastPage, PAGE_SIZE),
  });
}

/**
 * Accept / decline a message request (img22).
 *
 * Accepting turns the request into an ordinary chat, so both the request queue
 * and the chat list move.
 */
export function useAnswerChatRequest() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      accept ? chatService.acceptRequest(id) : chatService.declineRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats.requests() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() });
    },
    onError: (error) => toast.error(toMessage(error)),
  });
}

/**
 * STUN/TURN config for the browser's `RTCPeerConnection`.
 *
 * Calling still rides PeerJS end-to-end (see `usePeerCall`) — feeding it the
 * backend's real TURN credentials is what actually gets two phones behind
 * different NATs to connect, instead of just Google's public STUN.
 */
export function useIceServers() {
  return useQuery({
    queryKey: queryKeys.chats.iceServers(),
    queryFn: () => chatService.getIceServers(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (dto: CreateChatDto) => chatService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** "Seen" — clears the unread badge for the whole chat. */
export function useMarkChatRead(chatId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatService.markRead(chatId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() }),
  });
}

/**
 * Best guess at the type the server will assign, so the optimistic bubble picks
 * the right renderer. The server decides for real; this only has to survive the
 * few hundred ms before its answer replaces the row.
 */
function optimisticType(input: SendMessageInput): MessageDto["type"] {
  if (input.stickerUrl) return "STICKER";
  if (input.sharedPostId !== undefined) return "POST_SHARE";
  if (!input.file) return "TEXT";
  if (input.file.type.startsWith("image/")) return "IMAGE";
  if (input.file.type.startsWith("video/")) return "VIDEO";
  if (input.file.type.startsWith("audio/")) return "AUDIO";
  return "TEXT";
}

/** Optimistic send: the bubble appears immediately and rolls back on failure. */
export function useSendMessage(chatId: number) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const clearDraft = useChatStore((s) => s.clearDraft);
  const t = useTranslations("errors");
  const key = queryKeys.chats.messages(chatId);

  return useMutation({
    mutationFn: (input: SendMessageInput) => chatService.send(chatId, input),

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<InfiniteData<Page<MessageDto> | MessageDto[]>>(key);

      const optimistic: MessageDto = {
        // Negative id marks a message the server has not confirmed yet.
        id: -Date.now(),
        chatId,
        senderId: user?.id ?? "",
        text: input.text ?? null,
        type: optimisticType(input),
        mediaUrl: null,
        replyToId: input.replyToId ?? null,
        sharedPostId: input.sharedPostId ?? null,
        reactions: [],
        isDeleted: false,
        isRead: false,
        vanishing: false,
        viewOnce: false,
        viewOnceOpened: false,
        sentAt: new Date().toISOString(),
      };

      // `chats/{id}/messages` answers with the `{ items, ... }` envelope, not a
      // bare array (see cursor.ts) — spreading `data.pages[0]` directly threw
      // "is not iterable" here, so the mutation never even reached the network.
      queryClient.setQueryData<InfiniteData<Page<MessageDto> | MessageDto[]>>(key, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page, i) => {
                if (i !== 0) return page;
                const items = [optimistic, ...pageItems(page)];
                return Array.isArray(page) ? items : { ...page, items };
              }),
            }
          : data,
      );

      clearDraft(chatId);
      return { previous };
    },

    onError: (error: ApiError, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message || t("network"));
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() });
    },
  });
}

/** Own message only, and only within 15 minutes — the server enforces both. */
export function useEditMessage(chatId: number) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");
  const key = queryKeys.chats.messages(chatId);

  return useMutation({
    mutationFn: ({ messageId, text }: { messageId: number; text: string }) =>
      chatService.editMessage(messageId, { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/**
 * Ownership is enforced server-side (OwnerGuard) — softclub let anyone delete
 * anyone's message and our only defence was hiding the menu (bug #15).
 */
export function useDeleteMessage(chatId: number) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");
  const key = queryKeys.chats.messages(chatId);

  return useMutation({
    mutationFn: (messageId: number) => chatService.deleteMessage(messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<InfiniteData<Page<MessageDto> | MessageDto[]>>(key);

      // `chats/{id}/messages` answers with the `{ items, ... }` envelope, not a
      // bare array (see cursor.ts) — filtering `page` directly threw here too.
      queryClient.setQueryData<InfiniteData<Page<MessageDto> | MessageDto[]>>(key, (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => {
                const items = pageItems(page).filter((m) => m.id !== messageId);
                return Array.isArray(page) ? items : { ...page, items };
              }),
            }
          : data,
      );

      return { previous };
    },
    onError: (error: ApiError, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message || t("network"));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/**
 * Theme / nickname / mute — three tiny PUTs that all change the same chat, so
 * they share one invalidation: the list row shows the mute bell and the window
 * paints the theme.
 */
function useChatSettings(chatId: number) {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.chats.detail(chatId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() });
  };
}

export function useSetChatTheme(chatId: number) {
  const settled = useChatSettings(chatId);
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (theme: string) => chatService.setTheme(chatId, { theme }),
    onSuccess: settled,
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** A nickname is per-chat and only I see it — the peer is never told. */
export function useSetChatNickname(chatId: number) {
  const settled = useChatSettings(chatId);
  const toMessage = useApiError();

  return useMutation({
    mutationFn: ({ userId, nickname }: { userId: string; nickname: string }) =>
      chatService.setNickname(chatId, { userId, nickname }),
    onSuccess: settled,
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useSetChatMuted(chatId: number) {
  const settled = useChatSettings(chatId);
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (muted: boolean) => chatService.setMuted(chatId, { muted }),
    onSuccess: settled,
    onError: (error) => toast.error(toMessage(error)),
  });
}

/**
 * React to a message / take the reaction back.
 *
 * One reaction per person: tapping the emoji you already left removes it, which
 * is why this takes the current state rather than an "add" flag.
 */
export function useToggleMessageReaction(chatId: number) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    // The two calls answer different shapes (OkDto vs MessageReactionDto) and
    // nothing here needs either — the list is refetched. So: await, discard.
    mutationFn: async ({ messageId, emoji }: { messageId: number; emoji: string | null }) => {
      if (emoji === null) await chatService.removeMessageReaction(messageId);
      else await chatService.reactToMessage(messageId, { emoji });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

export function useDeleteChat() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");
  const key = queryKeys.chats.list();

  return useMutation({
    mutationFn: (chatId: number) => chatService.remove(chatId),
    onMutate: async (chatId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<InfiniteData<ChatListItemDto[]>>(key);

      queryClient.setQueryData<InfiniteData<ChatListItemDto[]>>(key, (data) =>
        data
          ? { ...data, pages: data.pages.map((page) => page.filter((c) => c.id !== chatId)) }
          : data,
      );

      return { previous };
    },
    onError: (error: ApiError, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message || t("network"));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

/** Reports land in the admin panel; `reason` is a free string, not an enum. */
export function useReportChat(chatId: number) {
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (reason: string) => chatService.report(chatId, { reason }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/**
 * Deletes several of my own messages at once.
 *
 * The list is refetched rather than spliced: the server decides what actually
 * went (it refuses someone else's), so trusting our own selection could leave
 * a message on screen that is gone, or hide one that is not.
 */
export function useBulkDeleteMessages(chatId: number) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (messageIds: number[]) => chatService.bulkDeleteMessages({ messageIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() });
    },
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Not idempotent (unlike 1-on-1 `create`) — two groups with the same people are different groups. */
export function useCreateGroupChat() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (dto: CreateGroupChatDto) => chatService.createGroup(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Any participant may rename — same as IG. */
export function useUpdateGroupTitle(chatId: number) {
  const settled = useChatSettings(chatId);
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (title: string) => chatService.updateGroupTitle(chatId, { title }),
    onSuccess: settled,
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Any participant may add — same as IG. */
export function useAddParticipants(chatId: number) {
  const settled = useChatSettings(chatId);
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (userIds: string[]) => chatService.addParticipants(chatId, { userIds }),
    onSuccess: settled,
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Admin (creator) only — the server 403s anyone else. */
export function useRemoveParticipant(chatId: number) {
  const settled = useChatSettings(chatId);
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (userId: string) => chatService.removeParticipant(chatId, userId),
    onSuccess: settled,
    onError: (error) => toast.error(toMessage(error)),
  });
}

/**
 * Leaving is any participant's own move — unlike `useRemoveParticipant`, this
 * takes you out of the chat list entirely, so it invalidates the list rather
 * than the (now unreachable) detail.
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (chatId: number) => chatService.leaveGroup(chatId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() }),
    onError: (error) => toast.error(toMessage(error)),
  });
}

/**
 * ⚠️ No field on `ChatDetailDto`/`ChatListItemDto` says whether vanish mode is
 * currently on — same gap as 2FA's missing "is it enabled?" endpoint. The
 * caller can only track what *this visit* toggled, not read the true state on
 * open.
 */
export function useSetChatVanish(chatId: number) {
  const settled = useChatSettings(chatId);
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (enabled: boolean) => chatService.setVanish(chatId, { enabled }),
    onSuccess: settled,
    onError: (error) => toast.error(toMessage(error)),
  });
}

/** Fire when leaving the chat screen — burns any vanishing messages already seen. */
export function useCloseChat() {
  return useMutation({
    mutationFn: (chatId: number) => chatService.closeChat(chatId),
  });
}

/** The response carries the real media once; the message stays flagged `viewOnceOpened` after. */
export function useOpenViewOnceMessage(chatId: number) {
  const queryClient = useQueryClient();
  const toMessage = useApiError();

  return useMutation({
    mutationFn: (messageId: number) => chatService.openViewOnceMessage(messageId),
    onSuccess: (opened) => {
      queryClient.setQueryData<InfiniteData<Page<MessageDto> | MessageDto[]>>(
        queryKeys.chats.messages(chatId),
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => {
                  const items = pageItems(page).map((message) =>
                    message.id === opened.id ? opened : message,
                  );
                  return Array.isArray(page) ? items : { ...page, items };
                }),
              }
            : data,
      );
    },
    onError: (error) => toast.error(toMessage(error)),
  });
}

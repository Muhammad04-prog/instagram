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
import { cursorParams, nextCursor } from "@/lib/cursor";
import { queryKeys } from "@/lib/query-keys";
import { chatService, type SendMessageInput } from "@/services/chat.service";
import { useChatStore } from "@/store/chat.store";
import type { ChatListItemDto, CreateChatDto, MessageDto } from "@/types/api.types";

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
      const previous = queryClient.getQueryData<InfiniteData<MessageDto[]>>(key);

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
        sentAt: new Date().toISOString(),
      };

      queryClient.setQueryData<InfiniteData<MessageDto[]>>(key, (data) =>
        data
          ? { ...data, pages: [[optimistic, ...(data.pages[0] ?? [])], ...data.pages.slice(1)] }
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
      const previous = queryClient.getQueryData<InfiniteData<MessageDto[]>>(key);

      queryClient.setQueryData<InfiniteData<MessageDto[]>>(key, (data) =>
        data
          ? { ...data, pages: data.pages.map((page) => page.filter((m) => m.id !== messageId)) }
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

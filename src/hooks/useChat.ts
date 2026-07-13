"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { ApiError } from "@/lib/axios";
import { CHAT_POLL_MS } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import { chatService } from "@/services/chat.service";
import { useChatStore } from "@/store/chat.store";
import type { Chat, Message, SendMessageDto } from "@/types/chat.types";

export function useChats() {
  return useQuery({
    queryKey: queryKeys.chats.list(),
    queryFn: () => chatService.getChats(),
    refetchInterval: CHAT_POLL_MS,
  });
}

/**
 * Messages of one chat, newest first.
 *
 * The backend has no realtime hub (every `/chatHub/negotiate` guess answers 404),
 * so the open conversation polls. `poll: false` is used by the list rows, which
 * only need the last message and must not each open their own 5s timer.
 */
export function useChatMessages(chatId: number, poll = true) {
  return useQuery({
    queryKey: queryKeys.chats.detail(chatId),
    queryFn: () => chatService.getChatById(chatId),
    enabled: Number.isFinite(chatId) && chatId > 0,
    refetchInterval: poll ? CHAT_POLL_MS : false,
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (receiverUserId: string) => chatService.createChat(receiverUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() }),
    onError: (error: ApiError) => toast.error(error.message || t("network")),
  });
}

/** Optimistic send: the bubble appears immediately and rolls back on failure. */
export function useSendMessage(chatId: number) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const clearDraft = useChatStore((s) => s.clearDraft);
  const t = useTranslations("errors");
  const key = queryKeys.chats.detail(chatId);

  return useMutation({
    mutationFn: (dto: Omit<SendMessageDto, "chatId">) =>
      chatService.sendMessage({ ...dto, chatId }),

    onMutate: async (dto) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Message[]>(key);

      const optimistic: Message = {
        // Negative id marks a message the server has not confirmed yet.
        messageId: -Date.now(),
        chatId,
        userId: user?.userId ?? "",
        userName: user?.userName ?? null,
        userImage: null,
        messageText: dto.messageText ?? null,
        sendMassageDate: new Date().toISOString(),
        file: dto.file ? dto.file.name : null,
      };

      queryClient.setQueryData<Message[]>(key, (rows) => [optimistic, ...(rows ?? [])]);
      clearDraft(chatId);
      return { previous };
    },

    onError: (error: ApiError, _dto, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message || t("network"));
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() });
    },
  });
}

export function useDeleteMessage(chatId: number) {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");
  const key = queryKeys.chats.detail(chatId);

  return useMutation({
    mutationFn: (messageId: number) => chatService.deleteMessage(messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Message[]>(key);
      queryClient.setQueryData<Message[]>(key, (rows) =>
        rows?.filter((m) => m.messageId !== messageId),
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

export function useDeleteChat() {
  const queryClient = useQueryClient();
  const t = useTranslations("errors");

  return useMutation({
    mutationFn: (chatId: number) => chatService.deleteChat(chatId),
    onMutate: async (chatId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.chats.list() });
      const previous = queryClient.getQueryData<Chat[]>(queryKeys.chats.list());
      queryClient.setQueryData<Chat[]>(queryKeys.chats.list(), (rows) =>
        rows?.filter((c) => c.chatId !== chatId),
      );
      return { previous };
    },
    onError: (error: ApiError, _id, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.chats.list(), context.previous);
      toast.error(error.message || t("network"));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.chats.list() }),
  });
}

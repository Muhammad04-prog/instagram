export interface Message {
  messageId: number;
  chatId: number;
  userId: string;
  userName?: string;
  messageText: string | null;
  fileName: string | null;
  sendMessageDate: string;
  isRead?: boolean;
}

export interface Chat {
  chatId: number;
  userId: string;
  userName: string;
  userImage: string | null;
  lastMessage: string | null;
  lastMessageDate: string | null;
  messages?: Message[];
}

export interface SendMessageDto {
  chatId: number;
  messageText?: string;
  file?: File;
}

"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ReportChatDialog } from "@/components/chat/ReportChatDialog";
import { useSetChatMuted, useSetChatNickname, useSetChatTheme } from "@/hooks/useChat";
import { CHAT_THEMES } from "@/lib/chat-themes";
import { cn } from "@/lib/utils";
import { chatAvatar, chatLabel, type ChatDetailDto } from "@/types/chat.types";

/**
 * Chat details: theme, the peer's nickname, mute.
 *
 * All three are new — softclub's chat had six endpoints and none of this.
 *
 * The theme is a free string on the wire (max 30), so these presets only send a
 * name; see `lib/chat-themes.ts`.
 *
 * Nickname is a 1-on-1 affair — it renames *the peer*, and a group has none, so
 * that section is hidden for groups rather than shown pointing at nobody.
 */
export function ChatSettingsDialog({
  chat,
  open,
  onOpenChange,
}: {
  chat: ChatDetailDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("chat");
  // Bound once so the null check below still holds inside the submit handler.
  const peer = chat.peer;
  const setTheme = useSetChatTheme(chat.id);
  const setNickname = useSetChatNickname(chat.id);
  const setMuted = useSetChatMuted(chat.id);
  const [reportOpen, setReportOpen] = useState(false);

  const [nickname, setNicknameValue] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ig-elevated w-[420px] gap-0 overflow-hidden rounded-xl p-0">
        <div className="border-ig-separator border-b py-3 text-center">
          <DialogTitle className="text-ig-text text-base font-semibold">
            {t("chatDetails")}
          </DialogTitle>
        </div>

        <div className="space-y-6 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar src={chatAvatar(chat)} alt={chatLabel(chat)} size={44} />
            <span className="text-ig-text text-sm font-semibold">{chatLabel(chat)}</span>
          </div>

          <section className="space-y-3">
            <h3 className="text-ig-text text-sm font-semibold">{t("theme")}</h3>
            <ul className="flex gap-3">
              {CHAT_THEMES.map((theme) => (
                <li key={theme.id}>
                  <button
                    type="button"
                    aria-label={theme.id}
                    aria-pressed={chat.theme === theme.id}
                    onClick={() =>
                      setTheme.mutate(theme.id, { onSuccess: () => toast.success(t("themeSet")) })
                    }
                    className={cn(
                      "size-8 rounded-full",
                      theme.swatch,
                      chat.theme === theme.id && "ring-ig-text ring-2 ring-offset-2",
                    )}
                  />
                </li>
              ))}
            </ul>
          </section>

          {peer ? (
            <section className="space-y-2">
              <h3 className="text-ig-text text-sm font-semibold">{t("nickname")}</h3>
              {/* Only I see it — the peer is never told, so no confirm step. */}
              <p className="text-ig-text-secondary text-xs">{t("nicknameHint")}</p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setNickname.mutate(
                    { userId: peer.id, nickname: nickname.trim() },
                    {
                      onSuccess: () => {
                        toast.success(t("nicknameSet"));
                        setNicknameValue("");
                      },
                    },
                  );
                }}
                className="flex gap-2"
              >
                <Input
                  value={nickname}
                  onChange={(event) => setNicknameValue(event.target.value.slice(0, 30))}
                  placeholder={peer.userName}
                  aria-label={t("nickname")}
                  className="border-ig-border text-ig-text h-10 flex-1 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={!nickname.trim() || setNickname.isPending}
                  className="text-ig-primary text-sm font-semibold disabled:opacity-40"
                >
                  {t("save")}
                </button>
              </form>
            </section>
          ) : null}

          <label className="flex cursor-pointer items-center gap-4">
            <span className="min-w-0 flex-1">
              <span className="text-ig-text block text-sm font-semibold">{t("muteChat")}</span>
              <span className="text-ig-text-secondary block text-xs">{t("muteChatHint")}</span>
            </span>
            <Switch
              checked={chat.isMuted}
              disabled={setMuted.isPending}
              onCheckedChange={(muted) => setMuted.mutate(muted)}
            />
          </label>

          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="text-ig-danger border-ig-separator w-full border-t pt-4 text-left text-sm font-semibold"
          >
            {t("reportChat")}
          </button>
        </div>

        <ReportChatDialog chatId={chat.id} open={reportOpen} onOpenChange={setReportOpen} />
      </DialogContent>
    </Dialog>
  );
}

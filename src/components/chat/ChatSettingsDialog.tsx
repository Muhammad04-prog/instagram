"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserNameWithBadge } from "@/components/shared/VerifiedBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ReportChatDialog } from "@/components/chat/ReportChatDialog";
import { GroupParticipantPicker } from "@/components/chat/GroupParticipantPicker";
import {
  useAddParticipants,
  useLeaveGroup,
  useRemoveParticipant,
  useSetChatMuted,
  useSetChatNickname,
  useSetChatTheme,
  useSetChatVanish,
  useUpdateGroupTitle,
} from "@/hooks/useChat";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { CHAT_THEMES } from "@/lib/chat-themes";
import { cn } from "@/lib/utils";
import { chatAvatar, chatLabel, type ChatDetailDto } from "@/types/chat.types";
import type { ChatParticipantDto } from "@/types/api.types";

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
  const router = useRouter();
  // Bound once so the null check below still holds inside the submit handler.
  const peer = chat.peer;
  const setTheme = useSetChatTheme(chat.id);
  const setNickname = useSetChatNickname(chat.id);
  const setMuted = useSetChatMuted(chat.id);
  const setVanish = useSetChatVanish(chat.id);
  const updateTitle = useUpdateGroupTitle(chat.id);
  const addParticipants = useAddParticipants(chat.id);
  const removeParticipant = useRemoveParticipant(chat.id);
  const leaveGroup = useLeaveGroup();
  const [reportOpen, setReportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ChatParticipantDto | null>(null);

  const [nickname, setNicknameValue] = useState("");
  const [groupTitle, setGroupTitle] = useState(chat.title ?? "");
  // ⚠️ No field anywhere says whether vanish mode is already on (same gap as
  // 2FA's missing status) — this tracks only what *this visit* toggled.
  const [vanishOn, setVanishOn] = useState(false);

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

          {chat.isGroup ? (
            <section className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-ig-text text-sm font-semibold">{t("groupName")}</h3>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateTitle.mutate(groupTitle.trim(), {
                      onSuccess: () => toast.success(t("groupNameSaved")),
                    });
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={groupTitle}
                    onChange={(event) => setGroupTitle(event.target.value.slice(0, 50))}
                    aria-label={t("groupName")}
                    className="border-ig-border text-ig-text h-10 flex-1 rounded-lg"
                  />
                  <button
                    type="submit"
                    disabled={!groupTitle.trim() || updateTitle.isPending}
                    className="text-ig-primary text-sm font-semibold disabled:opacity-40"
                  >
                    {t("save")}
                  </button>
                </form>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-ig-text text-sm font-semibold">
                    {t("groupParticipants")} ({chat.participantsCount})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="text-ig-primary text-sm font-semibold"
                  >
                    {t("addParticipants")}
                  </button>
                </div>
                <ul className="max-h-48 space-y-1 overflow-y-auto">
                  {chat.participants.map((participant) => (
                    <li key={participant.id} className="flex items-center gap-3 py-1">
                      <UserAvatar
                        src={participant.avatarUrl ?? null}
                        alt={participant.userName}
                        size={36}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-ig-text truncate text-sm font-semibold">
                          <UserNameWithBadge
                            userName={participant.userName}
                            isVerified={participant.isVerified}
                          />
                        </p>
                        {participant.isAdmin ? (
                          <p className="text-ig-text-secondary text-xs">{t("youAdmin")}</p>
                        ) : null}
                      </div>
                      {chat.isAdmin && !participant.isAdmin ? (
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(participant)}
                          className="text-ig-danger shrink-0 text-xs font-semibold"
                        >
                          {t("removeParticipant")}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setLeaveConfirmOpen(true)}
                className="text-ig-danger text-sm font-semibold"
              >
                {t("leaveGroup")}
              </button>
            </section>
          ) : null}

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

          <label className="flex cursor-pointer items-center gap-4">
            <span className="min-w-0 flex-1">
              <span className="text-ig-text block text-sm font-semibold">{t("vanishMode")}</span>
              <span className="text-ig-text-secondary block text-xs">{t("vanishModeHint")}</span>
            </span>
            <Switch
              checked={vanishOn}
              disabled={setVanish.isPending}
              onCheckedChange={(enabled) =>
                setVanish.mutate(enabled, {
                  onSuccess: () => {
                    setVanishOn(enabled);
                    toast.success(enabled ? t("vanishModeOn") : t("vanishModeOff"));
                  },
                })
              }
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

        {chat.isGroup ? (
          <>
            <GroupParticipantPicker
              open={addOpen}
              onOpenChange={setAddOpen}
              exclude={chat.participants.map((participant) => participant.id)}
              onSubmit={(userIds) =>
                addParticipants.mutate(userIds, {
                  onSuccess: () => {
                    toast.success(t("participantsAdded"));
                    setAddOpen(false);
                  },
                })
              }
              pending={addParticipants.isPending}
            />

            <ConfirmDialog
              open={removeTarget !== null}
              onOpenChange={(next) => !next && setRemoveTarget(null)}
              title={t("removeParticipant")}
              description={
                removeTarget
                  ? t("removeParticipantConfirm", { userName: removeTarget.userName })
                  : ""
              }
              confirmLabel={t("removeParticipant")}
              onConfirm={() => {
                if (!removeTarget) return;
                removeParticipant.mutate(removeTarget.id, {
                  onSuccess: () => toast.success(t("participantRemoved")),
                });
                setRemoveTarget(null);
              }}
            />

            <ConfirmDialog
              open={leaveConfirmOpen}
              onOpenChange={setLeaveConfirmOpen}
              title={t("leaveGroup")}
              description={t("leaveGroupConfirm")}
              confirmLabel={t("leaveGroup")}
              onConfirm={() =>
                leaveGroup.mutate(chat.id, {
                  onSuccess: () => {
                    toast.success(t("leftGroup"));
                    onOpenChange(false);
                    router.push(ROUTES.chat);
                  },
                })
              }
            />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

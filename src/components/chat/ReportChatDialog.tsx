"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReportChat } from "@/hooks/useChat";

/**
 * Reporting a conversation. `reason` is a free string, not an enum — so these
 * presets are ours, and "Something else" hands the box over rather than forcing
 * a category that does not fit.
 *
 * Every report lands in the admin panel (Phase 20).
 */
const PRESETS = ["spam", "harassment", "nudity", "scam"] as const;

export function ReportChatDialog({
  chatId,
  open,
  onOpenChange,
}: {
  chatId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("chat");
  const [other, setOther] = useState("");
  const [showOther, setShowOther] = useState(false);
  const report = useReportChat(chatId);

  const send = (reason: string) => {
    report.mutate(reason, {
      onSuccess: () => {
        toast.success(t("reportSent"));
        onOpenChange(false);
        setShowOther(false);
        setOther("");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t("reportChat")}</DialogTitle>
        </DialogHeader>

        {showOther ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const reason = other.trim();
              if (reason) send(reason);
            }}
            className="space-y-4"
          >
            <textarea
              value={other}
              onChange={(event) => setOther(event.target.value)}
              placeholder={t("reportReasonPlaceholder")}
              aria-label={t("reportReasonPlaceholder")}
              maxLength={300}
              rows={3}
              autoFocus
              className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary w-full resize-none rounded-lg p-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!other.trim() || report.isPending}
              className="bg-ig-danger w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t("sendReport")}
            </button>
          </form>
        ) : (
          <ul className="divide-ig-separator divide-y">
            {PRESETS.map((preset) => (
              <li key={preset}>
                <button
                  type="button"
                  onClick={() => send(t(`reportReason_${preset}`))}
                  disabled={report.isPending}
                  className="text-ig-text w-full py-3 text-left text-sm disabled:opacity-50"
                >
                  {t(`reportReason_${preset}`)}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setShowOther(true)}
                className="text-ig-text w-full py-3 text-left text-sm"
              >
                {t("reportReason_other")}
              </button>
            </li>
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { DotsIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToggleBlock } from "@/hooks/useFollow";
import { useApiError } from "@/hooks/useApiError";
import { userService } from "@/services/user.service";
import { cn } from "@/lib/utils";

/** The "…" menu on someone else's profile: block / unblock and report. */
export function ProfileActionsMenu({
  userId,
  userName,
  isBlocked,
  className,
}: {
  userId: string;
  userName: string;
  isBlocked: boolean;
  className?: string;
}) {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const toMessage = useApiError();
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmReport, setConfirmReport] = useState(false);

  const block = useToggleBlock();

  // `reason` is free text (3–500 chars), not an enum — so send a real sentence,
  // localised, rather than a magic code the backend would just store verbatim.
  const report = useMutation({
    mutationFn: () => userService.report(userId, { reason: t("reportReasonDefault") }),
    onSuccess: () => toast.success(t("reportSent")),
    onError: (error) => toast.error(toMessage(error)),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={tCommon("more")}
            className={cn("text-ig-text", className)}
          >
            <DotsIcon className="size-6" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant={isBlocked ? "default" : "destructive"}
            onSelect={(event) => {
              event.preventDefault();
              setConfirmBlock(true);
            }}
          >
            {isBlocked ? t("unblock") : t("block")}
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setConfirmReport(true);
            }}
          >
            {t("report")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmBlock}
        onOpenChange={setConfirmBlock}
        title={isBlocked ? t("unblockConfirm", { userName }) : t("blockConfirm", { userName })}
        // Blocking is not symmetric: unblocking does NOT give the follows back.
        // The backend is explicit about it, so say so before, not after.
        description={isBlocked ? t("unblockWarning") : t("blockWarning")}
        confirmLabel={isBlocked ? t("unblock") : t("block")}
        onConfirm={() => block.mutate({ userId, block: !isBlocked })}
      />

      <ConfirmDialog
        open={confirmReport}
        onOpenChange={setConfirmReport}
        title={t("reportConfirm", { userName })}
        description={t("reportDescription")}
        confirmLabel={t("report")}
        onConfirm={() => report.mutate()}
      />
    </>
  );
}

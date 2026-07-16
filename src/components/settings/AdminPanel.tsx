"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader } from "@/components/shared/Loader";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminDeleteUser,
  useAdminReports,
  useAdminUsers,
  useResolveReport,
} from "@/hooks/useAdmin";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AdminReportDto, AdminUserDto } from "@/types/api.types";

/**
 * Admin: users and reports.
 *
 * The server guards these (ADMIN-only, 403 otherwise); the route hides the
 * screen from everyone else purely so nobody is shown a door that refuses them.
 *
 * Every "Report" button in the app — post, user, chat — surfaces here.
 */
export function AdminPanel() {
  const t = useTranslations("admin");

  return (
    <Tabs defaultValue="reports">
      {/* IG marks the active tab with a rule under it, not a filled block. */}
      <TabsList className="border-ig-separator mb-4 h-auto w-full justify-start gap-8 rounded-none border-b bg-transparent p-0">
        {(["reports", "users"] as const).map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="text-ig-text-secondary data-[state=active]:text-ig-text data-[state=active]:border-b-ig-text flex-none rounded-none border-x-0 border-t-0 border-b border-b-transparent bg-transparent py-3 text-sm font-semibold data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {t(tab)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="reports">
        <ReportsTab />
      </TabsContent>
      <TabsContent value="users">
        <UsersTab />
      </TabsContent>
    </Tabs>
  );
}

function ReportsTab() {
  const t = useTranslations("admin");
  const [filter, setFilter] = useState<"open" | "resolved">("open");

  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAdminReports(filter);
  const resolve = useResolveReport();

  const reports = data?.pages.flat() ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["open", "resolved"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              filter === value ? "bg-ig-text text-ig-bg" : "bg-ig-button-secondary text-ig-text",
            )}
          >
            {t(`filter_${value}`)}
          </button>
        ))}
      </div>

      {isPending ? (
        <Loader className="py-10" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : reports.length === 0 ? (
        <EmptyState title={t("noReports")} className="py-10" />
      ) : (
        <>
          <ul className="divide-ig-separator divide-y">
            {reports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onResolve={() =>
                  resolve.mutate(report.id, { onSuccess: () => toast.success(t("resolved")) })
                }
                pending={resolve.isPending}
              />
            ))}
          </ul>

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-ig-primary text-sm font-semibold disabled:opacity-50"
            >
              {t("loadMore")}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

function ReportRow({
  report,
  onResolve,
  pending,
}: {
  report: AdminReportDto;
  onResolve: () => void;
  pending: boolean;
}) {
  const t = useTranslations("admin");
  const format = useFormatter();

  // The report says what kind of thing it is about, so link where it makes
  // sense; a comment/chat target has no page of its own to open.
  const href =
    report.targetType === "POST"
      ? ROUTES.post(report.targetId)
      : report.targetType === "USER"
        ? ROUTES.profile(report.targetId)
        : null;

  return (
    <li className="flex items-start gap-3 py-3">
      <span className="bg-ig-button-secondary text-ig-text rounded px-2 py-0.5 text-[10px] font-semibold">
        {t(`target_${report.targetType}`)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-ig-text text-sm break-words">{report.reason}</p>
        <p className="text-ig-text-secondary mt-0.5 text-xs">
          {t("reportedBy", { userName: report.reporter.userName })} ·{" "}
          <time dateTime={report.createdAt} suppressHydrationWarning>
            {format.relativeTime(new Date(report.createdAt))}
          </time>
        </p>
        {href ? (
          <Link href={href} className="text-ig-primary text-xs font-semibold">
            {t("openTarget")}
          </Link>
        ) : null}
      </div>

      {report.resolvedAt ? (
        <span className="text-ig-text-secondary shrink-0 text-xs">{t("resolvedLabel")}</span>
      ) : (
        <button
          type="button"
          onClick={onResolve}
          disabled={pending}
          className="bg-ig-primary hover:bg-ig-primary-hover shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {t("resolve")}
        </button>
      )}
    </li>
  );
}

function UsersTab() {
  const t = useTranslations("admin");
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim(), SEARCH_DEBOUNCE_MS);

  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAdminUsers(debounced);
  const remove = useAdminDeleteUser(debounced);

  const users = data?.pages.flat() ?? [];

  return (
    <div className="space-y-4">
      <input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={t("searchUsers")}
        aria-label={t("searchUsers")}
        className="bg-ig-button-secondary text-ig-text placeholder:text-ig-text-secondary h-10 w-full rounded-lg px-4 text-sm outline-none"
      />

      {isPending ? (
        <Loader className="py-10" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : users.length === 0 ? (
        <EmptyState title={t("noUsers")} className="py-10" />
      ) : (
        <>
          <ul className="divide-ig-separator divide-y">
            {users.map((user) => (
              <UserRow key={user.id} user={user} onDelete={() => remove.mutate(user.id)} />
            ))}
          </ul>

          {hasNextPage ? (
            <button
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-ig-primary text-sm font-semibold disabled:opacity-50"
            >
              {t("loadMore")}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

function UserRow({ user, onDelete }: { user: AdminUserDto; onDelete: () => void }) {
  const t = useTranslations("admin");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <Link
          href={ROUTES.profile(user.id)}
          className="text-ig-text flex items-center gap-1 text-sm font-semibold"
        >
          <span className="truncate">{user.userName}</span>
          {user.isVerified ? <VerifiedBadge /> : null}
          {user.role === "ADMIN" ? (
            <span className="bg-ig-primary rounded px-1.5 text-[10px] font-semibold text-white">
              {t("roleAdmin")}
            </span>
          ) : null}
        </Link>
        <p className="text-ig-text-secondary truncate text-xs">{user.email}</p>
      </div>

      {/* Soft delete: the row stays with isDeleted, so it must read as deleted
          rather than disappear — otherwise the list looks broken. */}
      {user.isDeleted ? (
        <span className="text-ig-text-secondary shrink-0 text-xs">{t("deletedLabel")}</span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="text-ig-danger shrink-0 text-xs font-semibold"
        >
          {t("deleteUser")}
        </button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("deleteUserConfirm", { userName: user.userName })}
        description={t("deleteUserDescription")}
        confirmLabel={t("deleteUser")}
        onConfirm={onDelete}
      />
    </li>
  );
}

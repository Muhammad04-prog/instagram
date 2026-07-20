import { http } from "@/lib/axios";
import type { CursorParams } from "@/lib/cursor";
import type {
  JoinRequestDto,
  LiveCommentDto,
  LiveDto,
  LiveLikeResultDto,
  LiveOkDto,
  LiveStatsDto,
  LiveTokenDto,
  LiveViewerDto,
  StartLiveDto,
} from "@/types/api.types";

/**
 * Swagger tag: live (20 endpoints).
 *
 * Two halves that fail independently:
 *
 * - **State** — who is live, viewers, comments, hearts, join requests, stats.
 *   Plain REST, works today, and is what every screen here is built on.
 *   `getComments`/`getRequests` closed the two read-side gaps a 17.07.2026 note
 *   left here (comment stream, host's requests panel) — both fixed 19.07.2026.
 * - **Video** — carried by LiveKit, not by this API. `start`/`join`/`accept`
 *   hand back `{ token, wsUrl }` for a LiveKit room; playing it needs the
 *   LiveKit client SDK and a reachable server. The backend currently advertises
 *   `ws://localhost:7880`, which resolves to the *viewer's own machine* — so no
 *   stream can be played from here regardless of the SDK. Asked for a real host
 *   in `docs/BACKEND_REQUEST.md`; until then the screens show live state around
 *   a placeholder instead of faking a picture.
 *
 * Comments and hearts arrive by polling, not sockets: the socket has no auth
 * ticket we can use (token is httpOnly, cross-origin) and no documented events.
 */
export const liveService = {
  /** Host: opens a room and returns a publisher token. */
  start: (body: StartLiveDto) => http.post<LiveTokenDto>("/live/start", body),

  /** Active broadcasts from people you follow — the "Live" rail. */
  getFeed: () => http.get<LiveDto[]>("/live/feed"),

  /** A user's active broadcast, if any — the ring on their profile. */
  getByUser: (userId: string) => http.get<LiveDto | null>(`/live/user/${userId}`),

  getById: (id: string) => http.get<LiveDto>(`/live/${id}`),

  end: (id: string) => http.post<LiveStatsDto>(`/live/${id}/end`),

  /** Viewer: subscriber token. Refused if the host blocked you or is private. */
  join: (id: string) => http.post<LiveTokenDto>(`/live/${id}/join`),

  leave: (id: string) => http.post<LiveOkDto>(`/live/${id}/leave`),

  getViewers: (id: string) => http.get<LiveViewerDto[]>(`/live/${id}/viewers`),

  comment: (id: string, text: string) => http.post<LiveCommentDto>(`/live/${id}/comment`, { text }),

  /** Newest → oldest, everyone's — closed the "can only send" gap noted above. */
  getComments: (id: string, params: CursorParams) =>
    http.get<LiveCommentDto[]>(`/live/${id}/comments`, params),

  /** Deliberately repeatable — each tap is one floating heart. */
  like: (id: string) => http.post<LiveLikeResultDto>(`/live/${id}/like`),

  /** Any emoji, including compound ones (👨‍👩‍👧‍👦, 🏳️‍🌈, 👍🏽). */
  reaction: (id: string, emoji: string) => http.post<LiveOkDto>(`/live/${id}/reaction`, { emoji }),

  /** Viewer asks to come on screen; the host gets a notification. */
  requestJoin: (id: string) => http.post<JoinRequestDto>(`/live/${id}/request-join`),

  /** Host accepts → the guest is handed a publisher token (split screen). */
  acceptRequest: (requestId: number) => http.post<LiveOkDto>(`/live/requests/${requestId}/accept`),

  declineRequest: (requestId: number) =>
    http.post<LiveOkDto>(`/live/requests/${requestId}/decline`),

  /** Host-only — the id these answer. Defaults to none filtered (all statuses). */
  getRequests: (id: string, status?: "PENDING" | "ACCEPTED" | "DECLINED") =>
    http.get<JoinRequestDto[]>(`/live/${id}/requests`, status ? { status } : undefined),

  /** Video off shows the cover/avatar — audio keeps going either way. */
  setCamera: (id: string, on: boolean, coverUrl?: string) =>
    http.put<LiveOkDto>(`/live/${id}/camera`, coverUrl ? { on, coverUrl } : { on }),

  setAudio: (id: string, on: boolean) => http.put<LiveOkDto>(`/live/${id}/audio`, { on }),

  /** Host only. */
  kick: (id: string, userId: string) => http.post<LiveOkDto>(`/live/${id}/kick/${userId}`),

  getStats: (id: string) => http.get<LiveStatsDto>(`/live/${id}/stats`),
};

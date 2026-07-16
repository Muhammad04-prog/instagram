/**
 * Real backend origin — used only on the server (Route Handlers).
 *
 * NestJS + Prisma + PostgreSQL. Every route lives under /api, so this value
 * already includes the prefix; services pass bare resource paths ("posts/feed").
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://backend-instagram-kvv4.onrender.com/api";

/**
 * What the browser talks to. Every call is proxied through our Route Handler so
 * the JWT stays in the httpOnly cookie and never touches client-side JS.
 */
export const PROXY_BASE_URL = "/api/proxy";

/** Canonical origin, used by robots.ts / sitemap.ts / OG images. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Auth is a token *pair*. Both cookies are httpOnly — the browser never sees
 * either. The access token is short-lived; when the backend rejects it with 401
 * the proxy silently spends the refresh token and replays the request.
 */
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

/** Lists are cursor-paginated (`?cursor=&limit=`), never page numbers. */
export const PAGE_SIZE = 12;
export const FEED_PAGE_SIZE = 5;
export const EXPLORE_PAGE_SIZE = 24;
export const REELS_PAGE_SIZE = 5;
export const SEARCH_DEBOUNCE_MS = 400;
export const SEARCH_PAGE_SIZE = 10;
export const COMMENTS_PAGE_SIZE = 20;
export const MESSAGES_PAGE_SIZE = 30;
export const NOTIFICATIONS_PAGE_SIZE = 20;

/** "Resend code" cooldown — the backend rejects a second code within a minute. */
export const RESEND_CODE_COOLDOWN_S = 60;

/**
 * The unread badge polls. The backend has a socket, but wiring it is Phase 17;
 * until then a small count every 30s is honest and cheap.
 */
export const UNREAD_POLL_MS = 30_000;

/**
 * Chat still polls. This backend does have a socket (it signals calls and live
 * rooms), but wiring it is Phase 17 — until then the Phase 9 poll stands.
 */
export const CHAT_POLL_MS = 5000;

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  reels: "/reels",
  explore: "/explore",
  chat: "/chat",
  chatById: (chatId: number | string) => `/chat/${chatId}`,
  chatRequests: "/chat/requests",
  createPost: "/post/create",
  post: (postId: number | string) => `/post/${postId}`,
  stories: (userId: string) => `/stories/${userId}`,
  hashtag: (name: string) => `/explore/tags/${encodeURIComponent(name)}`,
  location: (id: number) => `/explore/locations/${id}`,
  /**
   * @mention target. There is no username→id endpoint and profile routes need
   * the uuid, so this page resolves the name and forwards to /profile/{id}.
   */
  userByName: (userName: string) => `/u/${encodeURIComponent(userName)}`,
  myProfile: "/profile/me",
  profile: (userId: string) => `/profile/${userId}`,
  editProfile: "/profile/edit",
  favorites: "/profile/favorites",
  activity: "/profile/activity",
  storyArchive: "/stories/archive",
  settings: "/settings",
  changePassword: "/settings/change-password",
  privacy: "/settings/privacy",
  closeFriends: "/settings/close-friends",
  locations: "/settings/locations",
  deleteAccount: "/settings/delete-account",
} as const;

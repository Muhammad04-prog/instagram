/** Real backend origin — used only on the server (Route Handlers). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://instagram-api.softclub.tj";

/**
 * What the browser talks to. Every call is proxied through our Route Handler so
 * the JWT stays in the httpOnly cookie and never touches client-side JS.
 */
export const PROXY_BASE_URL = "/api/proxy";

/** Backend serves uploaded files from /images/{fileName}. */
export const IMAGE_BASE = `${API_URL}/images`;

export const ACCESS_TOKEN_COOKIE = "access_token";

export const PAGE_SIZE = 12;
export const FEED_PAGE_SIZE = 5;
export const EXPLORE_PAGE_SIZE = 24;
export const REELS_PAGE_SIZE = 5;
export const SEARCH_DEBOUNCE_MS = 400;

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  reels: "/reels",
  explore: "/explore",
  chat: "/chat",
  createPost: "/post/create",
  post: (postId: number | string) => `/post/${postId}`,
  stories: (userId: string) => `/stories/${userId}`,
  myProfile: "/profile/me",
  profile: (userId: string) => `/profile/${userId}`,
  editProfile: "/profile/edit",
  favorites: "/profile/favorites",
  settings: "/settings",
  changePassword: "/settings/change-password",
} as const;

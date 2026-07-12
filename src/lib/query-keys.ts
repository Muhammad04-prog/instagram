import type { GetLocationsParams } from "@/types/location.types";
import type { GetFollowingPostsParams, GetPostsParams } from "@/types/post.types";
import type { GetUsersParams } from "@/types/user.types";

/** Single source of truth for TanStack Query cache keys. */
export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: (params: GetPostsParams) => [...queryKeys.posts.all, "list", params] as const,
    feed: (params: GetFollowingPostsParams) => [...queryKeys.posts.all, "feed", params] as const,
    reels: () => [...queryKeys.posts.all, "reels"] as const,
    byUser: (userId: string) => [...queryKeys.posts.all, "by-user", userId] as const,
    mine: () => [...queryKeys.posts.all, "mine"] as const,
    detail: (postId: number) => [...queryKeys.posts.all, "detail", postId] as const,
  },
  stories: {
    all: ["stories"] as const,
    list: () => [...queryKeys.stories.all, "list"] as const,
    byUser: (userId: string) => [...queryKeys.stories.all, "user", userId] as const,
    mine: () => [...queryKeys.stories.all, "mine"] as const,
    detail: (id: number) => [...queryKeys.stories.all, "detail", id] as const,
  },
  chats: {
    all: ["chats"] as const,
    list: () => [...queryKeys.chats.all, "list"] as const,
    detail: (chatId: number) => [...queryKeys.chats.all, "detail", chatId] as const,
  },
  follow: {
    all: ["follow"] as const,
    subscribers: (userId: string) => [...queryKeys.follow.all, "subscribers", userId] as const,
    subscriptions: (userId: string) => [...queryKeys.follow.all, "subscriptions", userId] as const,
    isFollowing: (userId: string) => [...queryKeys.follow.all, "is-following", userId] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: GetUsersParams) => [...queryKeys.users.all, "list", params] as const,
    searchHistories: () => [...queryKeys.users.all, "search-histories"] as const,
    userSearchHistories: () => [...queryKeys.users.all, "user-search-histories"] as const,
  },
  profile: {
    all: ["profile"] as const,
    me: () => [...queryKeys.profile.all, "me"] as const,
    byId: (userId: string) => [...queryKeys.profile.all, "by-id", userId] as const,
    favorites: () => [...queryKeys.profile.all, "favorites"] as const,
  },
  locations: {
    all: ["locations"] as const,
    list: (params: GetLocationsParams) => [...queryKeys.locations.all, "list", params] as const,
    detail: (id: number) => [...queryKeys.locations.all, "detail", id] as const,
  },
} as const;

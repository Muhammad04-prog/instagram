"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import { postService } from "@/services/post.service";

/** A user's grid. A short page means the end — the API's paging envelope is unwrapped away. */
export function useUserPosts(userId: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.byUser(userId),
    queryFn: ({ pageParam }) =>
      postService.getPosts({ userId, pageNumber: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,
    enabled: enabled && Boolean(userId),
  });
}

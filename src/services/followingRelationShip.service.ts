import { http } from "@/lib/axios";
import type { FollowRelation } from "@/types/profile.types";

/**
 * Swagger tag: FollowingRelationShip (4 endpoints).
 *
 * ⚠️ add/delete answer `{ data: false, errors: ["success followed"], statusCode: 200 }`
 * — `data` is meaningless here, only the status code says whether it worked
 * (lib/axios only throws on statusCode >= 400, so a resolved promise = success).
 */
export const followService = {
  getSubscribers: (userId: string) =>
    http.get<FollowRelation[]>("/FollowingRelationShip/get-subscribers", { UserId: userId }),

  getSubscriptions: (userId: string) =>
    http.get<FollowRelation[]>("/FollowingRelationShip/get-subscriptions", { UserId: userId }),

  follow: (followingUserId: string) =>
    http.post<boolean>("/FollowingRelationShip/add-following-relation-ship", undefined, {
      followingUserId,
    }),

  unfollow: (followingUserId: string) =>
    http.delete<boolean>("/FollowingRelationShip/delete-following-relation-ship", {
      followingUserId,
    }),
};

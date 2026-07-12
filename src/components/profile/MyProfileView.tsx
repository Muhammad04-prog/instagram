"use client";

import { ProfileHeaderSkeleton } from "@/components/profile/ProfileSkeleton";
import { ProfileView } from "@/components/profile/ProfileView";
import { useAuth } from "@/hooks/useAuth";

/**
 * `get-my-profile` returns no id, so the id needed for the post grid and the
 * followers list comes from the JWT claims exposed by the session route.
 */
export function MyProfileView() {
  const { user, isReady } = useAuth();

  if (!isReady || !user) return <ProfileHeaderSkeleton />;

  return <ProfileView userId={user.userId} isMe />;
}

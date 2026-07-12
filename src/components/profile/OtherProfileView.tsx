"use client";

import { ProfileView } from "@/components/profile/ProfileView";
import { useAuth } from "@/hooks/useAuth";

/** Landing on your own id via /profile/{id} must render the owner's view. */
export function OtherProfileView({ userId }: { userId: string }) {
  const { user } = useAuth();

  return <ProfileView userId={userId} isMe={user?.userId === userId} />;
}

import { setRequestLocale } from "next-intl/server";
import { PostModal } from "@/components/post/PostModal";

/**
 * Intercepting route: opening a post from the feed or a grid lays it over the
 * page as a modal (docs/screenshots/img12); a hard reload of the same URL hits
 * the real page instead.
 */
export default async function InterceptedPostPage({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>;
}) {
  const { locale, postId } = await params;
  setRequestLocale(locale);

  return <PostModal postId={Number(postId)} />;
}

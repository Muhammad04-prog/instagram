import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PostModal } from "@/components/post/PostModal";

/**
 * Intercepting route: opening a post from the feed or a grid lays it over the
 * page as a modal (docs/screenshots/img12); a hard reload of the same URL hits
 * the real page instead.
 *
 * Non-numeric ids are rejected outright. `/post/create` has its own static
 * intercept that outranks this one, but any other word segment added under
 * /post later would otherwise land here as `Number(word)` → NaN and render a
 * modal that loads forever — which is exactly the bug `create` caused.
 */
export default async function InterceptedPostPage({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>;
}) {
  const { locale, postId } = await params;
  setRequestLocale(locale);

  const id = Number(postId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  return <PostModal postId={id} />;
}

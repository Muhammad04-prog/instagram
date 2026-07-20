import { setRequestLocale } from "next-intl/server";
import { CreatePostModal } from "@/components/post/CreatePostModal";

/**
 * 🐞 This route exists to *stop* `(.)post/[postId]` swallowing `/post/create`.
 *
 * The dynamic intercept matched it with `postId: "create"`, so clicking
 * «Создать» opened the post modal on `Number("create")` — NaN — which never
 * resolves to a post and left a black, permanently-loading dialog with no way
 * to publish anything. A static segment outranks a dynamic sibling, so this
 * claims the URL first.
 *
 * It is also what IG does: «Создать» is a modal over the feed, not a page
 * navigation. A hard reload of /post/create still lands on the full page.
 */
export default async function InterceptedCreatePostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CreatePostModal />;
}

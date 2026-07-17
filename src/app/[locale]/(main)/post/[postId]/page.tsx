import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/post/PostDetail";
import { serverGet } from "@/lib/server-api";
import type { PostDto } from "@/types/post.types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const post = await serverGet<PostDto>("/Post/get-post-by-id", { id: postId });

  if (!post) return { title: "Post" };

  // The root layout's template already appends "• Instagram".
  const caption = post.caption?.trim();
  return {
    title: post.author.userName ?? "Post",
    description: caption || undefined,
  };
}

/** Full page — the same view the intercepted modal shows, framed by a card. */
export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; postId: string }>;
}) {
  const { locale, postId } = await params;
  setRequestLocale(locale);

  const id = Number(postId);
  if (!Number.isInteger(id)) notFound();

  return (
    <div className="mx-auto max-w-[935px] px-4 py-6 md:px-8">
      <div className="border-ig-border bg-ig-bg overflow-hidden rounded-sm border">
        <PostDetail postId={id} />
      </div>
    </div>
  );
}

import { setRequestLocale } from "next-intl/server";
import { CreatePost } from "@/components/post/CreatePost";

export default async function CreatePostPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CreatePost />;
}

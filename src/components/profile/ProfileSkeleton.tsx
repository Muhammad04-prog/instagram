import { PostGridSkeleton } from "@/components/profile/PostGrid";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the real header's geometry so nothing shifts when the data lands. */
export function ProfileHeaderSkeleton() {
  return (
    <div className="pt-4 pb-8 md:pt-8">
      <div className="flex gap-6 md:gap-8">
        <div className="flex shrink-0 justify-center md:w-[290px]">
          <Skeleton className="size-[77px] rounded-full md:size-[150px]" />
        </div>
        <div className="flex-1 space-y-4 pt-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
          <div className="hidden gap-10 md:flex">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="hidden h-4 w-64 md:block" />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>

      <div className="border-ig-separator mt-8 border-t pt-4">
        <PostGridSkeleton />
      </div>
    </div>
  );
}

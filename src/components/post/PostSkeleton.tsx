import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="border-ig-separator border-b pb-4">
      <div className="flex items-center gap-3 py-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="aspect-square w-full rounded-sm" />
      <div className="space-y-2 pt-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="flex flex-col md:flex-row">
      <Skeleton className="aspect-square w-full md:w-[60%]" />
      <div className="flex-1 space-y-4 p-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

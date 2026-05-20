"use client";

import { Skeleton } from "@/components/ui";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { memo } from "react";

const SKELETON_COUNT = 4;

function FeedSkeletonCard({ height }: { height: number }) {
  return (
    <div
      className="relative w-full shrink-0 snap-start snap-always overflow-hidden bg-black"
      style={{ height }}
    >
      <Skeleton className="absolute inset-0 rounded-none bg-zinc-900/90" />

      <div className="absolute bottom-28 left-4 right-20 space-y-2.5">
        <Skeleton className="h-3.5 w-28" rounded="md" />
        <Skeleton className="h-3 w-44" rounded="md" />
        <Skeleton className="h-3 w-36" rounded="md" />
      </div>

      <div className="absolute bottom-32 right-3 flex flex-col gap-4">
        <Skeleton className="h-11 w-11" rounded="full" />
        <Skeleton className="h-11 w-11" rounded="full" />
        <Skeleton className="h-11 w-11" rounded="full" />
      </div>
    </div>
  );
}

function FeedSkeletonInner() {
  const itemHeight = useViewportHeight();

  return (
    <div
      className="h-dvh w-full snap-y snap-mandatory overflow-y-auto bg-black"
      aria-busy
      aria-label="Loading feed"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <FeedSkeletonCard key={i} height={itemHeight} />
      ))}
    </div>
  );
}

export const FeedSkeleton = memo(FeedSkeletonInner);

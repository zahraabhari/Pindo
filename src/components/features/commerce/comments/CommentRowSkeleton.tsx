"use client";

import { Skeleton } from "@/components/ui";
import { memo } from "react";

function CommentRowSkeletonInner() {
  return (
    <li className="flex gap-2 px-3 py-1">
      <Skeleton className="mt-0.5 h-8 w-8 shrink-0" rounded="full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
        <Skeleton className="h-2.5 w-24" rounded="md" />
        <Skeleton className="h-2.5 w-full max-w-[220px]" rounded="md" />
      </div>
    </li>
  );
}

export const CommentRowSkeleton = memo(CommentRowSkeletonInner);

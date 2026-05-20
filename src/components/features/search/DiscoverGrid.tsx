"use client";

import { DiscoverCard } from "@/components/features/search/DiscoverCard";
import { Skeleton } from "@/components/ui";
import { useMasonryScroll } from "@/services/search/search.hooks";
import {
  appendPaginationSkeletons,
  isPaginationSkeletonItem,
} from "@/services/search/search.pagination";
import type { DiscoveryItem } from "@/types/discovery";
import { memo, useEffect, useMemo, useRef } from "react";


interface DiscoverGridProps {
  items: DiscoveryItem[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  columnWidth: number;
  onOpenItem?: (item: DiscoveryItem) => void;
  className?: string;
}

function DiscoverGridInner({
  items,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  columnWidth,
  onOpenItem,
  className,
}: DiscoverGridProps) {
  const layoutItems = useMemo(
    () =>
      appendPaginationSkeletons(
        items,
        columnWidth,
        isFetchingNextPage && hasNextPage,
      ),
    [items, columnWidth, isFetchingNextPage, hasNextPage],
  );

  const loadMoreLock = useRef(false);

  useEffect(() => {
    if (!isFetchingNextPage) loadMoreLock.current = false;
  }, [isFetchingNextPage]);

  const { scrollRef, onScroll, visible, totalHeight, containerWidth } =
    useMasonryScroll(layoutItems, columnWidth, () => {
      if (
        !hasNextPage ||
        isFetchingNextPage ||
        loadMoreLock.current
      ) {
        return;
      }
      loadMoreLock.current = true;
      onLoadMore();
    });

  return (
    <div
      ref={scrollRef}
      className={`h-full overflow-y-auto overflow-x-hidden ${className ?? ""}`}
      onScroll={onScroll}
      aria-busy={isFetchingNextPage}
    >
      <div
        className="relative mx-auto px-2 pt-1"
        style={{ height: totalHeight, width: containerWidth }}
      >
        {visible.map((p) => (
          <div
            key={`${p.item.id}:${p.top}:${p.left}`}
            className="absolute"
            style={{
              top: p.top,
              left: p.left,
              width: columnWidth,
              height: p.height,
            }}
          >
            {isPaginationSkeletonItem(p.item) ? (
              <Skeleton className="h-full w-full" rounded="xl" aria-hidden />
            ) : (
              <DiscoverCard item={p.item} width={columnWidth} onOpen={onOpenItem} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const DiscoverGrid = memo(DiscoverGridInner);

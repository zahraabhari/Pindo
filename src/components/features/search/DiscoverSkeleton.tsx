"use client";

import { Skeleton } from "@/components/ui";
import { useDiscoverColumnWidth } from "@/services/search/search.hooks";
import { layoutMasonryItems } from "@/services/search/search.layout";
import type { DiscoveryItem } from "@/types/discovery";
import { memo, useMemo } from "react";

const SKELETON_ASPECTS = [
  1.1, 0.75, 1.35, 0.9, 1.2, 0.8, 1.4, 0.7, 1.15, 0.85, 1.25, 0.95, 1.05,
  0.78, 1.3, 0.88,
];

function buildSkeletonItems(): DiscoveryItem[] {
  const width = 400;
  return SKELETON_ASPECTS.map((aspectRatio, i) => {
    const height = Math.round(width * aspectRatio);
    return {
      id: `skeleton-${i}`,
      type: "image" as const,
      title: "",
      thumbnail: "",
      width,
      height,
      aspectRatio,
    };
  });
}

function DiscoverSkeletonInner() {
  const columnWidth = useDiscoverColumnWidth();
  const placed = useMemo(() => {
    const { placed: items } = layoutMasonryItems(
      buildSkeletonItems(),
      columnWidth,
    );
    return items;
  }, [columnWidth]);

  const totalHeight = useMemo(() => {
    if (placed.length === 0) return 0;
    return Math.max(...placed.map((p) => p.top + p.height));
  }, [placed]);

  const containerWidth = columnWidth * 2 + 8;

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden"
      aria-busy
      aria-label="Loading discover"
    >
      <div
        className="relative mx-auto px-2 pt-1"
        style={{ height: totalHeight, width: containerWidth }}
      >
        {placed.map((p) => (
          <Skeleton
            key={p.item.id}
            rounded="xl"
            className="absolute"
            style={{
              top: p.top,
              left: p.left,
              width: columnWidth,
              height: p.height,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const DiscoverSkeleton = memo(DiscoverSkeletonInner);

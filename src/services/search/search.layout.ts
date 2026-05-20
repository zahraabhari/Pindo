import type { DiscoveryItem } from "@/types/discovery";

export const MASONRY_GAP = 8;

export interface MasonryPlacedItem {
  item: DiscoveryItem;
  column: 0 | 1;
  top: number;
  left: number;
  height: number;
}

export function estimateItemHeight(
  item: DiscoveryItem,
  columnWidth: number,
): number {
  return Math.round(columnWidth * item.aspectRatio);
}

/**
 * Shortest-column masonry — independent stacks, no row-pair gaps.
 */
export function layoutMasonryItems(
  items: DiscoveryItem[],
  columnWidth: number,
  gap = MASONRY_GAP,
): {
  placed: MasonryPlacedItem[];
  totalHeight: number;
  containerWidth: number;
} {
  let leftTop = 0;
  let rightTop = 0;
  const placed: MasonryPlacedItem[] = [];

  for (const item of items) {
    const height = estimateItemHeight(item, columnWidth);

    if (leftTop <= rightTop) {
      placed.push({
        item,
        column: 0,
        top: leftTop,
        left: 0,
        height,
      });
      leftTop += height + gap;
    } else {
      placed.push({
        item,
        column: 1,
        top: rightTop,
        left: columnWidth + gap,
        height,
      });
      rightTop += height + gap;
    }
  }

  return {
    placed,
    totalHeight: Math.max(leftTop, rightTop, 0),
    containerWidth: columnWidth * 2 + gap,
  };
}

export function getVisiblePlacedItems(
  placed: MasonryPlacedItem[],
  scrollTop: number,
  viewportHeight: number,
  overscan = 500,
): MasonryPlacedItem[] {
  const minY = scrollTop - overscan;
  const maxY = scrollTop + viewportHeight + overscan;

  return placed.filter(
    (p) => p.top + p.height >= minY && p.top <= maxY,
  );
}

import { layoutMasonryItems } from "@/services/search/search.layout";
import type { DiscoveryItem } from "@/types/discovery";

const SKELETON_ASPECTS = [
  1.15, 0.82, 1.28, 0.9, 1.2, 0.75, 1.35, 0.88, 1.05, 0.95, 1.22, 0.8,
];

const SKELETON_ID_PREFIX = "pagination-skeleton-";

export function isPaginationSkeletonItem(item: DiscoveryItem): boolean {
  return item.id.startsWith(SKELETON_ID_PREFIX);
}

function makeSkeletonItem(index: number, aspectRatio: number): DiscoveryItem {
  const width = 400;
  const height = Math.round(width * aspectRatio);
  return {
    id: `${SKELETON_ID_PREFIX}${index}`,
    type: "image",
    title: "",
    thumbnail: "",
    width,
    height,
    aspectRatio,
  };
}

function skeletonCountForGap(
  items: DiscoveryItem[],
  columnWidth: number,
): number {
  const { placed } = layoutMasonryItems(items, columnWidth);
  let leftBottom = 0;
  let rightBottom = 0;

  for (const p of placed) {
    const bottom = p.top + p.height;
    if (p.column === 0) leftBottom = Math.max(leftBottom, bottom);
    else rightBottom = Math.max(rightBottom, bottom);
  }

  const gap = Math.abs(leftBottom - rightBottom);
  const avgTile = columnWidth * 1.05;
  return Math.min(
    12,
    Math.max(4, Math.ceil((gap + avgTile * 2) / avgTile)),
  );
}

export function appendPaginationSkeletons(
  items: DiscoveryItem[],
  columnWidth: number,
  enabled: boolean,
): DiscoveryItem[] {
  if (!enabled || items.length === 0) return items;

  const count = skeletonCountForGap(items, columnWidth);
  const skeletons = Array.from({ length: count }, (_, i) =>
    makeSkeletonItem(i, SKELETON_ASPECTS[i % SKELETON_ASPECTS.length]!),
  );

  return [...items, ...skeletons];
}

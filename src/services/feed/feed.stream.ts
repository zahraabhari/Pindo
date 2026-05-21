import type { FeedSlice, FeedVideo } from "@/types/feed";

/** One ordered stream — dedupe by id, first occurrence wins */
export function dedupeFeedVideos(videos: FeedVideo[]): FeedVideo[] {
  const seen = new Set<string>();
  const out: FeedVideo[] = [];

  for (const video of videos) {
    if (seen.has(video.id)) continue;
    seen.add(video.id);
    out.push(video);
  }

  return out;
}

/** Flatten infinite-query segments into a single continuous list */
export function flattenFeedSlices(slices: FeedSlice[]): FeedVideo[] {
  return dedupeFeedVideos(slices.flatMap((slice) => slice.items));
}

/**
 * Merge refreshed head into existing stream (Instagram/TikTok pattern).
 * New head items prepended; tail keeps scroll depth; stable id dedup.
 */
export function mergeFeedHead(
  existing: FeedVideo[],
  headItems: FeedVideo[],
): FeedVideo[] {
  if (headItems.length === 0) return existing;
  if (existing.length === 0) return dedupeFeedVideos(headItems);

  const headIds = new Set(headItems.map((v) => v.id));
  const tail = existing.filter((v) => !headIds.has(v.id));

  return dedupeFeedVideos([...headItems, ...tail]);
}

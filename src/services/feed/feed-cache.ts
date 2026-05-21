import { fetchFeedHead } from "@/services/feed/feed.api";
import { FEED_QUERY_KEY, FEED_SEARCH_QUERY } from "@/services/feed/feed.keys";
import { flattenFeedSlices } from "@/services/feed/feed.stream";
import type { FeedSlice, FeedVideo } from "@/types/feed";
import {
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

/**
 * Apply head refresh without resetting pagination cursors or tail segments.
 * New head batch replaces slice 0; duplicates stripped from deeper segments.
 */
export function applyHeadRefreshToInfiniteData(
  old: InfiniteData<FeedSlice>,
  head: FeedSlice,
): InfiniteData<FeedSlice> {
  const headIds = new Set(head.items.map((v) => v.id));

  const strippedTail = old.pages.map((slice) => ({
    ...slice,
    items: slice.items.filter((v) => !headIds.has(v.id)),
  }));

  const first = old.pages[0];
  const refreshedFirst: FeedSlice = {
    items: head.items,
    nextCursor: first?.nextCursor ?? null,
    hasMore: first?.hasMore ?? false,
    source: head.source,
    upstream: head.upstream,
    searchQuery: head.searchQuery ?? FEED_SEARCH_QUERY,
  };

  return {
    pages: [refreshedFirst, ...strippedTail.slice(1)],
    pageParams: old.pageParams,
  };
}

export async function refreshFeedStreamHead(
  queryClient: QueryClient,
): Promise<void> {
  const head = await fetchFeedHead(FEED_SEARCH_QUERY);

  queryClient.setQueryData<InfiniteData<FeedSlice>>(
    FEED_QUERY_KEY,
    (old) => {
      if (!old?.pages.length) {
        return {
          pages: [
            {
              ...head,
              nextCursor: head.nextCursor,
              hasMore: head.hasMore,
            },
          ],
          pageParams: [null],
        };
      }

      return applyHeadRefreshToInfiniteData(old, head);
    },
  );
}

export function getFlattenedFeedVideos(
  data: InfiniteData<FeedSlice> | undefined,
): FeedVideo[] {
  if (!data?.pages.length) return [];
  return flattenFeedSlices(data.pages);
}

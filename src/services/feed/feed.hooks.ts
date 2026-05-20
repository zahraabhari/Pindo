"use client";

import { enrichFeedVideos } from "@/services/commerce/enrich-product";
import { fetchFeedPage } from "@/services/feed/feed.api";
import { FEED_QUERY_KEY, FEED_SEARCH_QUERY } from "@/services/feed/feed.keys";
import type { FeedPage, FeedVideo } from "@/services/feed/feed.types";
import { playbackEngine } from "@/services/feed/playback-engine";
import { subscribePlaybackEngine, usePlaybackStore } from "@/store/playback-store";
import { useFeedRuntimeStore } from "@/store/feed-runtime-store";
import { useStableCallback } from "@/utils/stable-callback";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export { FEED_QUERY_KEY, FEED_SEARCH_QUERY, feedQueryKey } from "@/services/feed/feed.keys";
export { fetchFeedPage, getLastFeedSource } from "@/services/feed/feed.api";
export type { FeedPage, FeedVideo } from "@/services/feed/feed.types";
export { FeedApiError } from "@/services/feed/feed.types";

export function useFeedInfinite() {
  const query = useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) =>
      fetchFeedPage(pageParam as number, FEED_SEARCH_QUERY),
    initialPageParam: 1,
    getNextPageParam: (last: FeedPage) => last.nextPage ?? undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  const videos: FeedVideo[] = enrichFeedVideos(
    query.data?.pages.flatMap((p) => p.videos) ?? [],
  );

  const feedSource = query.data?.pages[0]?.source ?? "mock";
  const searchQuery =
    query.data?.pages[0]?.searchQuery ?? FEED_SEARCH_QUERY;

  return { ...query, videos, feedSource, searchQuery };
}

export function useFeedOrchestrator() {
  const feedQuery = useFeedInfinite();
  const syncFromEngine = usePlaybackStore((s) => s.syncFromEngine);
  const updateScheduler = useFeedRuntimeStore((s) => s.updateScheduler);
  const resetRuntime = useFeedRuntimeStore((s) => s.reset);
  const feedBootstrappedRef = useRef(false);

  useEffect(() => {
    syncFromEngine();
    return subscribePlaybackEngine();
  }, [syncFromEngine]);

  const bumpScheduler = useStableCallback((activeIndex: number, itemCount: number) => {
    updateScheduler(activeIndex, itemCount);
  });

  const videoCount = feedQuery.videos.length;
  const firstVideoId = feedQuery.videos[0]?.id;

  useEffect(() => {
    if (!firstVideoId || feedBootstrappedRef.current) return;
    feedBootstrappedRef.current = true;
    bumpScheduler(0, videoCount);
    playbackEngine.setActive(0, firstVideoId);
  }, [firstVideoId, videoCount, bumpScheduler]);

  useEffect(() => resetRuntime, [resetRuntime]);

  const onScroll = useFeedRuntimeStore((s) => s.recordScroll);

  const onRangeChanged = useStableCallback(
    (range: { startIndex: number; endIndex: number }) => {
      const { videos } = feedQuery;
      if (videos.length === 0) return;

      const activeIndex = Math.round((range.startIndex + range.endIndex) / 2);
      bumpScheduler(activeIndex, videos.length);

      if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
        const depth = (activeIndex + 1) / videos.length;
        if (depth >= 0.85) {
          void feedQuery.fetchNextPage();
        }
      }
    },
  );

  const onVisibilityChange = useStableCallback(
    (index: number, video: FeedVideo, ratio: number) => {
      if (ratio >= 0.5) {
        const { activeVideoId, activeIndex } = playbackEngine.getState();
        if (activeVideoId !== video.id || activeIndex !== index) {
          playbackEngine.setActive(index, video.id);
          bumpScheduler(index, feedQuery.videos.length);
        }
      } else if (ratio < 0.2 && playbackEngine.isActive(video.id)) {
        playbackEngine.clearActive(video.id);
      }
    },
  );

  return {
    ...feedQuery,
    onScroll,
    onRangeChanged,
    onVisibilityChange,
  };
}

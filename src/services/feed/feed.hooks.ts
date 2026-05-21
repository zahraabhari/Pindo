"use client";

import { enrichFeedVideos } from "@/services/commerce/enrich-product";
import { refreshFeedStreamHead } from "@/services/feed/feed-cache";
import { fetchFeedSlice } from "@/services/feed/feed.api";
import { FEED_QUERY_KEY, FEED_SEARCH_QUERY } from "@/services/feed/feed.keys";
import { flattenFeedSlices } from "@/services/feed/feed.stream";
import { FeedApiError, type FeedSlice, type FeedVideo } from "@/services/feed/feed.types";
import { playbackEngine } from "@/services/feed/playback-engine";
import {
  FEED_GC_TIME_MS,
  FEED_STALE_TIME_MS,
  isNetworkOnline,
  refetchWhenOnline,
  shouldRetryQuery,
} from "@/services/query/query-config";
import { subscribePlaybackEngine, usePlaybackStore } from "@/store/playback-store";
import { useFeedRuntimeStore } from "@/store/feed-runtime-store";
import { useStableCallback } from "@/utils/stable-callback";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

export { FEED_QUERY_KEY, FEED_SEARCH_QUERY, feedQueryKey } from "@/services/feed/feed.keys";
export { fetchFeedSlice, fetchFeedHead, getLastFeedSource } from "@/services/feed/feed.api";
export type { FeedSlice, FeedVideo } from "@/services/feed/feed.types";
export { FeedApiError } from "@/services/feed/feed.types";

const INITIAL_CURSOR = null as string | null;

export function useFeedInfinite() {
  const queryClient = useQueryClient();
  const [isHeadRefreshing, setIsHeadRefreshing] = useState(false);

  const query = useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) => {
      const cursor = pageParam as string | null;
      if (cursor !== null && !isNetworkOnline()) {
        return Promise.resolve({
          items: [],
          nextCursor: null,
          hasMore: false,
          source: "cache" as const,
        });
      }
      return fetchFeedSlice(cursor, FEED_SEARCH_QUERY);
    },
    initialPageParam: INITIAL_CURSOR,
    getNextPageParam: (last: FeedSlice) =>
      last.hasMore && last.nextCursor ? last.nextCursor : undefined,
    staleTime: FEED_STALE_TIME_MS,
    gcTime: FEED_GC_TIME_MS,
    networkMode: "offlineFirst",
    structuralSharing: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount) => shouldRetryQuery(failureCount),
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  const videos: FeedVideo[] = enrichFeedVideos(
    flattenFeedSlices(query.data?.pages ?? []),
  );

  const firstSlice = query.data?.pages[0];
  const upstreamSource = firstSlice?.source ?? "mock";
  const feedSource =
    query.isError && videos.length > 0 ? "cache" : upstreamSource;
  const searchQuery = firstSlice?.searchQuery ?? FEED_SEARCH_QUERY;

  const hasCachedVideos = videos.length > 0;
  const isOnline = isNetworkOnline();

  const isInitialLoading = !hasCachedVideos && query.isPending && !query.isError;

  const isBackgroundRefreshing = isOnline && isHeadRefreshing;

  const runHeadSync = useStableCallback(async () => {
    if (!refetchWhenOnline()) return;
    if (!query.data?.pages.length || !query.isStale) return;
    if (isHeadRefreshing || query.isFetchingNextPage) return;

    setIsHeadRefreshing(true);
    try {
      await refreshFeedStreamHead(queryClient);
    } finally {
      setIsHeadRefreshing(false);
    }
  });

  useEffect(() => {
    void runHeadSync();
  }, [runHeadSync]);

  useEffect(() => {
    const onFocus = () => void runHeadSync();
    const onOnline = () => void runHeadSync();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [runHeadSync]);

  return {
    ...query,
    videos,
    feedSource,
    searchQuery,
    hasCachedVideos,
    isInitialLoading,
    isBackgroundRefreshing,
    isHeadRefreshing,
    isOnline,
  };
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
      const { videos, isOnline } = feedQuery;
      if (videos.length === 0) return;

      const activeIndex = Math.round((range.startIndex + range.endIndex) / 2);
      bumpScheduler(activeIndex, videos.length);

      if (
        isOnline &&
        feedQuery.hasNextPage &&
        !feedQuery.isFetchingNextPage &&
        !feedQuery.isHeadRefreshing
      ) {
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

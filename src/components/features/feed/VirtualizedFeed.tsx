"use client";

import { FeedItem } from "@/components/features/feed/FeedItem";
import { FeedScroller } from "@/components/features/feed/FeedScroller";
import { FeedSkeleton } from "@/components/features/feed/FeedSkeleton";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { OfflineEmptyState } from "@/components/features/shared/OfflineEmptyState";
import { FeedApiError, useFeedOrchestrator } from "@/services/feed/feed.hooks";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useViewportHeight } from "@/hooks/use-viewport-height";
import { Typography } from "@/components/ui";
import type { FeedVideo } from "@/types/feed";
import { useCallback, useEffect, useState } from "react";
import { Virtuoso, type ListRange } from "react-virtuoso";

/**
 * Virtualized feed (react-virtuoso)
 *
 * Tradeoffs documented for review:
 *
 * react-virtuoso vs @tanstack/react-virtual:
 *   + Built-in rangeChanged / infinite scroll ergonomics
 *   + `fixedItemHeight` avoids measurement churn for 100dvh rows
 *   + `increaseViewportBy` controls overscan buffer explicitly
 *   - Less manual control over exact recycle semantics than raw virtual
 *
 * vs native CSS scroll-snap only:
 *   Virtuoso caps DOM node count — critical for 1000+ item feeds.
 *
 * Playback state: keyed by video.id in playback engine + pooled <video>,
 * NOT by React tree position — survives index shifts after pagination.
 */
export function VirtualizedFeed() {
  const {
    videos,
    onRangeChanged,
    onVisibilityChange,
    feedSource,
    searchQuery,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    hasCachedVideos,
    isInitialLoading,
    isBackgroundRefreshing,
    isFetching,
    isSuccess,
  } = useFeedOrchestrator();
  const { isOffline } = useOnlineStatus();
  const itemHeight = useViewportHeight();
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  const itemContent = useCallback(
    (index: number, video: FeedVideo) => (
      <FeedItem
        index={index}
        video={video}
        style={{ height: itemHeight }}
        onVisibilityChange={onVisibilityChange}
      />
    ),
    [itemHeight, onVisibilityChange],
  );

  const handleRangeChanged = useCallback(
    (range: ListRange) => {
      onRangeChanged({ startIndex: range.startIndex, endIndex: range.endIndex });
    },
    [onRangeChanged],
  );

  if (!clientReady || isInitialLoading) {
    return <FeedSkeleton />;
  }

  if (isOffline && videos.length === 0) {
    return (
      <OfflineEmptyState
        title="You're offline"
        description="Browse reels here after you've loaded the feed while online. Your last session will appear on refresh."
        onRetry={() => void refetch()}
      />
    );
  }

  if (isError && videos.length === 0) {
    const apiError =
      error != null && error instanceof FeedApiError ? error : null;

    return (
      <div className="flex h-dvh items-center justify-center">
        <EmptyState
          icon="error"
          title={
            apiError?.code === "missing_api_key"
              ? "Pexels API key required"
              : "Could not load feed"
          }
          description={
            apiError?.message ??
            "Add PEXELS_API_KEY to .env.local and restart pnpm dev."
          }
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  if (!isOffline && videos.length === 0 && !isFetching && isSuccess) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <EmptyState
          icon="empty"
          title="No reels yet"
          description={`Nothing matched "${searchQuery}". Try another topic or pull to refresh.`}
          actionLabel="Refresh feed"
          onAction={() => void refetch()}
        />
      </div>
    );
  }

  const statusCaption = isOffline && hasCachedVideos
    ? `${searchQuery} · saved offline`
    : isBackgroundRefreshing
      ? "Updating feed…"
      : `${searchQuery} · ${feedSource}`;

  return (
    <>
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-center pt-3">
        <Typography
          variant="caption-md"
          as="span"
          className="rounded-full bg-black/50 px-3 py-1 backdrop-blur"
        >
          {statusCaption}
        </Typography>
      </div>
      <Virtuoso
        data={videos}
        style={{ height: "100dvh", width: "100%" }}
        fixedItemHeight={itemHeight}
        increaseViewportBy={{ top: itemHeight, bottom: itemHeight * 2 }}
        defaultItemHeight={itemHeight}
        rangeChanged={handleRangeChanged}
        atBottomStateChange={(atBottom) => {
          if (atBottom && hasNextPage && !isFetchingNextPage && !isOffline) {
            void fetchNextPage();
          }
        }}
        components={{
          Scroller: FeedScroller,
          Footer: () =>
            isFetchingNextPage ? (
              <div className="py-6 text-center text-sm text-white/50">
                Loading more…
              </div>
            ) : isOffline && hasNextPage ? (
              <div className="py-6 text-center text-sm text-white/40">
                More reels load when you&apos;re back online
              </div>
            ) : null,
        }}
        itemContent={itemContent}
      />
    </>
  );
}

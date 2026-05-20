"use client";

import { FeedItem } from "@/components/features/feed/FeedItem";
import { FeedScroller } from "@/components/features/feed/FeedScroller";
import { FeedSkeleton } from "@/components/features/feed/FeedSkeleton";
import { FeedApiError, useFeedOrchestrator } from "@/services/feed/feed.hooks";
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
    isPending,
    isFetching,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFeedOrchestrator();
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

  const showInitialSkeleton =
    videos.length === 0 &&
    !isError &&
    (isPending || isFetching);

  if (showInitialSkeleton || !clientReady) {
    return <FeedSkeleton />;
  }

  if (isError && videos.length === 0) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-2 text-white/80">
        <p className="text-lg font-medium text-white">
          {error instanceof FeedApiError &&
          error.code === "missing_api_key"
            ? "Pexels API key required"
            : "Could not load feed"}
        </p>
        <p className="max-w-sm px-4 text-center text-sm text-white/60">
          {error instanceof FeedApiError
            ? error.message
            : "Add PEXELS_API_KEY to .env.local and restart pnpm dev."}
        </p>
        <button
          type="button"
          className="rounded bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-center pt-3">
        <Typography
          variant="caption-md"
          as="span"
          className="rounded-full bg-black/50 px-3 py-1 backdrop-blur"
        >
          {isFetching && !isFetchingNextPage
            ? "Refreshing…"
            : `${searchQuery} · ${feedSource}`}
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
          if (atBottom && hasNextPage && !isFetchingNextPage) {
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
            ) : null,
        }}
        itemContent={itemContent}
      />
    </>
  );
}

"use client";

import { fetchDiscoveryPage } from "@/services/search/search.api";
import {
  discoveryQueryKey,
  normalizedDiscoveryQuery,
} from "@/services/search/search.keys";
import type { DiscoveryItem, DiscoveryPage } from "@/services/search/search.types";
import {
  getVisiblePlacedItems,
  layoutMasonryItems,
  type MasonryPlacedItem,
} from "@/services/search/search.layout";
import { useStableCallback } from "@/utils/stable-callback";
import {
  DISCOVER_GC_TIME_MS,
  DISCOVER_STALE_TIME_MS,
  refetchWhenOnline,
  shouldRetryQuery,
} from "@/services/query/query-config";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export { discoveryQueryKey, normalizedDiscoveryQuery } from "@/services/search/search.keys";
export type { DiscoveryItem, DiscoveryPage } from "@/services/search/search.types";

export function useDiscoverySearch(debouncedQuery: string) {
  const q = normalizedDiscoveryQuery(debouncedQuery);

  const query = useInfiniteQuery({
    queryKey: discoveryQueryKey(q),
    queryFn: ({ pageParam, signal }) =>
      fetchDiscoveryPage(q, pageParam as number, signal),
    initialPageParam: 1,
    getNextPageParam: (last: DiscoveryPage) => last.nextPage ?? undefined,
    staleTime: DISCOVER_STALE_TIME_MS,
    gcTime: DISCOVER_GC_TIME_MS,
    networkMode: "offlineFirst",
    structuralSharing: true,
    refetchOnMount: refetchWhenOnline,
    refetchOnWindowFocus: refetchWhenOnline,
    refetchOnReconnect: refetchWhenOnline,
    retry: shouldRetryQuery,
  });

  const items =
    query.data?.pages.flatMap((p) => p.items) ?? [];
  const hasCachedItems = items.length > 0;

  return { ...query, hasCachedItems };
}

/** Half-width column for 2-col masonry inside max-w-md shell */
export function useDiscoverColumnWidth(gap = 24) {
  const [width, setWidth] = useState(180);

  useEffect(() => {
    const measure = () => {
      const shell = Math.min(window.innerWidth, 448);
      setWidth(Math.floor((shell - gap) / 2));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [gap]);

  return width;
}

const OVERSCAN = 600;

export function useMasonryScroll(
  items: DiscoveryItem[],
  columnWidth: number,
  onEndReached?: () => void,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);

  const layout = useMemo(
    () => layoutMasonryItems(items, columnWidth),
    [items, columnWidth],
  );

  const visible = useMemo((): MasonryPlacedItem[] => {
    return getVisiblePlacedItems(
      layout.placed,
      scrollTop,
      viewportHeight,
      OVERSCAN,
    );
  }, [layout.placed, scrollTop, viewportHeight]);

  const onScroll = useStableCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setScrollTop(el.scrollTop);
    setViewportHeight(el.clientHeight);

    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining < 280) {
      onEndReached?.();
    }
  });

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollTop(el.scrollTop);
    setViewportHeight(el.clientHeight);
  }, [items.length, columnWidth]);

  return {
    scrollRef,
    onScroll,
    visible,
    totalHeight: layout.totalHeight,
    containerWidth: layout.containerWidth,
  };
}

export type { MasonryPlacedItem };

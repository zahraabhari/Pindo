"use client";

import { DiscoverGrid } from "@/components/features/search/DiscoverGrid";
import { SearchExpandedItem } from "@/components/features/search/SearchExpandedItem";
import { DiscoverSkeleton } from "@/components/features/search/DiscoverSkeleton";
import { SearchBar } from "@/components/features/search/SearchBar";
import { SearchExploreStrip } from "@/components/features/search/SearchExploreStrip";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { OfflineEmptyState } from "@/components/features/shared/OfflineEmptyState";
import { dedupeDiscoveryItems } from "@/services/search/search.dedupe";
import { FEED_SEARCH_QUERY } from "@/services/feed/feed.keys";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useQueryRestore } from "@/hooks/use-query-restore";
import {
  useDiscoverColumnWidth,
  useDiscoverySearch,
} from "@/services/search/search.hooks";
import { useSearchStore } from "@/store/search-store";
import type { DiscoveryItem } from "@/types/discovery";
import { useCallback, useEffect, useMemo, useState } from "react";

export function SearchPage() {
  const [input, setInput] = useState(FEED_SEARCH_QUERY);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const debounced = useDebouncedValue(input, 350);
  const addHistory = useSearchStore((s) => s.addHistory);
  const query = useDiscoverySearch(debounced);
  const { isOffline } = useOnlineStatus();
  const { isRestoring } = useQueryRestore();

  const items = useMemo(
    () =>
      dedupeDiscoveryItems(
        query.data?.pages.flatMap((p) => p.items) ?? [],
      ),
    [query.data],
  );

  const columnWidth = useDiscoverColumnWidth();

  const isDebouncing = input.trim() !== debounced.trim();
  const isFetchingNew =
    query.isFetching && !query.isFetchingNextPage && !query.isError;

  const isInitialLoading =
    !query.hasCachedItems && !query.isError && query.isPending;

  const showSkeleton =
    isRestoring ||
    isInitialLoading ||
    (isDebouncing && !query.hasCachedItems) ||
    (isFetchingNew && !query.hasCachedItems);

  useEffect(() => {
    if (debounced.trim()) addHistory(debounced);
  }, [debounced, addHistory]);

  const selectQuery = useCallback((q: string) => {
    setInput(q);
  }, []);

  const showExplore = !input.trim() || input === FEED_SEARCH_QUERY;
  const activeItem = useMemo<DiscoveryItem | null>(
    () => items.find((it) => it.id === activeItemId) ?? null,
    [items, activeItemId],
  );

  const openItem = useCallback((item: DiscoveryItem) => {
    setActiveItemId(item.id);
  }, []);

  const closeItem = useCallback(() => {
    setActiveItemId(null);
  }, []);

  return (
    <main className="flex h-full flex-col bg-black">
      {!activeItem ? (
        <>
          <SearchBar
            value={input}
            onChange={setInput}
            onClear={() => setInput("")}
          />
          {showExplore && <SearchExploreStrip onSelect={selectQuery} />}
        </>
      ) : null}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {showSkeleton ? (
          <DiscoverSkeleton />
        ) : isOffline && items.length === 0 ? (
          <OfflineEmptyState
            title="You're offline"
            description="Search results you've viewed before will appear here. Try a query you used while online."
            onRetry={() => void query.refetch()}
          />
        ) : query.isError && items.length === 0 ? (
          <EmptyState
            icon="error"
            title="Could not load discover"
            description="Check your connection or try again in a moment."
            actionLabel="Retry"
            onAction={() => void query.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="search"
            title="No results"
            description={`Nothing found for "${debounced}". Try another search or explore a topic below.`}
            actionLabel="Retry"
            onAction={() => void query.refetch()}
          />
        ) : (
          <DiscoverGrid
            items={items}
            columnWidth={columnWidth}
            hasNextPage={query.hasNextPage ?? false}
            isFetchingNextPage={query.isFetchingNextPage}
            onLoadMore={() => {
              if (!isOffline) void query.fetchNextPage();
            }}
            onOpenItem={openItem}
            className={activeItem ? "pointer-events-none opacity-0" : ""}
          />
        )}

        {activeItem ? (
          <SearchExpandedItem item={activeItem} onClose={closeItem} />
        ) : null}
      </div>
    </main>
  );
}

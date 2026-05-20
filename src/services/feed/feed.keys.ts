/** Client-safe default search term (mirrors server PEXELS_SEARCH_QUERY). */
export const FEED_SEARCH_QUERY =
  process.env.NEXT_PUBLIC_FEED_SEARCH_QUERY?.trim() || "nature";

export function feedQueryKey() {
  return ["feed", "videos", "search", FEED_SEARCH_QUERY] as const;
}

export const FEED_QUERY_KEY = feedQueryKey();

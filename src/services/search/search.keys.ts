import { FEED_SEARCH_QUERY } from "@/services/feed/feed.keys";

export function discoveryQueryKey(query: string) {
  return ["discover", query.trim().toLowerCase()] as const;
}

export function normalizedDiscoveryQuery(raw: string) {
  return raw.trim() || FEED_SEARCH_QUERY;
}

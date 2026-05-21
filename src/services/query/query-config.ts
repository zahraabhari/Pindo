/** Shared TanStack Query tuning for feed-style infinite lists */

/** Fresh enough for scroll UX; background SWR when older */
export const FEED_STALE_TIME_MS = 2 * 60 * 1000;

/** In-memory retention within a session (persist layer holds 24h) */
export const FEED_GC_TIME_MS = 30 * 60 * 1000;

export const DISCOVER_STALE_TIME_MS = 2 * 60 * 1000;
export const DISCOVER_GC_TIME_MS = 30 * 60 * 1000;

export function isNetworkOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

export function shouldRetryQuery(failureCount: number, max = 2): boolean {
  if (!isNetworkOnline()) return false;
  return failureCount < max;
}

export function refetchWhenOnline(): boolean {
  return isNetworkOnline();
}

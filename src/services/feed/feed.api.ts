import { fetchMockFeedHead, fetchMockFeedSlice } from "@/services/feed/feed.mock";
import { decodeFeedCursor } from "@/services/feed/feed.cursor";
import { shouldForceMockFeed } from "@/services/pexels/pexels.config";
import { getRequest } from "@/services/api/axios";
import { FEED_SEARCH_QUERY } from "@/services/feed/feed.keys";
import { FeedApiError, type FeedSlice } from "@/services/feed/feed.types";
import { isAxiosError } from "axios";

let lastSuccessfulSource: FeedSlice["source"] = "pexels";

/**
 * Client → GET /api/videos?cursor=<opaque>&query=…
 * Head refresh → GET /api/videos/head?query=…
 */
export async function fetchFeedSlice(
  cursor: string | null,
  query: string = FEED_SEARCH_QUERY,
): Promise<FeedSlice> {
  if (shouldForceMockFeed()) {
    const { page, query: q } = decodeFeedCursor(cursor, query);
    return fetchMockFeedSlice(page, q);
  }

  return fetchFeedSliceFromRoute(cursor, query);
}

export async function fetchFeedHead(
  query: string = FEED_SEARCH_QUERY,
): Promise<FeedSlice> {
  if (shouldForceMockFeed()) {
    return fetchMockFeedHead(query);
  }

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const data = await getRequest<FeedSlice>("/api/videos/head", {
        params: { query },
      });
      lastSuccessfulSource = data.source;
      return data;
    } catch (err) {
      lastError = err;
      const apiErr = toFeedApiError(err);
      if (apiErr.status === 503) throw apiErr;
      await backoff(attempt);
      lastError = apiErr;
    }
  }

  throw lastError instanceof FeedApiError
    ? lastError
    : new FeedApiError("Could not refresh feed", "network_error", 0);
}

async function fetchFeedSliceFromRoute(
  cursor: string | null,
  query: string,
): Promise<FeedSlice> {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const params: { query: string; cursor?: string } = { query };
      if (cursor) params.cursor = cursor;

      const data = await getRequest<FeedSlice>("/api/videos", { params });
      lastSuccessfulSource = data.source;
      return data;
    } catch (err) {
      lastError = err;
      const apiErr = toFeedApiError(err);
      if (apiErr.status === 503) throw apiErr;
      await backoff(attempt);
      lastError = apiErr;
    }
  }

  throw lastError instanceof FeedApiError
    ? lastError
    : new FeedApiError("Could not load feed", "network_error", 0);
}

function toFeedApiError(err: unknown): FeedApiError {
  if (err instanceof FeedApiError) return err;
  if (isAxiosError(err)) {
    const payload = err.response?.data as { error?: string; message?: string } | undefined;
    return new FeedApiError(
      payload?.message ?? err.message ?? "Feed API error",
      payload?.error ?? "http_error",
      err.response?.status ?? 0,
    );
  }
  return err instanceof Error
    ? new FeedApiError(err.message, "network_error", 0)
    : new FeedApiError("Could not load feed", "network_error", 0);
}

function backoff(attempt: number) {
  return new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
}

export function getLastFeedSource() {
  return lastSuccessfulSource;
}

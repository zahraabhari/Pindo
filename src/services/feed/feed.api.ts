import { fetchMockFeedPage } from "@/services/feed/feed.mock";
import { shouldForceMockFeed } from "@/services/pexels/pexels.config";
import { getRequest } from "@/services/api/axios";
import { FEED_SEARCH_QUERY } from "@/services/feed/feed.keys";
import { FeedApiError, type FeedPage } from "@/services/feed/feed.types";
import { isAxiosError } from "axios";

let lastSuccessfulSource: FeedPage["source"] = "pexels";

/**
 * Client → /api/videos?page=1&query=nature → Pexels /videos/search
 */
export async function fetchFeedPage(
  page: number,
  query: string = FEED_SEARCH_QUERY,
): Promise<FeedPage> {
  if (shouldForceMockFeed()) {
    return fetchMockFeedPage(page);
  }

  return fetchFeedPageFromRoute(page, query);
}

async function fetchFeedPageFromRoute(
  page: number,
  query: string,
): Promise<FeedPage> {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const data = await getRequest<FeedPage>("/api/videos", {
        params: { page, query },
      });
      lastSuccessfulSource = data.source;
      return data;
    } catch (err) {
      lastError = err;
      const apiErr = toFeedApiError(err);
      if (apiErr.status === 503) {
        throw apiErr;
      }
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

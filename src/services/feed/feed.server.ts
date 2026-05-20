import { fetchMockFeedPage } from "@/services/feed/feed.mock";
import {
  canUsePexelsApi,
  fetchPexelsSearchPage,
  getFeedSearchQuery,
  PexelsApiError,
  shouldForceMockFeed,
} from "@/services/pexels";
import type { FeedPage } from "@/services/feed/feed.types";

export type FeedRouteSuccess = {
  ok: true;
  body: FeedPage;
  headers: Record<string, string>;
};

export type FeedRouteError = {
  ok: false;
  status: number;
  body: { error: string; message: string };
};

export type FeedRouteResult = FeedRouteSuccess | FeedRouteError;

export function parseFeedRouteQuery(
  pageParam: string | null,
  queryParam: string | null,
): { page: number; query: string } {
  return {
    page: Number(pageParam ?? "1"),
    query: getFeedSearchQuery(queryParam),
  };
}

export async function resolveFeedPage(
  page: number,
  query: string,
): Promise<FeedRouteResult> {
  if (shouldForceMockFeed()) {
    const body = await fetchMockFeedPage(page);
    return {
      ok: true,
      body: { ...body, searchQuery: query },
      headers: cacheHeaders(),
    };
  }

  if (!canUsePexelsApi()) {
    return {
      ok: false,
      status: 503,
      body: {
        error: "missing_api_key",
        message:
          "Set PEXELS_API_KEY in .env.local (free: https://www.pexels.com/api/). Restart dev server after saving.",
      },
    };
  }

  try {
    const body = await fetchPexelsSearchPage(page, query);
    return {
      ok: true,
      body,
      headers: {
        ...cacheHeaders(),
        "X-Feed-Source": "pexels",
        "X-Pexels-Upstream": body.upstream,
        "X-Feed-Search-Query": query,
      },
    };
  } catch (err) {
    const message =
      err instanceof PexelsApiError ? err.message : "Pexels request failed";
    const status = err instanceof PexelsApiError && err.status ? err.status : 502;

    console.error("[feed.server]", message, err);

    return {
      ok: false,
      status: status >= 400 && status < 600 ? status : 502,
      body: { error: "pexels_failed", message },
    };
  }
}

function cacheHeaders(): Record<string, string> {
  return { "Cache-Control": "private, max-age=60" };
}

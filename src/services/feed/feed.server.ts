import { decodeFeedCursor } from "@/services/feed/feed.cursor";
import {
  fetchMockFeedHead,
  fetchMockFeedSlice,
} from "@/services/feed/feed.mock";
import {
  canUsePexelsApi,
  fetchPexelsFeedSlice,
  getFeedSearchQuery,
  PexelsApiError,
  shouldForceMockFeed,
} from "@/services/pexels";
import type { FeedSlice } from "@/services/feed/feed.types";

export type FeedRouteSuccess = {
  ok: true;
  body: FeedSlice;
  headers: Record<string, string>;
};

export type FeedRouteError = {
  ok: false;
  status: number;
  body: { error: string; message: string };
};

export type FeedRouteResult = FeedRouteSuccess | FeedRouteError;

export function parseFeedRouteQuery(
  cursorParam: string | null,
  queryParam: string | null,
): { cursor: string | null; query: string } {
  const query = getFeedSearchQuery(queryParam);
  const cursor = cursorParam?.trim() || null;
  return { cursor, query };
}

export async function resolveFeedSlice(
  cursor: string | null,
  query: string,
): Promise<FeedRouteResult> {
  const { page, query: q } = decodeFeedCursor(cursor, query);

  if (shouldForceMockFeed()) {
    const body = await fetchMockFeedSlice(page, q);
    return {
      ok: true,
      body,
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
    const raw = await fetchPexelsFeedSlice(page, q);
    const { upstream, ...body } = raw;
    return {
      ok: true,
      body,
      headers: {
        ...cacheHeaders(),
        "X-Feed-Source": "pexels",
        "X-Pexels-Upstream": upstream,
        "X-Feed-Search-Query": q,
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

/** Fresh stream head for stale-while-revalidate merge (does not reset tail cursors) */
export async function resolveFeedHead(query: string): Promise<FeedRouteResult> {
  const q = getFeedSearchQuery(query);

  if (shouldForceMockFeed()) {
    const body = await fetchMockFeedHead(q);
    return { ok: true, body, headers: cacheHeaders() };
  }

  if (!canUsePexelsApi()) {
    return {
      ok: false,
      status: 503,
      body: {
        error: "missing_api_key",
        message: "Set PEXELS_API_KEY in .env.local.",
      },
    };
  }

  try {
    const raw = await fetchPexelsFeedSlice(1, q);
    const { upstream, ...body } = raw;
    return {
      ok: true,
      body: {
        ...body,
        nextCursor: null,
        hasMore: false,
      },
      headers: {
        ...cacheHeaders(),
        "X-Feed-Source": "pexels",
        "X-Pexels-Upstream": upstream,
        "X-Feed-Refresh": "head",
      },
    };
  } catch (err) {
    const message =
      err instanceof PexelsApiError ? err.message : "Pexels request failed";
    const status = err instanceof PexelsApiError && err.status ? err.status : 502;
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

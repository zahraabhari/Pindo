import {
  getFeedSearchQuery,
  getPexelsApiKey,
  getPexelsSearchUrl,
} from "@/services/pexels/pexels.config";
import { buildNextCursor } from "@/services/feed/feed.cursor";
import { pexelsVideoToFeedVideo } from "@/services/pexels/pexels.mapper";
import type { FeedSlice } from "@/types/feed";
import type { PexelsVideosResponse } from "@/types/pexels";

export class PexelsApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "PexelsApiError";
  }
}

async function fetchPexelsVideosFromUrl(
  upstream: string,
  page: number,
  searchQuery: string,
  perPage: number,
): Promise<FeedSlice & { upstream: string }> {
  const apiKey = getPexelsApiKey();
  if (!apiKey) {
    throw new PexelsApiError(
      "PEXELS_API_KEY is not set. Add it to .env.local — get a free key at https://www.pexels.com/api/",
    );
  }

  const res = await fetch(upstream, {
    headers: { Authorization: apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new PexelsApiError(
      `Pexels API ${res.status}: ${body || res.statusText}`,
      res.status,
    );
  }

  const data = (await res.json()) as PexelsVideosResponse;
  const items = data.videos
    .map(pexelsVideoToFeedVideo)
    .filter((v): v is NonNullable<typeof v> => v !== null);

  if (items.length === 0) {
    throw new PexelsApiError("Pexels returned no playable videos for this cursor");
  }

  const hasMore = Boolean(data.next_page);

  return {
    items,
    nextCursor: buildNextCursor(page, hasMore, searchQuery),
    hasMore,
    source: "pexels",
    upstream,
    searchQuery,
  };
}

export async function fetchPexelsFeedSlice(
  page: number,
  query?: string,
  perPage = 15,
): Promise<FeedSlice & { upstream: string }> {
  const searchQuery = getFeedSearchQuery(query);
  const upstream = getPexelsSearchUrl(searchQuery, page, perPage);
  return fetchPexelsVideosFromUrl(upstream, page, searchQuery, perPage);
}

/** @deprecated Use fetchPexelsFeedSlice */
export async function fetchPexelsSearchPage(
  page: number,
  query?: string,
  perPage = 15,
): Promise<FeedSlice & { upstream: string }> {
  return fetchPexelsFeedSlice(page, query, perPage);
}

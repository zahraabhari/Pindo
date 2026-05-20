import {
  getFeedSearchQuery,
  getPexelsApiKey,
  getPexelsSearchUrl,
} from "@/services/pexels/pexels.config";
import { pexelsVideoToFeedVideo } from "@/services/pexels/pexels.mapper";
import type { FeedPage } from "@/types/feed";
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
  searchQuery?: string,
): Promise<FeedPage & { upstream: string }> {
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
  const videos = data.videos
    .map(pexelsVideoToFeedVideo)
    .filter((v): v is NonNullable<typeof v> => v !== null);

  if (videos.length === 0) {
    throw new PexelsApiError("Pexels returned no playable videos for this page");
  }

  return {
    videos,
    nextPage: data.next_page ? page + 1 : null,
    source: "pexels",
    upstream,
    searchQuery,
  };
}


export async function fetchPexelsSearchPage(
  page: number,
  query?: string,
  perPage = 15,
): Promise<FeedPage & { upstream: string }> {
  const searchQuery = getFeedSearchQuery(query);
  const upstream = getPexelsSearchUrl(searchQuery, page, perPage);
  return fetchPexelsVideosFromUrl(upstream, page, searchQuery);
}

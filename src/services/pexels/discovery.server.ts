import { dedupeDiscoveryItems } from "@/services/search/search.dedupe";
import { isEmptySearchDemoQuery } from "@/services/search/search.empty-demo";
import { fetchMockDiscoveryPage } from "@/services/search/search.mock";
import { PexelsApiError } from "@/services/pexels/pexels.client";
import {
  getPexelsApiKey,
  getPexelsPhotosSearchUrl,
  getPexelsSearchUrl,
} from "@/services/pexels/pexels.config";
import {
  interleaveDiscovery,
  photoToDiscoveryItem,
  videoToDiscoveryItem,
} from "@/services/pexels/discovery.mapper";
import type { DiscoveryPage } from "@/types/discovery";
import type { PexelsPhotosSearchResponse } from "@/types/pexels-photos";
import type { PexelsVideosResponse } from "@/types/pexels";

export async function fetchDiscoveryPageFromPexels(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<DiscoveryPage> {
  if (isEmptySearchDemoQuery(query)) {
    return { items: [], nextPage: null, query, source: "pexels" };
  }

  const apiKey = getPexelsApiKey();
  if (!apiKey) {
    return fetchMockDiscoveryPage(query, page);
  }

  const perPage = 12;
  const headers = { Authorization: apiKey };

  const [photoRes, videoRes] = await Promise.all([
    fetch(getPexelsPhotosSearchUrl(query, page, perPage), {
      headers,
      cache: "no-store",
      signal,
    }),
    fetch(getPexelsSearchUrl(query, page, 8), {
      headers,
      cache: "no-store",
      signal,
    }),
  ]);

  if (!photoRes.ok && !videoRes.ok) {
    throw new PexelsApiError(`Discovery failed: ${photoRes.status}`);
  }

  const photos: ReturnType<typeof photoToDiscoveryItem>[] = [];
  const videos: NonNullable<ReturnType<typeof videoToDiscoveryItem>>[] = [];
  let nextPage: number | null = null;

  if (photoRes.ok) {
    const data = (await photoRes.json()) as PexelsPhotosSearchResponse;
    photos.push(...data.photos.map(photoToDiscoveryItem));
    if (data.next_page) nextPage = page + 1;
  }

  if (videoRes.ok) {
    const data = (await videoRes.json()) as PexelsVideosResponse;
    videos.push(
      ...data.videos
        .map(videoToDiscoveryItem)
        .filter((v): v is NonNullable<typeof v> => v !== null),
    );
    if (!nextPage && data.next_page) nextPage = page + 1;
  }

  const items = dedupeDiscoveryItems(interleaveDiscovery(photos, videos));

  if (items.length === 0 && !isEmptySearchDemoQuery(query)) {
    return fetchMockDiscoveryPage(query, page);
  }

  return {
    items,
    nextPage,
    query,
    source: "pexels",
  };
}

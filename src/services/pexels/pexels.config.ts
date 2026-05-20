/** Server-side Pexels configuration (never expose API key to the client). */

const DEFAULT_PEXELS_API_BASE = "https://api.pexels.com";
const DEFAULT_SEARCH_QUERY = "nature";

export function getPexelsApiBaseUrl(): string {
  return (
    process.env.PEXELS_API_BASE_URL?.trim().replace(/\/$/, "") ||
    DEFAULT_PEXELS_API_BASE
  );
}

export function getFeedSearchQuery(override?: string | null): string {
  const q =
    override?.trim() ||
    process.env.PEXELS_SEARCH_QUERY?.trim() ||
    process.env.NEXT_PUBLIC_FEED_SEARCH_QUERY?.trim() ||
    DEFAULT_SEARCH_QUERY;
  return q || DEFAULT_SEARCH_QUERY;
}

export function getPexelsSearchUrl(
  query: string,
  page: number,
  perPage = 15,
): string {
  const url = new URL(`${getPexelsApiBaseUrl()}/videos/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  return url.toString();
}

export function getPexelsPhotosSearchUrl(
  query: string,
  page: number,
  perPage = 15,
): string {
  const url = new URL(`${getPexelsApiBaseUrl()}/v1/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  return url.toString();
}

export function getPexelsPopularUrl(page: number, perPage = 15): string {
  const url = new URL(`${getPexelsApiBaseUrl()}/videos/popular`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  return url.toString();
}

export function getPexelsApiKey(): string | undefined {
  const key = process.env.PEXELS_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

/** Safe on client — used by feed.api.ts to skip network when mocking */
export function shouldForceMockFeed(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_FEED === "true";
}

export function canUsePexelsApi(): boolean {
  return Boolean(getPexelsApiKey()) && !shouldForceMockFeed();
}

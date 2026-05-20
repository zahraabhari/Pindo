import { fetchDiscoveryPageFromPexels, getFeedSearchQuery } from "@/services/pexels";
import type { DiscoveryPage } from "@/services/search/search.types";

export type DiscoverRouteSuccess = {
  ok: true;
  body: DiscoveryPage;
};

export type DiscoverRouteError = {
  ok: false;
  status: number;
  body: { message: string };
};

export type DiscoverRouteResult = DiscoverRouteSuccess | DiscoverRouteError;

export function parseDiscoverRouteQuery(
  pageParam: string | null,
  queryParam: string | null,
): { page: number; query: string } {
  return {
    page: Number(pageParam ?? "1"),
    query: getFeedSearchQuery(queryParam),
  };
}

export async function resolveDiscoverPage(
  page: number,
  query: string,
): Promise<DiscoverRouteResult> {
  try {
    const body = await fetchDiscoveryPageFromPexels(query, page);
    return { ok: true, body };
  } catch (err) {
    console.error("[search.server]", err);
    return {
      ok: false,
      status: 502,
      body: {
        message: err instanceof Error ? err.message : "Discover failed",
      },
    };
  }
}

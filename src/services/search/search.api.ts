import { getRequest } from "@/services/api/axios";
import type { DiscoveryPage } from "@/services/search/search.types";

export async function fetchDiscoveryPage(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<DiscoveryPage> {
  return getRequest<DiscoveryPage>("/api/discover", {
    params: { q: query, page },
    signal,
  });
}

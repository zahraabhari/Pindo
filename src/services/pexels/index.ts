/** Server-side Pexels integration — import from Route Handlers only, not client hooks. */

export {
  canUsePexelsApi,
  getFeedSearchQuery,
  getPexelsApiKey,
  getPexelsPhotosSearchUrl,
  getPexelsPopularUrl,
  getPexelsSearchUrl,
  shouldForceMockFeed,
} from "@/services/pexels/pexels.config";

export {
  fetchPexelsFeedSlice,
  fetchPexelsSearchPage,
  PexelsApiError,
} from "@/services/pexels/pexels.client";
export { pexelsVideoToFeedVideo } from "@/services/pexels/pexels.mapper";
export { fetchDiscoveryPageFromPexels } from "@/services/pexels/discovery.server";

import type { ProductMeta } from "@/types/commerce";

export type DiscoveryMediaType = "image" | "video" | "product";

export interface DiscoveryItem {
  id: string;
  type: DiscoveryMediaType;
  title: string;
  thumbnail: string;
  width: number;
  height: number;
  aspectRatio: number;
  videoSrc?: string;
  product?: ProductMeta;
}

export interface DiscoveryPage {
  items: DiscoveryItem[];
  nextPage: number | null;
  query: string;
  source: "pexels" | "mock";
}

export interface MasonryRow {
  id: string;
  left: DiscoveryItem | null;
  right: DiscoveryItem | null;
  estimatedHeight: number;
}

import type { ProductMeta } from "@/types/commerce";



export interface FeedVideo {
  id: string;
  key: string;
  title: string;
  author: string;
  src: string;
  poster: string;
  width: number;
  height: number;
  duration: number;
  product?: ProductMeta;
}

export interface FeedPage {
  videos: FeedVideo[];
  nextPage: number | null;
  source: "pexels" | "mock" | "cache";
  upstream?: string;
  searchQuery?: string;
}

export type PreloadTier = "none" | "metadata" | "auto";

export interface SchedulerSnapshot {
  activeIndex: number;
  itemCount: number;
  velocity: number;
  isIdle: boolean;
  isFastScroll: boolean;
}

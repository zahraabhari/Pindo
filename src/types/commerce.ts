export interface ProductMeta {
  username: string;
  productTitle: string;
  shortDescription?: string;
  caption: string;
  hashtags: string[];
  musicTrack?: string;
  priceLabel: string;
}

export interface Comment {
  id: string;
  videoId: string;
  username: string;
  text: string;
  createdAt: string;
  likes: number;
}

export type PurchasePhase = "idle" | "pending" | "success";

export interface PurchaseSession {
  videoId: string;
  productTitle: string;
  username: string;
  phase: PurchasePhase;
}

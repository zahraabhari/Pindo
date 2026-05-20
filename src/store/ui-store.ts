import { create } from "zustand";

type SheetType = "none" | "comments" | "purchase" | "cart";

export type PurchaseIntent = "order" | "message";

export interface PurchaseProductSnapshot {
  productTitle: string;
  sellerUsername: string;
}

interface UiStore {
  sheet: SheetType;
  activeVideoId: string | null;
  purchaseSnapshot: PurchaseProductSnapshot | null;
  purchaseIntent: PurchaseIntent;
  openComments: (videoId: string) => void;
  openCart: () => void;
  openPurchase: (videoId: string) => void;
  openMessageSeller: (videoId: string) => void;
  openPurchaseWithSnapshot: (
    videoId: string,
    snapshot: PurchaseProductSnapshot,
    intent?: PurchaseIntent,
  ) => void;
  closeSheet: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  sheet: "none",
  activeVideoId: null,
  purchaseSnapshot: null,
  purchaseIntent: "order",
  openComments: (videoId) =>
    set({
      sheet: "comments",
      activeVideoId: videoId,
      purchaseSnapshot: null,
      purchaseIntent: "order",
    }),
  openCart: () =>
    set({
      sheet: "cart",
      activeVideoId: null,
      purchaseSnapshot: null,
      purchaseIntent: "order",
    }),
  openPurchase: (videoId) =>
    set({
      sheet: "purchase",
      activeVideoId: videoId,
      purchaseSnapshot: null,
      purchaseIntent: "order",
    }),
  openMessageSeller: (videoId) =>
    set({
      sheet: "purchase",
      activeVideoId: videoId,
      purchaseSnapshot: null,
      purchaseIntent: "message",
    }),
  openPurchaseWithSnapshot: (videoId, snapshot, intent = "order") =>
    set({
      sheet: "purchase",
      activeVideoId: videoId,
      purchaseSnapshot: snapshot,
      purchaseIntent: intent,
    }),
  closeSheet: () =>
    set({
      sheet: "none",
      activeVideoId: null,
      purchaseSnapshot: null,
      purchaseIntent: "order",
    }),
}));

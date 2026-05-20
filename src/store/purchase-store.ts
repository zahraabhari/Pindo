
import { create } from "zustand";
import type { PurchasePhase, PurchaseSession } from "@/types/commerce";

interface PurchaseStore {
  session: PurchaseSession | null;
  startPurchase: (videoId: string, productTitle: string, username: string) => void;
  setPhase: (phase: PurchasePhase) => void;
  reset: () => void;
}

let purchaseTimer: ReturnType<typeof setTimeout> | null = null;

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  session: null,

  startPurchase: (videoId, productTitle, username) => {
    if (purchaseTimer) clearTimeout(purchaseTimer);

    set({
      session: {
        videoId,
        productTitle,
        username,
        phase: "pending",
      },
    });

    purchaseTimer = setTimeout(() => {
      const current = get().session;
      if (current?.videoId === videoId && current.phase === "pending") {
        set({
          session: { ...current, phase: "success" },
        });
      }
    }, 2500);
  },

  setPhase: (phase) => {
    const s = get().session;
    if (!s) return;
    set({ session: { ...s, phase } });
  },

  reset: () => {
    if (purchaseTimer) clearTimeout(purchaseTimer);
    purchaseTimer = null;
    set({ session: null });
  },
}));

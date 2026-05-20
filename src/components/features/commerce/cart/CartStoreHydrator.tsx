"use client";

import { rehydrateCartStore, useCartStore } from "@/store/cart-store";
import { useLayoutEffect } from "react";

/** Client-only cart rehydration — keeps SSR and persisted state in sync */
export function CartStoreHydrator() {
  useLayoutEffect(() => {
    const finish = () => useCartStore.getState().setHasHydrated(true);
    const unsub = useCartStore.persist.onFinishHydration(finish);
    rehydrateCartStore();
    return unsub;
  }, []);

  return null;
}

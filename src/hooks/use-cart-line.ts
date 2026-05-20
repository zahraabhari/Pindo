"use client";

import { useCartStore } from "@/store/cart-store";

/** Per-product cart subscription — only rerenders when this line changes */
export function useCartLine(productId: string) {
  const hydrated = useCartStore((s) => s._hasHydrated);
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.id === productId)?.quantity ?? 0,
  );

  if (!hydrated) {
    return { quantity: 0, inCart: false };
  }

  return { quantity, inCart: quantity > 0 };
}

export function useCartBadgeCount() {
  const hydrated = useCartStore((s) => s._hasHydrated);
  const count = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  return hydrated ? count : 0;
}

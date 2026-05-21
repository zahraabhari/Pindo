import {
  COMMERCE_OFFLINE_MESSAGE,
  isCommerceOnline,
} from "@/lib/commerce/offline-commerce";
import type { CartItem, CartToast } from "@/types/cart";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const STORAGE_KEY = "pindo-cart-v1";

interface CartState {
  items: CartItem[];
  _hasHydrated: boolean;
  toast: CartToast | null;
  addItem: (product: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, delta: number) => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  setHasHydrated: (value: boolean) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      toast: null,

      addItem: (product) => {
        if (!isCommerceOnline()) {
          get().showToast(COMMERCE_OFFLINE_MESSAGE);
          return;
        }

        const existing = get().items.find((i) => i.id === product.id);
        const nextItems = existing
          ? get().items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: i.quantity + (product.quantity || 1) }
                : i,
            )
          : [...get().items, { ...product, quantity: product.quantity || 1 }];

        set({ items: nextItems });
        get().showToast(
          existing
            ? `Added another ${product.name}`
            : `${product.name} added to cart`,
        );
      },

      removeItem: (productId) => {
        const removed = get().items.find((i) => i.id === productId);
        set({ items: get().items.filter((i) => i.id !== productId) });
        if (removed) {
          get().showToast(`${removed.name} removed`);
        }
      },

      clearCart: () => {
        set({ items: [] });
        get().showToast("Cart cleared");
      },

      updateQuantity: (productId, delta) => {
        if (delta > 0 && !isCommerceOnline()) {
          get().showToast(COMMERCE_OFFLINE_MESSAGE);
          return;
        }

        const items = get().items.map((item) => {
          if (item.id !== productId) return item;
          const nextQty = item.quantity + delta;
          return { ...item, quantity: nextQty };
        });

        const target = items.find((i) => i.id === productId);
        if (!target || target.quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({ items });
      },

      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      showToast: (message) => {
        if (toastTimer) clearTimeout(toastTimer);
        const id = Date.now();
        set({ toast: { message, id } });
        toastTimer = setTimeout(() => {
          const current = get().toast;
          if (current?.id === id) set({ toast: null });
          toastTimer = null;
        }, 2200);
      },

      clearToast: () => {
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = null;
        set({ toast: null });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);

/** Call once on client mount before reading persisted cart counts in UI */
export function rehydrateCartStore() {
  void useCartStore.persist.rehydrate();
}

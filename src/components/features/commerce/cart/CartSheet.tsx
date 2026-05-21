"use client";

import { CartCheckoutStatus } from "@/components/features/commerce/cart/CartCheckoutStatus";
import type { CartCheckoutPhase } from "@/components/features/commerce/cart/CartCheckoutStatus";
import { CartLineItem } from "@/components/features/commerce/cart/CartLineItem";
import { BottomSheet } from "@/components/features/commerce/shared/BottomSheet";
import { EmptyState } from "@/components/features/shared/EmptyState";
import { Button, Typography } from "@/components/ui";
import { useCommerceOfflineGuard } from "@/hooks/use-commerce-offline-guard";
import { COMMERCE_OFFLINE_MESSAGE } from "@/lib/commerce/offline-commerce";
import { useCartStore } from "@/store/cart-store";
import { useUiStore } from "@/store/ui-store";
import { useCallback, useEffect, useRef, useState } from "react";

const CHECKOUT_DELAY_MS = 2600;

function formatPrice(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function CartSheet() {
  const sheet = useUiStore((s) => s.sheet);
  const closeSheet = useUiStore((s) => s.closeSheet);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const showToast = useCartStore((s) => s.showToast);
  const { isOffline, guardCommerceAction } = useCommerceOfflineGuard();

  const open = sheet === "cart";
  const [checkoutPhase, setCheckoutPhase] = useState<CartCheckoutPhase>("idle");
  const checkoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalLabel = formatPrice(total);

  const title =
    checkoutPhase === "success"
      ? "Order complete"
      : checkoutPhase === "processing"
        ? "Checkout"
        : count > 0
          ? `Cart (${count})`
          : "Cart";

  useEffect(() => {
    if (!open) {
      setCheckoutPhase("idle");
      if (checkoutTimerRef.current) {
        clearTimeout(checkoutTimerRef.current);
        checkoutTimerRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (checkoutTimerRef.current) clearTimeout(checkoutTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOffline || checkoutPhase === "idle") return;

    if (checkoutTimerRef.current) {
      clearTimeout(checkoutTimerRef.current);
      checkoutTimerRef.current = null;
    }
    setCheckoutPhase("idle");
    showToast(COMMERCE_OFFLINE_MESSAGE);
  }, [isOffline, checkoutPhase, showToast]);

  const handleClear = useCallback(() => {
    if (checkoutPhase !== "idle") return;
    clearCart();
  }, [checkoutPhase, clearCart]);

  const handleCheckout = useCallback(() => {
    if (items.length === 0 || checkoutPhase !== "idle") return;

    guardCommerceAction(() => {
      setCheckoutPhase("processing");
      checkoutTimerRef.current = setTimeout(() => {
        setCheckoutPhase("success");
        clearCart();
        showToast("Purchase successful");
        checkoutTimerRef.current = null;
      }, CHECKOUT_DELAY_MS);
    });
  }, [items.length, checkoutPhase, clearCart, showToast, guardCommerceAction]);

  const handleCheckoutDone = useCallback(() => {
    setCheckoutPhase("idle");
    closeSheet();
  }, [closeSheet]);

  const handleClose = useCallback(() => {
    if (checkoutPhase === "processing") return;
    closeSheet();
  }, [checkoutPhase, closeSheet]);

  return (
    <BottomSheet open={open} onClose={handleClose} title={title}>
      <div className="flex min-h-0 flex-1 flex-col">
        {checkoutPhase !== "idle" ? (
          <CartCheckoutStatus
            phase={checkoutPhase}
            totalLabel={totalLabel}
            onDone={handleCheckoutDone}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="cart"
            title="Your cart is empty"
            description="Tap Add to cart on any reel with a product tag."
            compact
          />
        ) : (
          <>
            <ul className="min-h-0 flex-1 list-none overflow-y-auto overscroll-contain">
              {items.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
            </ul>

            <div className="shrink-0 border-t border-white/10 bg-zinc-900/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <Typography variant="subtitle">Total</Typography>
                <Typography variant="price" className="text-lg tabular-nums">
                  {totalLabel}
                </Typography>
              </div>

              {isOffline && (
                <Typography
                  variant="caption-md"
                  as="p"
                  className="mb-3 text-center text-amber-200/90"
                >
                  {COMMERCE_OFFLINE_MESSAGE}
                </Typography>
              )}

              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={handleCheckout}
                disabled={isOffline}
                className="mb-4 font-bold disabled:opacity-50"
              >
                Checkout · Pay
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={closeSheet}
                >
                  Continue shopping
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={handleClear}
                  className="text-white/60"
                >
                  Clear
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}

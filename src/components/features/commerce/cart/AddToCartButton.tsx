"use client";

import { Button } from "@/components/ui";
import { useCommerceOfflineGuard } from "@/hooks/use-commerce-offline-guard";
import { feedVideoToCartItem } from "@/lib/commerce/feed-to-cart-item";
import { useCartLine } from "@/hooks/use-cart-line";
import { useCartStore } from "@/store/cart-store";
import type { FeedVideo } from "@/types/feed";
import { cn } from "@/lib/cn";
import { useCallback, useState } from "react";

interface AddToCartButtonProps {
  video: FeedVideo;
  className?: string;
}

export function AddToCartButton({ video, className }: AddToCartButtonProps) {
  const hydrated = useCartStore((s) => s._hasHydrated);
  const { inCart, quantity } = useCartLine(video.id);
  const addItem = useCartStore((s) => s.addItem);
  const { canRunCommerceAction, guardCommerceAction } = useCommerceOfflineGuard();
  const [pop, setPop] = useState(false);

  const handleClick = useCallback(() => {
    const item = feedVideoToCartItem(video);
    if (!item) return;

    const ran = guardCommerceAction(() => {
      setPop(true);
      addItem(item);
      setTimeout(() => setPop(false), 350);
    });
    if (!ran) return;
  }, [video, addItem, guardCommerceAction]);

  const label = !hydrated
    ? "Add to cart"
    : inCart
      ? quantity > 1
        ? `In cart · ${quantity}`
        : "Add more"
      : "Add to cart";

  const showInCartStyle = hydrated && inCart;

  return (
    <Button
      type="button"
      variant={showInCartStyle ? "secondary" : "primary"}
      size="sm"
      onClick={handleClick}
      disabled={!canRunCommerceAction}
      className={cn(
        "font-bold transition-transform duration-200",
        pop ? "scale-105" : "scale-100",
        showInCartStyle && "ring-1 ring-emerald-400/40",
        !canRunCommerceAction && "opacity-60",
        className,
      )}
      aria-label={
        showInCartStyle ? `${label} for ${video.product?.productTitle}` : undefined
      }
      title={!canRunCommerceAction ? "Unavailable while offline" : undefined}
    >
      {label}
    </Button>
  );
}

"use client";

import { Button, Icon } from "@/components/ui";
import { useCartBadgeCount } from "@/hooks/use-cart-line";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { useUiStore } from "@/store/ui-store";
import { useCallback } from "react";

export function CartIconButton() {
  const mounted = useClientMounted();
  const count = useCartBadgeCount();
  const openCart = useUiStore((s) => s.openCart);
  const showBadge = mounted && count > 0;

  const onClick = useCallback(() => {
    openCart();
  }, [openCart]);

  return (
    <Button
      type="button"
      variant="glass"
      size="icon-sm"
      aria-label={showBadge ? `Cart, ${count} items` : "Cart"}
      onClick={onClick}
      className="relative"
    >
      <Icon name="shopping-cart" size="md" />
      {showBadge ? (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold leading-none text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Button>
  );
}

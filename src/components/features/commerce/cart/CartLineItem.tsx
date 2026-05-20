"use client";

import { Button, Typography } from "@/components/ui";
import { useCartStore } from "@/store/cart-store";
import type { CartItem } from "@/types/cart";
import Image from "next/image";
import { memo, useCallback } from "react";

function formatPrice(amount: number) {
  return `$${amount.toFixed(2)}`;
}

interface CartLineItemProps {
  item: CartItem;
}

function CartLineItemInner({ item }: CartLineItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const lineTotal = item.price * item.quantity;

  const onDecrement = useCallback(() => {
    updateQuantity(item.id, -1);
  }, [item.id, updateQuantity]);

  const onIncrement = useCallback(() => {
    updateQuantity(item.id, 1);
  }, [item.id, updateQuantity]);

  const onRemove = useCallback(() => {
    removeItem(item.id);
  }, [item.id, removeItem]);

  return (
    <li className="flex gap-3 border-b border-white/5 px-4 py-3 last:border-0">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            className="object-cover"
            unoptimized
            sizes="64px"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <Typography variant="subtitle" className="line-clamp-2 text-[13px]">
            {item.name}
          </Typography>
          <Typography variant="caption" as="span" className="text-white/50">
            {formatPrice(item.price)} each
          </Typography>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Decrease quantity"
              onClick={onDecrement}
              className="h-8 w-8 min-w-8 text-lg leading-none transition-transform active:scale-90"
            >
              −
            </Button>
            <Typography
              variant="caption-md"
              as="span"
              className="min-w-[1.25rem] text-center tabular-nums"
            >
              {item.quantity}
            </Typography>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Increase quantity"
              onClick={onIncrement}
              className="h-8 w-8 min-w-8 text-lg leading-none transition-transform active:scale-90"
            >
              +
            </Button>
          </div>

          <Typography variant="price" className="text-[13px] tabular-nums">
            {formatPrice(lineTotal)}
          </Typography>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${item.name}`}
        onClick={onRemove}
        className="h-8 w-8 shrink-0 self-start text-white/50 hover:text-white"
      >
        ×
      </Button>
    </li>
  );
}

export const CartLineItem = memo(CartLineItemInner);

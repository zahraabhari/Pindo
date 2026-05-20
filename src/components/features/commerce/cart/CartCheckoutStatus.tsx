"use client";

import { Button, Icon, Typography } from "@/components/ui";

export type CartCheckoutPhase = "idle" | "processing" | "success";

interface CartCheckoutStatusProps {
  phase: CartCheckoutPhase;
  totalLabel: string;
  onDone: () => void;
}

export function CartCheckoutStatus({
  phase,
  totalLabel,
  onDone,
}: CartCheckoutStatusProps) {
  if (phase === "idle") return null;

  if (phase === "processing") {
    return (
      <div
        className="cart-checkout-panel flex flex-col items-center gap-3 px-4 py-6"
        role="status"
        aria-live="polite"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <Icon
            name="loader"
            size="md"
            className="dm-spinner animate-spin text-emerald-400"
          />
        </div>
        <Typography variant="subtitle" className="text-center">
          Please wait…
        </Typography>
        <Typography variant="body-muted" className="text-center text-[13px]">
          Processing {totalLabel}
        </Typography>
      </div>
    );
  }

  return (
    <div
      className="cart-checkout-panel dm-success-in flex flex-col items-center gap-4 px-4 py-6"
      role="status"
      aria-live="polite"
    >
      <span className="dm-check flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/25">
        <Icon name="check" size="lg" className="text-white" />
      </span>
      <div className="space-y-1 text-center">
        <Typography variant="subtitle" className="text-base">
          Purchase successful
        </Typography>
        <Typography variant="body-muted" className="text-[13px]">
          Your order has been placed. Thank you!
        </Typography>
      </div>
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        onClick={onDone}
        className="mt-1 max-w-xs"
      >
        Done
      </Button>
    </div>
  );
}

"use client";

import { BottomSheet } from "@/components/features/commerce/shared/BottomSheet";
import { Button, Icon, Typography } from "@/components/ui";
import { usePurchaseStore } from "@/store/purchase-store";
import { useUiStore } from "@/store/ui-store";
import { useEffect, useMemo } from "react";

export function PurchaseDMModal() {
  const sheet = useUiStore((s) => s.sheet);
  const videoId = useUiStore((s) => s.activeVideoId);
  const purchaseSnapshot = useUiStore((s) => s.purchaseSnapshot);
  const purchaseIntent = useUiStore((s) => s.purchaseIntent);
  const closeSheet = useUiStore((s) => s.closeSheet);

  const session = usePurchaseStore((s) => s.session);
  const startPurchase = usePurchaseStore((s) => s.startPurchase);
  const reset = usePurchaseStore((s) => s.reset);

  const open = sheet === "purchase" && Boolean(videoId);

  const productTitle = useMemo(() => {
    return purchaseSnapshot?.productTitle ?? "this product";
  }, [purchaseSnapshot?.productTitle]);

  const sellerUsername = useMemo(() => {
    return purchaseSnapshot?.sellerUsername ?? "@seller";
  }, [purchaseSnapshot?.sellerUsername]);

  useEffect(() => {
    if (!open || !videoId) return;
    if (purchaseIntent !== "message") return;
    if (session?.videoId === videoId) return;

    const hasSnapshot = Boolean(purchaseSnapshot);
    if (!hasSnapshot) return;

    startPurchase(videoId, productTitle, sellerUsername);
  }, [
    open,
    videoId,
    purchaseIntent,
    purchaseSnapshot,
    productTitle,
    sellerUsername,
    session?.videoId,
    startPurchase,
  ]);

  const handleClose = () => {
    reset();
    closeSheet();
  };

  const phase = session?.videoId === videoId ? session.phase : "pending";
  const isMessage = purchaseIntent === "message";

  const sheetTitle = isMessage ? "Message seller" : "Order via DM";

  const userBubble = isMessage ? (
    <Typography variant="body">
      Hi! I have a question about{" "}
      <span className="font-semibold text-emerald-300">{productTitle}</span>.
    </Typography>
  ) : (
    <Typography variant="body">
      Hi! I&apos;d like to order{" "}
      <span className="font-semibold text-emerald-300">{productTitle}</span>.
    </Typography>
  );

  const pendingBody = isMessage ? (
    <>
      <Typography variant="body">Thanks — we&apos;ll reply in DM shortly.</Typography>
      <div className="flex items-center gap-2 text-white/70">
        <Icon
          name="loader"
          size="sm"
          className="dm-spinner animate-spin text-white/70"
        />
        <Typography variant="caption" as="span">
          Sending…
        </Typography>
      </div>
    </>
  ) : (
    <>
      <Typography variant="body">
        Thanks for your order. Please wait while we process your request.
      </Typography>
      <div className="flex items-center gap-2 text-white/70">
        <Icon
          name="loader"
          size="sm"
          className="dm-spinner animate-spin text-white/70"
        />
        <Typography variant="caption" as="span">
          Processing order…
        </Typography>
      </div>
    </>
  );

  const successTitle = isMessage ? "Message sent" : "Order confirmed";
  const successBody = isMessage
    ? "The seller will respond in DM soon."
    : "Your purchase was completed successfully.";

  return (
    <BottomSheet open={open} onClose={handleClose} title={sheetTitle}>
      <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-3">
            {userBubble}
          </div>
        </div>

        {phase === "pending" && (
          <div className="flex justify-end">
            <div className="max-w-[85%] space-y-3 rounded-2xl rounded-br-sm bg-emerald-600/20 px-4 py-4">
              {pendingBody}
            </div>
          </div>
        )}

        {phase === "success" && (
          <div className="dm-success-in flex justify-end">
            <div className="max-w-[85%] space-y-3 rounded-2xl rounded-br-sm bg-emerald-600/30 px-4 py-4">
              <div className="flex items-center gap-2">
                <span className="dm-check flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                  <Icon name="check" size="sm" className="text-white" />
                </span>
                <Typography variant="subtitle">{successTitle}</Typography>
              </div>
              <Typography variant="body">{successBody}</Typography>
            </div>
          </div>
        )}

        {phase === "success" && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleClose}
            className="mt-2"
          >
            Done
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}

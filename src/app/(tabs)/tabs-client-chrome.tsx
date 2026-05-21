"use client";

import { BottomNav } from "@/components/features/navigation/BottomNav";
import { AppTopBar } from "@/components/features/commerce/cart/AppTopBar";
import { CartSheet } from "@/components/features/commerce/cart/CartSheet";
import { CartStoreHydrator } from "@/components/features/commerce/cart/CartStoreHydrator";
import { CartToast } from "@/components/features/commerce/cart/CartToast";
import { CommentSheet } from "@/components/features/commerce/comments/CommentSheet";
import { PurchaseDMModal } from "@/components/features/commerce/purchase/PurchaseDMModal";
import { OfflineBanner } from "@/components/features/shared/OfflineBanner";

/** Global overlays so feed + search share comments, cart, and DM flows */
export function TabsClientChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartStoreHydrator />
      <OfflineBanner />
      <div className="absolute inset-0">{children}</div>
      <AppTopBar />
      <BottomNav />
      <CommentSheet />
      <CartSheet />
      <CartToast />
      <PurchaseDMModal />
    </>
  );
}

"use client";

import { BottomNav } from "@/components/features/navigation/BottomNav";
import { CommentSheet } from "@/components/features/commerce/comments/CommentSheet";
import { PurchaseDMModal } from "@/components/features/commerce/purchase/PurchaseDMModal";
import { memo } from "react";

/** Global overlays so feed + search share comments + purchase flows */
function TabsClientChromeInner({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="absolute inset-0">{children}</div>
      <BottomNav />
      <CommentSheet />
      <PurchaseDMModal />
    </>
  );
}

export const TabsClientChrome = memo(TabsClientChromeInner);

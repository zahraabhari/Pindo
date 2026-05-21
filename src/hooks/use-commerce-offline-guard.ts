"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  COMMERCE_OFFLINE_MESSAGE,
  isCommerceOnline,
} from "@/lib/commerce/offline-commerce";
import { useCartStore } from "@/store/cart-store";
import { useCallback } from "react";

export { COMMERCE_OFFLINE_MESSAGE };


export function useCommerceOfflineGuard() {
  const { isOffline } = useOnlineStatus();
  const showToast = useCartStore((s) => s.showToast);

  const notifyOffline = useCallback(() => {
    showToast(COMMERCE_OFFLINE_MESSAGE);
  }, [showToast]);

  const guardCommerceAction = useCallback(
    (action: () => void): boolean => {
      if (!isCommerceOnline()) {
        notifyOffline();
        return false;
      }
      action();
      return true;
    },
    [notifyOffline],
  );

  return {
    isOffline,
    canRunCommerceAction: !isOffline,
    notifyOffline,
    guardCommerceAction,
  };
}

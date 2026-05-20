"use client";

import { Typography } from "@/components/ui";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { useCartStore } from "@/store/cart-store";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const toastTransition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function CartToast() {
  const mounted = useClientMounted();
  const toast = useCartStore((s) => s.toast);
  const isSearch = usePathname() === "/search";

  if (!mounted) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[110] flex justify-center px-4 ${
        isSearch
          ? "pt-[calc(max(0.5rem,env(safe-area-inset-top))+4.5rem)]"
          : "pt-[calc(max(0.75rem,env(safe-area-inset-top))+3.5rem)]"
      }`}
    >
      <AnimatePresence mode="wait">
        {toast ? (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={toastTransition}
            className="w-full max-w-sm"
          >
            <div className="rounded-full bg-zinc-900/95 px-4 py-2.5 text-center shadow-lg ring-1 ring-white/10 backdrop-blur-md">
              <Typography variant="caption-md" as="span" className="text-white/90">
                {toast.message}
              </Typography>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

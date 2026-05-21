"use client";

import { Typography } from "@/components/ui";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";

const bannerTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function OfflineBanner() {
  const mounted = useClientMounted();
  const { isOffline } = useOnlineStatus();

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[105] flex justify-center px-4 pt-[calc(max(0.5rem,env(safe-area-inset-top))+3.25rem)]"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {isOffline ? (
          <motion.div
            key="offline"
            role="status"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={bannerTransition}
            className="w-full max-w-sm"
          >
            <div className="flex items-center justify-center gap-2 rounded-full bg-zinc-900/95 px-4 py-2 shadow-lg ring-1 ring-amber-500/25 backdrop-blur-md">
              <WifiOff className="size-3.5 shrink-0 text-amber-400/90" aria-hidden />
              <Typography variant="caption-md" as="span" className="text-white/90">
                You&apos;re offline — showing saved content
              </Typography>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

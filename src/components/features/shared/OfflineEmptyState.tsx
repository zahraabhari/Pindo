"use client";

import { Typography } from "@/components/ui";
import { WifiOff } from "lucide-react";

type OfflineEmptyStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function OfflineEmptyState({
  title = "You're offline",
  description = "Connect to load new content. Previously viewed items appear here after you've browsed online.",
  onRetry,
}: OfflineEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <WifiOff className="size-8 text-white/35" aria-hidden />
      <Typography variant="body" as="p" className="font-medium text-white/85">
        {title}
      </Typography>
      <Typography variant="body-muted" as="p" className="max-w-xs text-[13px]">
        {description}
      </Typography>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 hover:bg-white/15"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

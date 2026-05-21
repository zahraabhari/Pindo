"use client";

import { EmptyState } from "@/components/features/shared/EmptyState";

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
    <EmptyState
      icon="offline"
      title={title}
      description={description}
      onAction={onRetry}
    />
  );
}

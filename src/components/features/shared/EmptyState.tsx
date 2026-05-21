"use client";

import { Button, Typography } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Film,
  MessageCircle,
  SearchX,
  ShoppingCart,
  WifiOff,
} from "lucide-react";

export type EmptyStateIcon =
  | "offline"
  | "error"
  | "empty"
  | "search"
  | "comments"
  | "cart";

const ICONS: Record<EmptyStateIcon, LucideIcon> = {
  offline: WifiOff,
  error: AlertCircle,
  empty: Film,
  search: SearchX,
  comments: MessageCircle,
  cart: ShoppingCart,
};

export type EmptyStateProps = {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  icon = "empty",
  title,
  description,
  actionLabel = "Try again",
  onAction,
  className,
  compact = false,
}: EmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 text-center",
        compact ? "py-8" : "py-16",
        className,
      )}
    >
      <Icon className="size-8 text-white/35" aria-hidden />
      <Typography variant="body" as="p" className="font-medium text-white/85">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body-muted" as="p" className="max-w-xs text-[13px]">
          {description}
        </Typography>
      ) : null}
      {onAction ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onAction}
          className="mt-1"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

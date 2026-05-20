"use client";

import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

const roundedMap = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: keyof typeof roundedMap;
}

export function Skeleton({ className, rounded = "lg", ...props }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer bg-zinc-800/90", roundedMap[rounded], className)}
      aria-hidden
      {...props}
    />
  );
}

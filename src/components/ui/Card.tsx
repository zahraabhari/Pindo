"use client";

import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

export type CardVariant = "surface" | "glass" | "elevated" | "ghost";

const variantStyles: Record<CardVariant, string> = {
  surface: "bg-zinc-900",
  glass: "bg-black/40 backdrop-blur",
  elevated: "bg-zinc-800 shadow-lg",
  ghost: "bg-transparent",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md";
}

export function Card({
  variant = "surface",
  padding = "none",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden",
        variantStyles[variant],
        padding === "sm" && "p-2",
        padding === "md" && "p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

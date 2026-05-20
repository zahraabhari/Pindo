"use client";

import { cn } from "@/lib/cn";
import { type HTMLAttributes } from "react";

const textVariants = {
  caption: "text-[10px] text-white/40",
  "caption-md": "text-[11px] text-white/70",
  body: "text-sm text-white/90",
  "body-muted": "text-sm text-white/70",
  label: "text-xs font-semibold text-white/80",
  price: "text-xs text-emerald-300",
  hashtag: "text-xs text-sky-300/90",
  title: "text-sm font-bold text-white",
  subtitle: "text-sm font-semibold text-white/95",
  heading: "text-center text-sm font-semibold text-white",
} as const;

export type TextVariant = keyof typeof textVariants;
export type TypographyTag = "p" | "span" | "h1" | "h2" | "h3";

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TypographyTag;
  truncate?: boolean;
}

export function Typography({
  variant = "body",
  as: Tag = "p",
  truncate = false,
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={cn(textVariants[variant], truncate && "truncate", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

"use client";

import { cn } from "@/lib/cn";
import { tokens } from "@/lib/tokens";
import type { LucideIcon, LucideProps } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { createElement, memo } from "react";

function toPascalCase(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function resolveIcon(name: string): LucideIcon | null {
  const key = toPascalCase(name);
  const candidate = (LucideIcons as Record<string, unknown>)[key];
  if (candidate == null) return null;
  if (typeof candidate === "function") return candidate as LucideIcon;
  if (
    typeof candidate === "object" &&
    "$$typeof" in candidate &&
    typeof (candidate as { $$typeof: unknown }).$$typeof === "symbol"
  )
    return candidate as LucideIcon;
  return null;
}

const SIZE_PX = {
  sm: tokens.icon.sm,
  md: tokens.icon.md,
  lg: tokens.icon.lg,
} as const;

export type IconSize = keyof typeof SIZE_PX;
export type IconName = string;

export interface IconProps extends Omit<LucideProps, "size"> {
  name?: IconName;
  icon?: LucideIcon;
  size?: IconSize;
  className?: string;
}

function IconInner({
  name,
  icon: IconProp,
  size = "md",
  className,
  strokeWidth = 2,
  ...props
}: IconProps) {
  const Resolved = name ? resolveIcon(name) : (IconProp ?? null);
  if (!Resolved) return null;

  const px = SIZE_PX[size];

  return createElement(Resolved, {
    width: px,
    height: px,
    strokeWidth,
    className: cn("shrink-0 text-current", className),
    "aria-hidden": props["aria-label"] ? undefined : true,
    ...props,
  });
}

export const Icon = memo(IconInner);

"use client";

import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes } from "react";

const variantStyles = {
  primary:
    "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:opacity-90",
  secondary: "bg-white/10 text-white hover:bg-white/15",
  ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/10",
  glass: "bg-black/40 text-white backdrop-blur hover:bg-black/60",
  icon: "bg-black/40 text-white backdrop-blur hover:bg-black/60",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
  icon: "h-12 w-12 p-0",
  "icon-sm": "h-10 w-10 p-0",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

function Button({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  const rounded =
    variant === "ghost"
      ? "rounded-md"
      : "rounded-full";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition disabled:pointer-events-none disabled:opacity-40",
        rounded,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };

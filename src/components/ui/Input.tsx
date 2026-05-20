"use client";

import { cn } from "@/lib/cn";
import { type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rounded?: "md" | "full";
}

function Input({
  className,
  rounded = "full",
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        "w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40",
        "focus-visible:ring-1 focus-visible:ring-emerald-500/50",
        rounded === "full" ? "rounded-full" : "rounded-lg",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

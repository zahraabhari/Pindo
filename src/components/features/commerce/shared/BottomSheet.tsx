"use client";

import { Typography } from "@/components/ui";
import { memo, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function BottomSheetInner({ open, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="sheet-panel relative z-10 mx-auto flex w-full max-w-md max-h-[85dvh] min-h-[50dvh] flex-col rounded-t-2xl bg-zinc-900 shadow-2xl">
        <div className="flex shrink-0 items-center justify-center py-2">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        <div className="shrink-0 px-4 pb-2 pt-0.5">
          <Typography as="h2" className="text-center text-[13px] font-semibold text-white">
            {title}
          </Typography>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const BottomSheet = memo(BottomSheetInner);

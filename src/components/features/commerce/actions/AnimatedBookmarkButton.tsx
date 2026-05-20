"use client";

import { Button, Icon } from "@/components/ui";
import { useInteractionStore } from "@/store/interaction-store";
import { memo } from "react";

interface AnimatedBookmarkButtonProps {
  itemId: string;
  className?: string;
}

function AnimatedBookmarkButtonInner({ itemId, className }: AnimatedBookmarkButtonProps) {
  const saved = useInteractionStore((s) => s.saved[itemId] ?? false);
  const toggleSave = useInteractionStore((s) => s.toggleSave);

  return (
    <Button
      type="button"
      variant="icon"
      size="icon"
      aria-label={saved ? "Remove bookmark" : "Save"}
      onClick={() => toggleSave(itemId)}
      className={`${saved ? "text-amber-400" : "text-white"} h-10 w-10 ${className ?? ""}`}
    >
      <Icon
        name="bookmark"
        size="sm"
        fill={saved ? "currentColor" : "none"}
        className={saved ? "text-amber-400" : undefined}
      />
    </Button>
  );
}

export const AnimatedBookmarkButton = memo(AnimatedBookmarkButtonInner);

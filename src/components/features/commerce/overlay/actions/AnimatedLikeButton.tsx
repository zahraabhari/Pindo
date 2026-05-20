"use client";

import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useInteractionStore } from "@/store/interaction-store";
import { useState } from "react";

interface AnimatedLikeButtonProps {
  videoId: string;
  className?: string;
}

export function AnimatedLikeButton({ videoId, className }: AnimatedLikeButtonProps) {
  const liked = useInteractionStore((s) => s.likes[videoId] ?? false);
  const pending = useInteractionStore((s) => s.pending[videoId] ?? false);
  const toggleLike = useInteractionStore((s) => s.toggleLike);
  const [pop, setPop] = useState(false);

  const handleClick = () => {
    setPop(true);
    void toggleLike(videoId);
    setTimeout(() => setPop(false), 400);
  };

  return (
    <Button
      type="button"
      variant="icon"
      size="icon-sm"
      aria-label={liked ? "Unlike" : "Like"}
      disabled={pending}
      onClick={handleClick}
      className={cn(
        "h-10 w-10 transition-transform duration-200",
        pop ? "scale-125" : "scale-100",
        liked ? "text-rose-500" : "text-white",
        className,
      )}
    >
      <Icon
        name="heart"
        size="sm"
        fill={liked ? "currentColor" : "none"}
        className={liked ? "text-rose-500" : "text-white"}
      />
    </Button>
  );
}

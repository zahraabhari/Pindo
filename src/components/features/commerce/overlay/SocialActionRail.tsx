"use client";

import { AnimatedBookmarkButton } from "@/components/features/commerce/actions/AnimatedBookmarkButton";
import { AnimatedLikeButton } from "@/components/features/commerce/actions/AnimatedLikeButton";
import { Button, Icon, Typography } from "@/components/ui";
import { usePlaybackUi } from "@/hooks/use-playback-ui";
import { useUiStore } from "@/store/ui-store";
import type { FeedVideo } from "@/types/feed";
import { memo } from "react";

interface SocialActionRailProps {
  video: FeedVideo;
  commentCount: number;
  commentsLoading?: boolean;
}

function SocialActionRailInner({
  video,
  commentCount,
  commentsLoading = false,
}: SocialActionRailProps) {
  const openComments = useUiStore((s) => s.openComments);
  const openPurchaseWithSnapshot = useUiStore((s) => s.openPurchaseWithSnapshot);
  const { isActive, showPauseIcon, togglePlayback } = usePlaybackUi(video.id);

  const countLabel =
    commentsLoading && commentCount === 0
      ? "…"
      : commentCount > 0
        ? String(commentCount)
        : null;

  return (
    <div className="pointer-events-auto absolute bottom-28 right-3 flex flex-col items-center gap-2">
      <AnimatedLikeButton videoId={video.id} />

      <Button
        type="button"
        variant="icon"
        size="icon"
        aria-label={
          commentCount > 0
            ? `View ${commentCount} comments`
            : "View comments"
        }
        onClick={() => openComments(video.id)}
        className="h-10 w-10 flex-col gap-0.5"
      >
        <Icon name="message-circle" size="sm" />
        {countLabel !== null && (
          <Typography variant="caption" as="span" className="text-white/80">
            {countLabel}
          </Typography>
        )}
      </Button>

      <AnimatedBookmarkButton itemId={video.id} />

      {isActive && (
        <Button
          type="button"
          variant="icon"
          size="icon-sm"
          aria-label={showPauseIcon ? "Pause video" : "Play video"}
          onClick={togglePlayback}
          className="h-10 w-10"
        >
          <Icon name={showPauseIcon ? "pause" : "play"} size="sm" />
        </Button>
      )}

      <Button
        type="button"
        variant="icon"
        size="icon-sm"
        aria-label="Message seller"
        onClick={() =>
          openPurchaseWithSnapshot(
            video.id,
            {
              productTitle: video.product?.productTitle ?? video.title,
              sellerUsername: video.product?.username ?? `@${video.author}`,
            },
            "message",
          )
        }
        className="h-10 w-10"
      >
        <Icon name="send" size="sm" />
      </Button>

      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() =>
          openPurchaseWithSnapshot(video.id, {
            productTitle: video.product?.productTitle ?? video.title,
            sellerUsername: video.product?.username ?? `@${video.author}`,
          })
        }
        className="font-bold"
      >
        Buy Now
      </Button>
    </div>
  );
}

export const SocialActionRail = memo(SocialActionRailInner);

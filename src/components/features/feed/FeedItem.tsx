"use client";

import { PooledFeedItemMedia } from "@/components/features/video/PooledFeedItemMedia";
import { VideoOverlay } from "@/components/features/video/VideoOverlay";
import { useIntersectionVisibility } from "@/hooks/use-intersection-visibility";
import { useFeedScheduleForIndex } from "@/store/feed-runtime-store";
import type { FeedVideo } from "@/types/feed";
import { memo, useCallback } from "react";

export interface FeedItemProps {
  index: number;
  video: FeedVideo;
  style?: React.CSSProperties;
  onVisibilityChange: (index: number, video: FeedVideo, ratio: number) => void;
}

function FeedItemInner({ index, video, style, onVisibilityChange }: FeedItemProps) {
  const { tier, slot } = useFeedScheduleForIndex(index);
  const onRatio = useCallback(
    (ratio: number) => {
      onVisibilityChange(index, video, ratio);
    },
    [index, video, onVisibilityChange],
  );

  const visibilityRef = useIntersectionVisibility({ onRatioChange: onRatio });

  return (
    <article
      ref={visibilityRef}
      style={style}
      className="relative w-full snap-start snap-always overflow-hidden bg-black"
      data-index={index}
      data-video-id={video.id}
    >
      <PooledFeedItemMedia video={video} tier={tier} slot={slot} />
      <VideoOverlay video={video} />
    </article>
  );
}

export const FeedItem = memo(FeedItemInner, (prev, next) => {
  return (
    prev.video.id === next.video.id &&
    prev.index === next.index &&
    prev.style?.height === next.style?.height &&
    prev.onVisibilityChange === next.onVisibilityChange
  );
});
